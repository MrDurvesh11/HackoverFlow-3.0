from fastapi import FastAPI
import ollama  # Use Ollama instead of OpenAI
import yfinance as yf
import requests
import re

# Alpha Vantage API Key (for stock news)
ALPHA_VANTAGE_API_KEY = "3S0TFEAFKXGY00BC"

app = FastAPI()

def extract_symbol(query):
    """Extract financial symbols using local LLM via Ollama"""
    prompt = f"""Extract the financial symbol from this query: '{query}'. 
    Return ONLY the stock ticker (e.g., AAPL) or cryptocurrency name (e.g., bitcoin).
    If no symbol is found, return 'None'."""

    try:
        response = ollama.chat(model="llama3.1", messages=[{"role": "user", "content": prompt}])
        extracted = response["message"]["content"].strip()
        return extracted if extracted.lower() != "none" else None
    except Exception as e:
        print(f"Ollama Error: {e}")
        return None

def get_stock_data(symbol):
    """Fetch stock data from Yahoo Finance"""
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        return {
            "symbol": symbol,
            "current_price": info.get("currentPrice"),
            "market_cap": info.get("marketCap"),
            "sector": info.get("sector"),
            "52_week_high": info.get("fiftyTwoWeekHigh"),
            "52_week_low": info.get("fiftyTwoWeekLow"),
        }
    except Exception as e:
        print(f"Stock data error: {e}")
        return {"error": "Invalid stock symbol"}

def get_crypto_data(symbol):
    """Fetch crypto data from CoinGecko"""
    try:
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={symbol}&vs_currencies=usd"
        response = requests.get(url)
        data = response.json()
        return {"symbol": symbol, "price": data.get(symbol, {}).get("usd", "N/A")}
    except Exception as e:
        print(f"Crypto data error: {e}")
        return {"error": "Invalid crypto symbol"}

def get_stock_news(symbol):
    """Fetch stock news from Alpha Vantage"""
    try:
        url = f"https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers={symbol}&apikey={ALPHA_VANTAGE_API_KEY}"
        response = requests.get(url)
        data = response.json()
        
        if "feed" in data:
            return [{"title": item["title"], "url": item["url"]} for item in data["feed"][:5]]
        return [{"error": "No recent news found"}]
    except Exception as e:
        print(f"Stock news error: {e}")
        return [{"error": "News service unavailable"}]

def get_crypto_news(symbol):
    """Fetch crypto news from CoinGecko"""
    try:
        url = "https://api.coingecko.com/api/v3/news"
        response = requests.get(url)
        data = response.json()
        
        news_list = []
        for article in data.get("data", [])[:5]:
            content = f"{article.get('title', '')} {article.get('content', '')}".lower()
            if symbol.lower() in content:
                news_list.append({"title": article["title"], "url": article.get("url", "")})
        
        return news_list if news_list else [{"error": "No recent news found"}]
    except Exception as e:
        print(f"Crypto news error: {e}")
        return [{"error": "News service unavailable"}]

def get_general_finance_advice(query):
    """Generate financial advice using local LLM"""
    try:
        response = ollama.chat(model="llama3.1", messages=[{"role": "user", "content": query}])
        return response["message"]["content"]
    except Exception as e:
        print(f"Ollama Error: {e}")
        return "I'm having trouble connecting to the AI model. Please try again later."

@app.get("/chat")
def chat(query: str):
    """Main chat endpoint"""
    symbol = extract_symbol(query)
    
    if symbol:
        # Check if stock symbol (uppercase letters only)
        if re.match(r"^[A-Z]+$", symbol):
            return {
                "type": "stock",
                "data": get_stock_data(symbol),
                "news": get_stock_news(symbol)
            }
        else:  # Assume cryptocurrency
            return {
                "type": "crypto",
                "data": get_crypto_data(symbol),
                "news": get_crypto_news(symbol)
            }
    
    # Handle general queries
    return {
        "type": "general",
        "response": get_general_finance_advice(query)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
