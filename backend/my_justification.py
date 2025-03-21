import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Get API key from environment variables
GEMINI_API_KEY = os.environ.get("GOOGLE_API_KEY", "your_api_key_here")

# Initialize the Gemini client
genai.configure(api_key=GEMINI_API_KEY)

def get_justification(lstm_data, indicator_data, monte_carlo_data, order_data):
  
    print("\n============ JUSTIFICATION GENERATOR ============\n")
    """
    Generate trading decision justification using Google's Gemini API with the SDK
    
    Parameters:
    lstm_data: Dictionary containing LSTM prediction results
    indicator_data: Dictionary containing technical indicator results
    monte_carlo_data: Dictionary containing Monte Carlo simulation results
    order_data: Dictionary containing the generated order details
    
    Returns:
    String with AI-generated justification for the trading decision
    """
    # Check if we have valid data
    if not all([lstm_data, indicator_data, monte_carlo_data]):
        return "Insufficient data for justification generation."
    
    # Create client for the model
    client = genai.GenerativeModel("gemini-2.0-flash-lite")
    
    # Format the market data for the prompt
    market_summary = {
        "current_price": indicator_data.get("price"),
        "lstm_signal": lstm_data.get("signal"),
        "lstm_trend": lstm_data.get("trend"),
        "lstm_trend_strength": lstm_data.get("trend_strength"),
        "target_price": lstm_data.get("target_price"),
        "rsi_value": indicator_data.get("rsi"),
        "rsi_signal": indicator_data.get("rsi_signal"),
        "ema_signal": indicator_data.get("ema_signal"),
        "monte_carlo_signal": monte_carlo_data.get("signal"),
        "monte_carlo_probability": monte_carlo_data.get("prob_increase"),
        "monte_carlo_expected_price": monte_carlo_data.get("expected_price")
    }
    
    # Format the order details for the prompt
    order_summary = {
        "decision": "BUY" if order_data else "NO TRADE",
    }
    
    if order_data:
        order_summary.update({
            "quantity": order_data.get("quantity"),
            "entry_price": order_data.get("price"),
            "stop_loss": order_data.get("stopLoss"),
            "take_profit": order_data.get("takeProfit"),
            "risk_reward_ratio": (order_data.get("takeProfit") - order_data.get("price")) / 
                                (order_data.get("price") - order_data.get("stopLoss"))
                                if order_data.get("price") != order_data.get("stopLoss") else 0
        })
    
    # Create the prompt for Gemini
    prompt = f"""
    You are an expert cryptocurrency trading analyst. Based on the following market analysis and trading signals, 
    provide a concise, professional justification for the trading decision that has been made.
    
    Market Analysis:
    - Current BTC Price: ${market_summary['current_price']:.2f}
    - LSTM Signal: {market_summary['lstm_signal']}
    - LSTM Trend: {market_summary['lstm_trend']} (Strength: {market_summary['lstm_trend_strength']:.2f})
    - LSTM Target Price: ${market_summary['target_price']:.2f}
    - RSI: {market_summary['rsi_value']:.2f} (Signal: {market_summary['rsi_signal']})
    - EMA Signal: {market_summary['ema_signal']}
    - Monte Carlo Signal: {market_summary['monte_carlo_signal']} 
    - Monte Carlo Probability of Increase: {market_summary['monte_carlo_probability']:.2%}
    - Monte Carlo Expected Price: ${market_summary['monte_carlo_expected_price']:.2f}
    
    Trading Decision: {order_summary['decision']}
    """
    
    # Add order details if an order was generated
    if order_data:
        prompt += f"""
        Order Details:
        - Quantity: {order_summary['quantity']:.5f} BTC
        - Entry Price: ${order_summary['entry_price']:.2f}
        - Stop Loss: ${order_summary['stop_loss']:.2f}
        - Take Profit: ${order_summary['take_profit']:.2f}
        - Risk/Reward Ratio: 1:{order_summary['risk_reward_ratio']:.2f}
        
        Please provide a 2-3 paragraph justification for this trading decision that explains the technical 
        analysis behind it, the risk management approach, and the market outlook. Be concise but thorough.
        """
    else:
        prompt += """
        Please provide a brief justification for why no trade was executed based on the conflicting signals
        or unfavorable market conditions. Be concise but thorough.
        """
    
    try:
        # Use the Gemini SDK to generate content
        generation_config = {
            "temperature": 0.3,
            "top_k": 32,
            "top_p": 0.95,
            "max_output_tokens": 1024,
        }
        
        response = client.generate_content(
            contents=prompt,
            generation_config=generation_config
        )
      
        # Get the response text
        return response.text.strip()
        
    except Exception as e:
        print(f"Exception when calling Gemini API: {e}")
        return f"Failed to generate justification: {str(e)}"