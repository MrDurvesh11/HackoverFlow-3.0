import websocket
import json
import requests
import time
import pandas as pd
import numpy as np
import pandas_ta as ta
from collections import deque
import os
from dotenv import load_dotenv
from my_lstm import get_lstm_output
from my_indicator import get_indicator_data
from my_monte_carlo import get_monte_carlo_data
from my_order_manager import generate_order
from binance_client import BinanceTestnetClient
from trade_tracker import log_trade, generate_performance_summary, initialize_csv
import math
import threading
from datetime import datetime, timedelta
import asyncio
from websockets.server import serve
import threading

# Import all configuration from config file
from config import *

# Initialize Binance Testnet client
client = BinanceTestnetClient(API_KEY, API_SECRET)

# Global variables to store data
candles = deque(maxlen=MAX_CANDLES)
historical_data = []  # Stores a longer history for calculating indicators

# Active trades tracking
active_trades = []
trade_monitor_running = False
trade_monitor_thread = None

# WebSocket server configuration
connected_clients = set()
websocket_server_running = False

async def handle_client_connection(websocket, path):
    global connected_clients
    connected_clients.add(websocket)
    print(f"New client connected. Total clients: {len(connected_clients)}")
    
    try:
        async for message in websocket:
            pass
    except Exception as e:
        print(f"WebSocket client error: {e}")
    finally:
        connected_clients.remove(websocket)
        print(f"Client disconnected. Remaining clients: {len(connected_clients)}")

async def broadcast_data(data):
    if not connected_clients:
        return
    
    json_data = json.dumps(data)
    
    disconnected = set()
    for client in connected_clients:
        try:
            await client.send(json_data)
        except Exception as e:
            print(f"Error sending to client: {e}")
            disconnected.add(client)
    
    for client in disconnected:
        connected_clients.remove(client)

async def run_websocket_server():
    global websocket_server_running
    websocket_server_running = True
    
    async with serve(handle_client_connection, WS_SERVER_HOST, WS_SERVER_PORT):
        print(f"WebSocket server started at ws://{WS_SERVER_HOST}:{WS_SERVER_PORT}")
        while websocket_server_running:
            await asyncio.sleep(1)

def start_websocket_server():
    def run():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(run_websocket_server())
    
    ws_thread = threading.Thread(target=run, daemon=True)
    ws_thread.start()
    print("WebSocket server thread started")

def send_analysis_data(lstm_data, indicator_data, monte_carlo_data, order):
    analysis_data = {
        'timestamp': int(time.time() * 1000),
        'lstm': lstm_data,
        'indicators': indicator_data,
        'monte_carlo': monte_carlo_data,
        'order': order
    }
    
    def broadcast():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(broadcast_data(analysis_data))
    
    threading.Thread(target=broadcast, daemon=True).start()

def calculate_indicators(candle_data):
    df = pd.DataFrame(candle_data)
    
    if len(df) == 0:
        return []
    
    df['rsi'] = ta.rsi(df['close'], length=RSI_PERIOD)
    
    macd = ta.macd(df['close'], fast=MACD_FAST, slow=MACD_SLOW, signal=MACD_SIGNAL)
    df['macd'] = macd[f'MACD_{MACD_FAST}_{MACD_SLOW}_{MACD_SIGNAL}']
    df['macd_signal'] = macd[f'MACDs_{MACD_FAST}_{MACD_SLOW}_{MACD_SIGNAL}']
    
    bbands = ta.bbands(df['close'], length=BB_PERIOD, std=BB_STD)
    df['upper_band'] = bbands[f'BBU_{BB_PERIOD}_{BB_STD}.0']
    df['lower_band'] = bbands[f'BBL_{BB_PERIOD}_{BB_STD}.0']
    
    df = df.replace({np.nan: None})
    
    return df.to_dict('records')

def get_historical_candles(symbol, interval, limit=500):
    return client.get_historical_candles(symbol, interval, limit)

def get_account_balance(asset="USDT"):
    balance = client.get_balance(asset)
    print(f"\n============ {asset} BALANCE ============")
    print(f"Free: {balance['free']:.2f} {asset}")
    print(f"Locked: {balance['locked']:.2f} {asset}")
    return balance

def initialize_active_trades():
    print("\n============ CHECKING BTC BALANCE ============")
    try:
        btc_balance = client.get_balance("BTC")
        btc_free = btc_balance['free']
        btc_locked = btc_balance['locked']
        total_btc = btc_free + btc_locked
        
        print(f"Current BTC position: {total_btc} BTC (Free: {btc_free}, Locked: {btc_locked})")
        
        if total_btc > 1.0:
            print(f"Found BTC balance over threshold: {total_btc} BTC - Executing market sell")
            
            if btc_free > 0:
                sell_result = client.place_market_sell_order(
                    symbol=TRADING_SYMBOL,
                    quantity=str(btc_free)
                )
                print(f"Market sell executed: {sell_result}")
                
                if 'orderId' in sell_result and not 'code' in sell_result:
                    print(f"Successfully sold {btc_free} BTC")
                else:
                    print(f"Error selling BTC: {sell_result}")
            else:
                print("No free BTC available to sell (all locked in orders)")
        elif total_btc > 0:
            print(f"BTC balance of {total_btc} is below the threshold of 1.0 BTC. No action taken.")
        else:
            print("No BTC balance found.")
    except Exception as e:
        print(f"Error checking BTC balance: {e}")

def monitor_active_trades():
    global active_trades, trade_monitor_running
    
    print("\n============ TRADE MONITOR STARTED ============")
    
    while trade_monitor_running:
        if not active_trades:
            time.sleep(5)
            continue
            
        try:
            ticker = client.get_symbol_ticker(TRADING_SYMBOL)
            current_price = float(ticker['price'])
            
            trades_to_check = active_trades.copy()
            
            for trade in trades_to_check:
                order_id = trade['order_id']
                entry_price = trade['entry_price']
                quantity = trade['quantity']
                take_profit = trade['take_profit']
                stop_loss = trade['stop_loss']
                entry_time = datetime.strptime(trade['time'], "%Y-%m-%d %H:%M:%S") if 'time' in trade else None
                
                if trade.get('being_processed', False):
                    continue
                
                print(f"Checking trade: ID={order_id}, Entry=${entry_price:.2f}, "
                      f"Current=${current_price:.2f}, TP=${take_profit:.2f}, SL=${stop_loss:.2f}")
                
                if not trade.get('existing_position', False) and not trade.get('confirmed_filled', False):
                    order_status = client.get_order_status(TRADING_SYMBOL, order_id)
                    
                    if 'status' in order_status and order_status['status'] == 'FILLED':
                        print(f"Order {order_id} is now filled. Monitoring stop loss and take profit.")
                        trade['confirmed_filled'] = True
                    else:
                        print(f"Order {order_id} is not filled yet. Status: {order_status.get('status', 'Unknown')}")
                        
                        if order_status.get('status') == 'NEW' and entry_time:
                            current_time = datetime.now()
                            order_age_minutes = (current_time - entry_time).total_seconds() / 60
                            
                            if order_age_minutes > 10:
                                print(f"\n============ ORDER EXPIRATION ============")
                                print(f"Order {order_id} has not been filled after {order_age_minutes:.1f} minutes. Cancelling.")
                                
                                trade['being_processed'] = True
                                
                                try:
                                    cancel_result = client.cancel_order(
                                        symbol=TRADING_SYMBOL,
                                        order_id=order_id
                                    )
                                    
                                    print(f"Order cancellation result: {cancel_result}")
                                    
                                    if not 'code' in cancel_result:
                                        active_trades.remove(trade)
                                        print(f"Trade {order_id} removed from monitoring (expired after 10 minutes)")
                                    else:
                                        trade['being_processed'] = False
                                        print(f"Failed to cancel order {order_id}: {cancel_result}")
                                except Exception as e:
                                    print(f"Error cancelling expired order: {e}")
                                    trade['being_processed'] = False
                        
                        continue
                
                if current_price >= take_profit:
                    print(f"\n============ TAKE PROFIT HIT ============")
                    print(f"Order ID: {order_id} - Target: ${take_profit} - Current: ${current_price}")
                    
                    trade['being_processed'] = True
                    
                    try:
                        sell_result = client.place_market_sell_order(
                            symbol=TRADING_SYMBOL,
                            quantity=quantity
                        )
                        print(f"Take profit sell executed: {sell_result}")
                        
                        log_trade(
                            order_id=order_id,
                            symbol=TRADING_SYMBOL,
                            entry_price=entry_price,
                            exit_price=current_price, 
                            quantity=quantity,
                            take_profit_price=take_profit,
                            stop_loss_price=stop_loss,
                            exit_type='TAKE_PROFIT',
                            entry_time=entry_time
                        )
                        
                        if 'orderId' in sell_result and not 'code' in sell_result:
                            active_trades.remove(trade)
                            print(f"Trade {order_id} removed from monitoring (take profit)")
                        else:
                            trade['being_processed'] = False
                    except Exception as e:
                        print(f"Error executing take profit: {e}")
                        trade['being_processed'] = False
                
                elif current_price <= stop_loss:
                    print(f"\n============ STOP LOSS HIT ============")
                    print(f"Order ID: {order_id} - Stop Loss: ${stop_loss} - Current: ${current_price}")
                    
                    trade['being_processed'] = True
                    
                    try:
                        sell_result = client.place_market_sell_order(
                            symbol=TRADING_SYMBOL,
                            quantity=quantity
                        )
                        print(f"Stop loss sell executed: {sell_result}")
                        
                        log_trade(
                            order_id=order_id,
                            symbol=TRADING_SYMBOL,
                            entry_price=entry_price,
                            exit_price=current_price, 
                            quantity=quantity,
                            take_profit_price=take_profit,
                            stop_loss_price=stop_loss,
                            exit_type='STOP_LOSS',
                            entry_time=entry_time
                        )
                        
                        if 'orderId' in sell_result and not 'code' in sell_result:
                            active_trades.remove(trade)
                            print(f"Trade {order_id} removed from monitoring (stop loss)")
                        else:
                            trade['being_processed'] = False
                    except Exception as e:
                        print(f"Error executing stop loss: {e}")
                        trade['being_processed'] = False
            
            time.sleep(1)
            
        except Exception as e:
            print(f"Error in trade monitor: {e}")
            time.sleep(10)
    
    print("\n============ TRADE MONITOR STOPPED ============")

def print_performance_report():
    return generate_performance_summary()

def start_trade_monitor():
    global trade_monitor_running, trade_monitor_thread
    
    if not trade_monitor_running:
        trade_monitor_running = True
        trade_monitor_thread = threading.Thread(target=monitor_active_trades)
        trade_monitor_thread.daemon = True
        trade_monitor_thread.start()
        print("Trade monitoring thread started")

def stop_trade_monitor():
    global trade_monitor_running
    
    if trade_monitor_running:
        trade_monitor_running = False
        if trade_monitor_thread:
            trade_monitor_thread.join(timeout=5)
        print("Trade monitoring thread stopped")

def execute_order(order):
    if not TRADING_ENABLED:
        print("Trading is disabled. Not placing actual order.")
        return None
    
    if not order:
        print("No order to execute.")
        return None
    
    justification = order.pop("justification", "No justification provided")
    
    balance = get_account_balance("USDT")
    available_funds = balance['free']
    
    order_value = order['position_value']
    if order_value > available_funds:
        print(f"Insufficient funds. Required: ${order_value:.2f}, Available: ${available_funds:.2f}")
        order['quantity'] = (available_funds / order['price']) * 0.99
        order['position_value'] = order['quantity'] * order['price']
        print(f"Adjusted order: {order['quantity']:.5f} BTC (${order['position_value']:.2f})")
    
    min_quantity = 0.001
    if float(order['quantity']) < min_quantity:
        print(f"Order quantity {order['quantity']} is below minimum {min_quantity}. Adjusting order size.")
        order['quantity'] = min_quantity
        order['position_value'] = order['quantity'] * order['price']
        print(f"Adjusted minimum order: {order['quantity']} BTC (${order['position_value']:.2f})")
    
    if float(order['quantity']) <= 0:
        print(f"ERROR: Order quantity {order['quantity']} is invalid. Setting to minimum.")
        order['quantity'] = min_quantity
        order['position_value'] = order['quantity'] * order['price']
        
    safe_quantity = f"{float(order['quantity']):.5f}"
    
    order['quantity'] = safe_quantity
    
    print(f"Final order data:")
    print(f"Symbol: {order['symbol']}")
    print(f"Side: {order['side']}")
    print(f"Type: {order['type']}")
    print(f"Quantity: {order['quantity']} BTC")
    print(f"Price: ${order['price']}")
    print(f"Take Profit: ${order['takeProfit']}")
    print(f"Stop Loss: ${order['stopLoss']}")
    
    results = {}
    
    try:
        main_order_result = client.place_order(
            symbol=order['symbol'],
            side=order['side'],
            order_type=order['type'],
            quantity=order['quantity'],
            price=order['price'],
            time_in_force=order['timeInForce']
        )
        
        results['main_order'] = main_order_result
        
        print("\n============ ORDER PLACED ============")
        print(f"Order ID: {main_order_result.get('orderId')}")
        print(f"Status: {main_order_result.get('status')}")
        
        if 'code' in main_order_result:
            print(f"Order placement error: {main_order_result.get('msg')} (Code: {main_order_result.get('code')})")
            print("\n============ TRADE JUSTIFICATION ============")
            print(justification)
            return results
        
        if main_order_result.get('orderId'):
            start_trade_monitor()
            
            if order['side'] == 'BUY':
                new_trade = {
                    'order_id': main_order_result.get('orderId'),
                    'symbol': order['symbol'],
                    'entry_price': float(order['price']),
                    'quantity': order['quantity'],
                    'take_profit': float(order['takeProfit']),
                    'stop_loss': float(order['stopLoss']),
                    'time': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'being_processed': False,
                    'confirmed_filled': main_order_result.get('status') == 'FILLED'
                }
                
                expiration_time = (datetime.now() + timedelta(minutes=10)).strftime("%Y-%m-%d %H:%M:%S")
                print(f"Order will expire if not filled by: {expiration_time}")
                
                active_trades.append(new_trade)
                print(f"\n============ TRADE ADDED TO MONITORING ============")
                print(f"Order ID: {new_trade['order_id']}")
                print(f"Entry: ${new_trade['entry_price']}")
                print(f"Target: ${new_trade['take_profit']}")
                print(f"Stop Loss: ${new_trade['stop_loss']}")
        
        print("\n============ TRADE JUSTIFICATION ============")
        print(justification)
        
        return results
    except Exception as e:
        print(f"Error executing order: {e}")
        
        print("\n============ TRADE JUSTIFICATION ============")
        print(justification)
        
        results['error'] = str(e)
        return results

def on_message(ws, message):
    global candles, historical_data
    data = json.loads(message)
    kline = data.get('k', {})
    
    if (kline.get('x')):
        current_candle = {
            'open_time': kline.get('t'),
            'open': float(kline.get('o')),
            'high': float(kline.get('h')),
            'low': float(kline.get('l')),
            'close': float(kline.get('c')),
            'volume': float(kline.get('v')),
            'close_time': kline.get('T'),
            'taker_buy_base_asset_volume': float(kline.get('V')),
            'taker_buy_quote_asset_volume': float(kline.get('Q'))
        }
        
        historical_data.append(current_candle)
        if len(historical_data) > MAX_HISTORICAL_DATA:
            historical_data = historical_data[-MAX_HISTORICAL_DATA:]
        
        candles_with_indicators = calculate_indicators(historical_data)
        
        candles.clear()
        candles.extend(candles_with_indicators[-MAX_CANDLES:])
        
        lstm_response = get_lstm_output(candles)
        
        indicator_response = get_indicator_data(candles)
        
        monte_carlo_response = get_monte_carlo_data(candles)
        
        order = generate_order(lstm_response, indicator_response, monte_carlo_response)
        
        order_copy = order.copy() if order else None
        
        send_analysis_data(lstm_response, indicator_response, monte_carlo_response, order_copy)
        
        if order:
            execution_result = execute_order(order)
        
        return data

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("Closed connection")

def on_open(ws):
    print("WebSocket connection opened")

def main():
    global candles, historical_data
    
    try:
        initialize_csv()
        
        account_info = client.get_account_info()
        print("Successfully connected to Binance Testnet")
        print(f"Account Status: {account_info.get('status')}")
        
        get_account_balance("USDT")
        get_account_balance("BTC")
        
        initialize_active_trades()
        
        start_trade_monitor()
        
        start_websocket_server()
        print(f"WebSocket analysis server available at ws://{WS_SERVER_HOST}:{WS_SERVER_PORT}")
        
        symbol = TRADING_SYMBOL.lower()
        interval = TRADING_INTERVAL
        
        historical_data = get_historical_candles(symbol, interval)
        print(f"Fetched {len(historical_data)} historical candles")
        
        candles_with_indicators = calculate_indicators(historical_data)
        
        candles = deque(candles_with_indicators[-MAX_CANDLES:], maxlen=MAX_CANDLES)
        print(f"Initialized display with {len(candles)} recent candles with indicators")
        
        ws_url = f"wss://stream.binance.com:9443/ws/{symbol}@kline_{interval}"
        ws = websocket.WebSocketApp(ws_url,
                                    on_message=on_message,
                                    on_error=on_error,
                                    on_close=on_close,
                                    on_open=on_open)
        ws.run_forever()
        
    except KeyboardInterrupt:
        print("Shutting down gracefully...")
        stop_trade_monitor()
        websocket_server_running = False
    except Exception as e:
        print(f"Unexpected error: {e}")
        stop_trade_monitor()
        websocket_server_running = False

if __name__ == "__main__":
    main()