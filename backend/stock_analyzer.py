import google.generativeai as genai
from dotenv import load_dotenv
import os
import json
import yfinance as yf
import re
from datetime import datetime
import pytz

def stock_analyzer(stock_name, user_login="MrDurvesh11"):
    # Get current UTC time
    utc_now = datetime.now(pytz.UTC).strftime('%Y-%m-%d %H:%M:%S')
    
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
    
    prompt = f"""Analyze the stock/index {stock_name} from latest data.
Current UTC Time: {utc_now}
Analysis Requested by User: {user_login}

VERY IMPORTANT: You must respond with ONLY a valid JSON object, no explanations, no markdown formatting, no code blocks.
Your response should be a valid JSON object with the following structure:
{{
    "analysis_metadata": {{
        "timestamp_utc": "{utc_now}",
        "requested_by": "{user_login}",
        "stock_analyzed": "{stock_name}"
    }},
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
    "hold_reason": "",
    "technical_analysis": {{
        "trend": "",
        "support_levels": ["", ""],
        "resistance_levels": ["", ""],
        "moving_averages": {{
            "MA20": "",
            "MA50": "",
            "MA200": ""
        }}
    }}
}}

Make sure ALL values are filled. If you don't have data for a field, use "None" as a string.
The hold, buy, and sell recommendation percentages should add up to 100.
"""
    
    convo.send_message(prompt)
    data = convo.last.text
    
    # Debug the AI response
    print(f"AI response preview (first 200 chars): {data[:200]}...")
    
    try:
        # First attempt: direct parsing
        json_data = json.loads(data)
    except json.JSONDecodeError:
        try:
            # Find content between curly braces (including nested braces)
            json_pattern = re.search(r'(\{.*\})', data, re.DOTALL)
            if json_pattern:
                potential_json = json_pattern.group(1)
                json_data = json.loads(potential_json)
            else:
                # Try to find JSON within code block markers
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
        
        # Get stock data for different periods
        stock_1d = stock.history(period="1d")
        stock_1w = stock.history(period="1wk")
        stock_1m = stock.history(period="1mo")
        stock_info = stock.info
        
        # Add price ranges for different timeframes
        json_data["price_ranges"] = {
            "24h": {
                "high": float(stock_1d["High"].max()) if not stock_1d.empty else "None",
                "low": float(stock_1d["Low"].min()) if not stock_1d.empty else "None",
                "timestamp": utc_now,
                "volume": int(stock_1d["Volume"].sum()) if not stock_1d.empty else "None"
            },
            "1week": {
                "high": float(stock_1w["High"].max()) if not stock_1w.empty else "None",
                "low": float(stock_1w["Low"].min()) if not stock_1w.empty else "None",
                "timestamp": utc_now,
                "volume": int(stock_1w["Volume"].sum()) if not stock_1w.empty else "None"
            },
            "4week": {
                "high": float(stock_1m["High"].max()) if not stock_1m.empty else "None",
                "low": float(stock_1m["Low"].min()) if not stock_1m.empty else "None",
                "timestamp": utc_now,
                "volume": int(stock_1m["Volume"].sum()) if not stock_1m.empty else "None"
            }
        }
        
        # Calculate moving averages
        if not stock_1d.empty:
            json_data["technical_indicators"] = {
                "moving_averages": {
                    "MA20": float(stock_1d["Close"].rolling(window=20).mean().iloc[-1]) if len(stock_1d) >= 20 else "None",
                    "MA50": float(stock_1d["Close"].rolling(window=50).mean().iloc[-1]) if len(stock_1d) >= 50 else "None",
                    "MA200": float(stock_1d["Close"].rolling(window=200).mean().iloc[-1]) if len(stock_1d) >= 200 else "None"
                },
                "timestamp": utc_now
            }
        
        # Add current market data
        json_data["market_data"] = {
            "current_price": float(stock_1d["Close"].iloc[-1]) if not stock_1d.empty else "None",
            "open": float(stock_1d["Open"].iloc[0]) if not stock_1d.empty else "None",
            "volume": int(stock_1d["Volume"].iloc[0]) if not stock_1d.empty else "None",
            "market_cap": stock_info.get("marketCap", "None"),
            "pe_ratio": stock_info.get("trailingPE", "None"),
            "52_week_high": stock_info.get("fiftyTwoWeekHigh", "None"),
            "52_week_low": stock_info.get("fiftyTwoWeekLow", "None"),
            "beta": stock_info.get("beta", "None"),
            "dividend_yield": stock_info.get("dividendYield", "None"),
            "timestamp": utc_now
        }
        
        # Calculate price changes
        if not stock_1d.empty:
            current_price = float(stock_1d["Close"].iloc[-1])
            open_price = float(stock_1d["Open"].iloc[0])
            json_data["market_data"]["price_change_24h"] = {
                "amount": round(current_price - open_price, 2),
                "percentage": round(((current_price - open_price) / open_price) * 100, 2)
            }
            
            # Add volatility metrics
            json_data["volatility_metrics"] = {
                "daily_range_percent": round(((stock_1d["High"].max() - stock_1d["Low"].min()) / open_price) * 100, 2),
                "avg_true_range": round(stock_1d["High"].mean() - stock_1d["Low"].mean(), 2),
                "timestamp": utc_now
            }
        
        return json_data
    except Exception as e:
        print(f"Error getting stock data: {str(e)}")
        # Return the AI-generated data without the stock data enrichment
        json_data["error"] = {
            "message": f"Could not fetch stock data: {str(e)}",
            "timestamp": utc_now
        }
        return json_data