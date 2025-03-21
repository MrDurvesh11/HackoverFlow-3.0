# create a webhook to fetch 1min candle data from binance and return 
import websocket
import json
import requests
import time
from datetime import datetime

# Function to get historical kline data
def get_historical_klines(symbol, interval, limit=45):
    base_url = "https://api.binance.com/api/v3/klines"
    params = {
        "symbol": symbol.upper(),
        "interval": interval,
        "limit": limit
    }
    
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        klines = response.json()
        close_prices = []
        
        for kline in klines:
            timestamp = datetime.fromtimestamp(kline[0] / 1000).strftime('%Y-%m-%d %H:%M:%S')
            close_price = float(kline[4])  # Index 4 is the close price
            close_prices.append({"timestamp": timestamp, "close": close_price})
            print(f"Timestamp: {timestamp}, Close Price: {close_price}")
            
        return close_prices
    else:
        print(f"Error fetching historical data: {response.text}")
        return None

def on_message(ws, message):
    data = json.loads(message)
    kline = data.get('k', {})
    
    if kline.get('x'):  # Check if the kline is closed
        close_price = float(kline.get('c'))  # Closing price
        timestamp = datetime.fromtimestamp(kline.get('T') / 1000).strftime('%Y-%m-%d %H:%M:%S')
        print(f"New candle closed - Timestamp: {timestamp}, Close Price: {close_price}")
        
        # Update historical data with new candle
        if historical_data:
            historical_data.append({"timestamp": timestamp, "close": close_price})
            # Keep only the most recent 45 candles
            if len(historical_data) > 45:
                historical_data.pop(0)
            
            # Run Monte Carlo simulation with updated data
            from monte_carlo import run_monte_carlo_simulation
            prices = [candle["close"] for candle in historical_data]
            risk_metrics = run_monte_carlo_simulation(prices)
            print(f"30-min Risk Assessment: {risk_metrics}")
            
        return data

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("Closed connection")

def on_open(ws):
    print("WebSocket connection opened")

# Get historical data before starting the WebSocket
print("Fetching last 45 1-minute candles:")
historical_data = get_historical_klines("btcusdt", "1m", 45)
print(f"Retrieved {len(historical_data) if historical_data else 0} historical candles")
print("Now connecting to WebSocket for real-time updates...")

# Start WebSocket connection
ws = websocket.WebSocketApp("wss://stream.binance.com:9443/ws/btcusdt@kline_1m",
                            on_message=on_message,
                            on_error=on_error,
                            on_close=on_close)
ws.on_open = on_open
ws.run_forever()