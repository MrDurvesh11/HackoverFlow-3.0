# create a webhook to fetch 1min candle data from binance and return 
import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    kline = data.get('k', {})
    
    if kline.get('x'):  # Check if the kline is closed
        close_price = kline.get('c')  # Closing price
        return data;

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("Closed connection")

def on_open(ws):
    print("WebSocket connection opened")

ws = websocket.WebSocketApp("wss://stream.binance.com:9443/ws/btcusdt@kline_1m",
                            on_message=on_message,
                            on_error=on_error,
                            on_close=on_close)
ws.run_forever()
