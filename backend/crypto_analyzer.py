import google.generativeai as genai
from dotenv import load_dotenv
import os
import json
import re
from tradingview_ta import TA_Handler, Interval, Exchange
from datetime import datetime
import pytz

def crypto_analyzer(crypto_name, user_login="MrDurvesh11"):
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
    
    prompt = f"""Analyze the cryptocurrency {crypto_name} from latest data.
Current UTC Time: {utc_now}
Analysis Requested by User: {user_login}

VERY IMPORTANT: You must respond with ONLY a valid JSON object, no explanations, no markdown formatting, no code blocks.
Your response should be a valid JSON object with the following structure:
{{
    "analysis_metadata": {{
        "timestamp_utc": "{utc_now}",
        "requested_by": "{user_login}",
        "crypto_analyzed": "{crypto_name}"
    }},
    "trading_symbol": "",
    "about_crypto": "",
    "cryptoName": "",
    "positives": ["", ""],
    "negatives": ["", "", ""],
    "latest_news": [{{"title": "", "description": ""}}, {{"title": "", "description": ""}}],
    "hold_recommendation_percent": "",
    "buy_recommendation_percent": "",
    "sell_recommendation_percent": "",
    "buy_reason": "",
    "sell_reason": "",
    "hold_reason": "",
    "market_sentiment": "",
    "technology_score": "",
    "adoption_rate": "",
    "volatility_level": "",
    "price_ranges": {{
        "24h": {{"high": "", "low": "", "timestamp": ""}},
        "1week": {{"high": "", "low": "", "timestamp": ""}},
        "4week": {{"high": "", "low": "", "timestamp": ""}}
    }}
}}
"""
    
    convo.send_message(prompt)
    data = convo.last.text
    
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
        # Use TradingView TA Handler to get technical analysis data
        trading_symbol = json_data.get("trading_symbol", crypto_name)
        
        # Create handlers for different timeframes
        handler_1d = TA_Handler(
            symbol=trading_symbol,
            screener="crypto",
            exchange="BINANCE",
            interval=Interval.INTERVAL_1_DAY
        )
        
        handler_1w = TA_Handler(
            symbol=trading_symbol,
            screener="crypto",
            exchange="BINANCE",
            interval=Interval.INTERVAL_1_WEEK
        )
        
        handler_1M = TA_Handler(
            symbol=trading_symbol,
            screener="crypto",
            exchange="BINANCE",
            interval=Interval.INTERVAL_1_MONTH
        )
        
        # Get analysis for different timeframes
        analysis_1d = handler_1d.get_analysis()
        analysis_1w = handler_1w.get_analysis()
        analysis_1M = handler_1M.get_analysis()
        
        # Enrich the JSON data with technical analysis
        json_data["technical_indicators"] = {
            "moving_averages": analysis_1d.moving_averages,
            "oscillators": analysis_1d.oscillators,
            "summary": analysis_1d.summary
        }
        
        # Add price ranges for different timeframes
        json_data["price_ranges"] = {
            "24h": {
                "high": analysis_1d.indicators.get("high", "None"),
                "low": analysis_1d.indicators.get("low", "None"),
                "timestamp": utc_now
            },
            "1week": {
                "high": analysis_1w.indicators.get("high", "None"),
                "low": analysis_1w.indicators.get("low", "None"),
                "timestamp": utc_now
            },
            "4week": {  # Using monthly data for 4-week approximation
                "high": analysis_1M.indicators.get("high", "None"),
                "low": analysis_1M.indicators.get("low", "None"),
                "timestamp": utc_now
            }
        }
        
        # Add additional market data
        json_data["market_data"] = {
            "current_price": analysis_1d.indicators.get("close", "None"),
            "24h_volume": analysis_1d.indicators.get("volume", "None"),
            "24h_change_percent": analysis_1d.indicators.get("change", "None"),
            "rsi": analysis_1d.indicators.get("RSI", "None"),
            "macd": {
                "macd_line": analysis_1d.indicators.get("MACD.macd", "None"),
                "signal_line": analysis_1d.indicators.get("MACD.signal", "None"),
                "histogram": analysis_1d.indicators.get("MACD.hist", "None")
            },
            "timestamp": utc_now
        }
        
        return json_data
    except Exception as e:
        print(f"Error getting cryptocurrency data: {str(e)}")
        # Return the AI-generated data without the technical analysis enrichment
        json_data["error"] = {
            "message": f"Could not fetch crypto data: {str(e)}",
            "timestamp": utc_now
        }
        return json_data
