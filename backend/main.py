import websocket
import json
import requests
import time
from collections import deque
from my_lstm import get_lstm_output

# Global variable to store historical and current candles
# Use deque with maxlen for efficient handling of the last 60 candles
candles = deque(maxlen=60)

def get_historical_candles(symbol, interval, limit=60):
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
    global candles
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
        
        # Add the new candle - deque will automatically maintain the 60 element limit
        candles.append(current_candle)
            
        # print(f"Data: {data}")
        # print(f"Total candles available: {len(candles)}")
        # sample output: 
        # call indicator function
        # call my LSTM function 
        get_lstm_output(candles)
        # call monte carlo simulation function
        return data

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("Closed connection")

def on_open(ws):
    print("WebSocket connection opened")

def main():
    global candles
    # Fetch historical candle data before starting WebSocket connection
    symbol = "btcusdt"
    interval = "1m"
    historical_data = get_historical_candles(symbol, interval)
    # Initialize the deque with historical data
    candles = deque(historical_data, maxlen=60)
    print(f"Fetched {len(candles)} historical candles")
    
    # Print each historical candle
    print("Historical candles data:")
    for i, candle in enumerate(candles):
        print(f"Candle {i+1}: Open Time: {candle['open_time']}, Close: {candle['close']}, Volume: {candle['volume']}, Taker Buy Base Asset Volume: {candle['taker_buy_base_asset_volume']}, Taker Buy Quote Asset Volume: {candle['taker_buy_quote_asset_volume']}")
    
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