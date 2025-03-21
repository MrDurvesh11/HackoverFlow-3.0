import google.generativeai as genai
from dotenv import load_dotenv
import os
import json
import yfinance as yf
import re

def stock_analyzer(stock_name):
    load_dotenv()
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable not found")

    genai.configure(api_key=api_key)

    generation_config = {
        "temperature": 0.9,
        "top_p": 1,
        "top_k": 1,
        "max_output_tokens": 2048,
    }
    safety_settings = [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
    ]

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config=generation_config,
        safety_settings=safety_settings
    )

    convo = model.start_chat(history=[])
    
    # More explicit instructions to ensure proper JSON formatting
    prompt = f"""Analyze the stock/index {stock_name} from latest data.
VERY IMPORTANT: You must respond with ONLY a valid JSON object, no explanations, no markdown formatting, no code blocks.
Your response should be a valid JSON object with the following structure:
{{
    "yfinance_symbol": "",
    "about_company": "",
    "companyName": "",
    "positives": ["", ""],
    "negatives": ["", "", ""],
    "latest_news": [{{"title": "", "description": ""}}, {{"title": "", "description": ""}}],
    "hold_recommendation_percent": "",
    "buy_recommendation_percent": "",
    "sell_recommendation_percent": "",
    "buy_reason": "",
    "sell_reason": "",
    "hold_reason": ""
}}

Make sure ALL values are filled. If you don't have data for a field, use "None" as a string.
The hold, buy, and sell recommendation percentages should add up to 100.
"""
    
    convo.send_message(prompt)
    data = convo.last.text
    
    # Debug the AI response
    print(f"AI response preview (first 200 chars): {data[:200]}...")
    
    # Try to extract and parse the JSON
    try:
        # First attempt: direct parsing
        json_data = json.loads(data)
    except json.JSONDecodeError:
        # Second attempt: try to extract JSON from possible text wrapping
        try:
            # Find content between curly braces (including nested braces)
            json_pattern = re.search(r'(\{.*\})', data, re.DOTALL)
            if json_pattern:
                potential_json = json_pattern.group(1)
                json_data = json.loads(potential_json)
            else:
                # Third attempt: look for JSON with code block markers
                code_block_pattern = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', data, re.DOTALL)
                if code_block_pattern:
                    potential_json = code_block_pattern.group(1)
                    json_data = json.loads(potential_json)
                else:
                    print(f"Full AI response: {data}")
                    raise ValueError("Could not extract valid JSON from the AI response")
        except Exception as e:
            print(f"Full AI response: {data}")
            raise ValueError(f"Failed to parse JSON from AI response: {str(e)}")

    try:
        # Ensure yfinance_symbol is valid
        ticker_symbol = json_data.get("yfinance_symbol", stock_name)
        stock = yf.Ticker(ticker_symbol)
        
        # Get stock data and handle potential missing fields
        stock_history = stock.history(period="1d")
        stock_info = stock.info
        
        # Safely extract data with fallbacks
        json_data["current_price"] = float(stock_history["Close"].iloc[-1]) if not stock_history.empty else "None"
        json_data["open"] = float(stock_history["Open"].iloc[0]) if not stock_history.empty else "None"
        json_data["volume"] = int(stock_history["Volume"].iloc[0]) if not stock_history.empty else "None"
        
        # Handle potentially missing fields with safer access
        json_data["market_cap"] = stock_info.get("marketCap", "None")
        json_data["pe_ratio"] = stock_info.get("trailingPE", "None")
        json_data["52_week_high"] = stock_info.get("fiftyTwoWeekHigh", "None")
        json_data["52_week_low"] = stock_info.get("fiftyTwoWeekLow", "None")
        
        return json_data
    except Exception as e:
        print(f"Error getting stock data: {str(e)}")
        # Return the AI-generated data without the stock data enrichment
        json_data["error"] = f"Could not fetch stock data: {str(e)}"
        return json_data