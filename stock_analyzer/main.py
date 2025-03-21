from fastapi import FastAPI
import ollama
import yfinance as yf
import requests

# Finlight API Key
FINLIGHT_API_KEY = "sk_0339f28ea040ebb4e007e513197beb4cfe7db659c76ca8b5537760a6e1671e55"

app = FastAPI()

# def analyze_investment(query, news):
#     """Generate investment analysis using local LLM"""
#     try:
#         news_text = "\n".join([f"- {article['summary'] (Sentiment: {article['sentiment']})" 
#                           for article in news[:3]])
        
#         prompt = f"""Analyze this investment opportunity based on recent news:
#         Query: {query}
        
#         Recent Developments:
#         {news_text}
        
#         Provide detailed investment advice with:
#         1. Recommendation (Buy/Hold/Sell)
#         2. Key positives (bullet points)
#         3. Potential risks (bullet points) 
#         4. Long-term outlook (50 words)
#         5. Suggested investment strategy
        
#         Format response in Markdown with clear section headings."""
        
#         response = ollama.chat(model="mistral", messages=[{"role": "user", "content": prompt}])
#         return response["message"]["content"]
#     except Exception as e:
#         print(f"Analysis error: {e}")
#         return "Unable to generate analysis at this time"

def analyze_investment(query, news):
    """Generate investment analysis using local LLM"""
    try:
        # Corrected f-string syntax
        news_text = "\n".join([f"- {article['summary']} (Sentiment: {article['sentiment']})" 
                              for article in news[:5]])
        
        prompt = f"""Analyze this investment opportunity based on recent news:
        Query: {query}
        
        Recent Developments:
        {news_text}
        
        Provide detailed investment advice with:
        1. Recommendation (Buy/Hold/Sell)
        2. Key positives (bullet points)
        3. Potential risks (bullet points) 
        4. Long-term outlook (50 words)
        5. Suggested investment strategy
        
        Format response in Markdown with clear section headings."""
        
        response = ollama.chat(model="mistral", messages=[{"role": "user", "content": prompt}])
        return response["message"]["content"]
    except Exception as e:
        print(f"Analysis error: {e}")
        return "Unable to generate analysis at this time"


def get_finlight_news(query):
    """Fetch financial news from Finlight API"""
    try:
        url = f'https://api.finlight.me/v1/articles?query={query}&pageSize=5'
        headers = {'X-API-KEY': FINLIGHT_API_KEY}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        articles = response.json().get('articles', [])
        return [{
            "title": item["title"],
            "source": item["source"],
            "date": item["publishDate"],
            "summary": item["summary"],
            "sentiment": item["sentiment"],
            "confidence": float(item["confidence"]),
            "url": item["link"]
        } for item in articles[:5]]  # Limit to top 5 articles
        
    except Exception as e:
        print(f"News error: {e}")
        return [{"error": "News service unavailable"}]

@app.get("/analyze")
async def investment_analysis(query: str):
    """Main analysis endpoint"""
    # Get relevant news articles
    news_articles = get_finlight_news(query)
    
    # Generate AI-powered analysis
    analysis = analyze_investment(query, news_articles) if news_articles else \
               "Not enough data to analyze - consider broadening your query"
    
    return {
        "query": query,
        "news_digest": news_articles[:5],  # Show top 5 most relevant
        "investment_analysis": analysis,
        "risk_level": "High" if any(art['sentiment'] == 'negative' for art in news_articles) else "Moderate"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)