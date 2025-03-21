import websocket
import json
import requests
import time
import numpy as np
import pandas as pd
import pandas_ta as ta
from collections import deque
from my_lstm import get_lstm_output

# Global variables to store data:
# candles - recent 60 candles for display and LSTM
# historical_data - longer history for accurate indicator calculations
candles = deque(maxlen=60)
historical_data = []  # Stores a longer history for calculating indicators

def calculate_indicators(candle_data):
    """
    Calculate technical indicators for the candle data using pandas_ta
    Returns the original data with added indicator columns
    """
    # Convert to pandas DataFrame for easier calculations
    df = pd.DataFrame(candle_data)
    
    # Ensure we have a clean DataFrame
    if len(df) == 0:
        return []
    
    # Calculate RSI (14 periods)
    df['rsi'] = ta.rsi(df['close'], length=14)
    
    # Calculate MACD (12, 26, 9)
    macd = ta.macd(df['close'], fast=12, slow=26, signal=9)
    df['macd'] = macd['MACD_12_26_9']
    df['macd_signal'] = macd['MACDs_12_26_9']
    
    # Calculate Bollinger Bands (20 periods, 2 std)
    bbands = ta.bbands(df['close'], length=20, std=2)
    df['upper_band'] = bbands['BBU_20_2.0']
    df['lower_band'] = bbands['BBL_20_2.0']
    
    # Convert NaN to None for JSON serialization
    df = df.replace({np.nan: None})
    
    # Convert back to dictionary format
    return df.to_dict('records')

def get_historical_candles(symbol, interval, limit=500):  # Increased limit for much more historical data
    """
    Fetch historical candle data from Binance
    symbol: Trading pair (e.g., 'BTCUSDT')
    interval: Candle interval (e.g., '1m')
    limit: Number of candles to fetch (max 1000)
    """
    url = "https://api.binance.com/api/v3/klines"
    params = {
        'symbol': symbol.upper(),
        'interval': interval,
        'limit': limit
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    formatted_candles = []
    for candle in data:
        formatted_candle = {
            'open_time': candle[0],
            'close': float(candle[4]),
            'volume': float(candle[5]),
            'taker_buy_base_asset_volume': float(candle[9]),
            'taker_buy_quote_asset_volume': float(candle[10])
        }
        formatted_candles.append(formatted_candle)
    
    return formatted_candles

def on_message(ws, message):
    global candles, historical_data
    data = json.loads(message)
    kline = data.get('k', {})
    
    if kline.get('x'):  # Check if the kline is closed
        # Add current candle to our list with only selected columns
        current_candle = {
            'open_time': kline.get('t'),
            'close': float(kline.get('c')),
            'volume': float(kline.get('v')),
            'taker_buy_base_asset_volume': float(kline.get('V')),
            'taker_buy_quote_asset_volume': float(kline.get('Q'))
        }
        
        # Add new candle to historical data and limit size to prevent memory issues
        historical_data.append(current_candle)
        if len(historical_data) > 1000:  # Keep last 1000 candles for calculations
            historical_data = historical_data[-1000:]
        
        # Calculate indicators on all historical data
        candles_with_indicators = calculate_indicators(historical_data)
        
        # Update the deque with only the last 60 candles with indicators
        candles.clear()
        candles.extend(candles_with_indicators[-60:])
        
        # Call LSTM function with updated candles
        lstm_response = get_lstm_output(candles)
        # print(f"LSTM prediction: {lstm_response}")
        
        return data

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("Closed connection")

def on_open(ws):
    print("WebSocket connection opened")

def main():
    global candles, historical_data
    # Fetch historical candle data before starting WebSocket connection
    symbol = "btcusdt"
    interval = "1m"
    
    # Get a large number of historical candles
    historical_data = get_historical_candles(symbol, interval)
    print(f"Fetched {len(historical_data)} historical candles")
    
    # Calculate indicators using all historical data
    candles_with_indicators = calculate_indicators(historical_data)
    
    # Initialize the deque with only the last 60 candles that have indicators
    candles = deque(candles_with_indicators[-60:], maxlen=60)
    print(f"Initialized display with {len(candles)} recent candles with indicators")
    
    # Start WebSocket connection for real-time data
    ws_url = f"wss://stream.binance.com:9443/ws/{symbol}@kline_{interval}"
    ws = websocket.WebSocketApp(ws_url,
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close,
                                on_open=on_open)
    ws.run_forever()

if __name__ == "__main__":
    main()