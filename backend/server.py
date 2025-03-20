from flask import Flask, render_template, send_from_directory, jsonify
import threading
import asyncio
import os
# Import our custom module using an alias to avoid confusion
import websocket_module
# This avoids the circular import issue by renaming
from websocket_module import start_binance_connection, start_websocket_server, get_websocket_port

app = Flask(__name__, static_folder='../frontend', template_folder='../frontend')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)

@app.route('/ws-port')
def websocket_port():
    """Return the current WebSocket port to the frontend"""
    try:
        with open('ws_port.txt', 'r') as f:
            port = f.read().strip()
        return jsonify({"port": port})
    except FileNotFoundError:
        return jsonify({"port": get_websocket_port(), "status": "using default"})

def run_websocket_server():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(start_websocket_server())
    except Exception as e:
        print(f"WebSocket server error: {e}")

def start_server():
    # Start WebSocket server in a separate thread
    websocket_thread = threading.Thread(target=run_websocket_server)
    websocket_thread.daemon = True
    websocket_thread.start()
    
    # Start Binance connection in a separate thread
    binance_thread = threading.Thread(target=start_binance_connection)
    binance_thread.daemon = True
    binance_thread.start()
    
    # Start Flask server
    app.run(debug=True, port=5000)

if __name__ == "__main__":
    start_server()