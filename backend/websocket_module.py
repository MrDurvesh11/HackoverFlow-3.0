# Rename the websocket-client import to avoid name conflicts
import websocket as ws_client
import json
import asyncio
import websockets
import socket

# Store connected clients
connected_clients = set()
# Default WebSocket port with fallbacks
WS_PORT = 8765

async def register(websocket):
    connected_clients.add(websocket)
    try:
        await websocket.wait_closed()
    finally:
        connected_clients.remove(websocket)

async def broadcast(message):
    if connected_clients:
        await asyncio.gather(*[client.send(message) for client in connected_clients])

def on_message(ws, message):
    data = json.loads(message)
    kline = data.get('k', {})
    
    if kline.get('x'):  # Check if the kline is closed
        close_price = kline.get('c')  # Closing price
        print(f"Closed candle with price: {close_price}")
        
        # Send the data to all connected clients
        asyncio.run(broadcast(message))

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("Closed connection")

def on_open(ws):
    print("WebSocket connection opened to Binance")

def start_binance_connection():
    # Update to use ws_client instead of websocket
    ws = ws_client.WebSocketApp("wss://stream.binance.com:9443/ws/btcusdt@kline_1m",
                              on_message=on_message,
                              on_error=on_error,
                              on_close=on_close,
                              on_open=on_open)
    ws.run_forever()

# Function to find an available port
def find_available_port(start_port, max_attempts=5):
    for port in range(start_port, start_port + max_attempts):
        try:
            # Check if the port is already in use
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('localhost', port))
                return port
        except OSError:
            continue
    raise OSError(f"No available ports found in range {start_port}-{start_port + max_attempts - 1}")

# Function to start the WebSocket server
async def start_websocket_server(port=None):
    global WS_PORT
    if port is not None:
        WS_PORT = port
    else:
        try:
            WS_PORT = find_available_port(WS_PORT)
        except OSError as e:
            print(f"Error finding available port: {e}")
            return
    
    try:
        print(f"Starting WebSocket server on port {WS_PORT}")
        async with websockets.serve(register, "localhost", WS_PORT):
            # Store the port in a file that the frontend can read
            with open('ws_port.txt', 'w') as f:
                f.write(str(WS_PORT))
            await asyncio.Future()  # Run forever
    except OSError as e:
        print(f"Error starting WebSocket server: {e}")
        # Try with a different port
        await start_websocket_server(WS_PORT + 1)

# Export the current port for other modules to use
def get_websocket_port():
    return WS_PORT
