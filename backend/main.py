import websocket
import json
import requests
import time
import numpy as np
import pandas as pd
import pandas_ta as ta
from collections import deque
import os
from dotenv import load_dotenv
from my_lstm import get_lstm_output
from my_indicator import get_indicator_data
from my_monte_carlo import get_monte_carlo_data
from my_order_manager import generate_order
from binance_client import BinanceTestnetClient
import math
import threading
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Get API keys from environment variables
API_KEY = os.getenv('BINANCE_TESTNET_API_KEY')
API_SECRET = os.getenv('BINANCE_TESTNET_API_SECRET')

# Initialize Binance Testnet client
client = BinanceTestnetClient(API_KEY, API_SECRET)

# Global variables to store data:
# candles - recent 60 candles for display and LSTM
# historical_data - longer history for accurate indicator calculations
candles = deque(maxlen=60)
historical_data = []  # Stores a longer history for calculating indicators

# Trading configuration
TRADING_ENABLED = True  # Set to False to disable actual order placement
TRADING_SYMBOL = "BTCUSDT"
TRADING_INTERVAL = "1m"

# Active trades tracking
active_trades = []
trade_monitor_running = False
trade_monitor_thread = None

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

def get_historical_candles(symbol, interval, limit=500):
    """
    Fetch historical candle data from Binance Testnet
    """
    return client.get_historical_candles(symbol, interval, limit)

def get_account_balance(asset="USDT"):
    """Get current balance for the specified asset"""
    balance = client.get_balance(asset)
    print(f"\n============ {asset} BALANCE ============")
    print(f"Free: {balance['free']:.2f} {asset}")
    print(f"Locked: {balance['locked']:.2f} {asset}")
    return balance

def monitor_active_trades():
    """Continuously monitor active trades for target and stop loss hits"""
    global active_trades, trade_monitor_running
    
    print("\n============ TRADE MONITOR STARTED ============")
    
    while trade_monitor_running:
        if not active_trades:
            # No active trades to monitor, sleep and check again
            time.sleep(5)
            continue
            
        try:
            # Get current price
            ticker = client.get_symbol_ticker(TRADING_SYMBOL)
            current_price = float(ticker['price'])
            
            # Make a copy of the active_trades list to avoid modification during iteration
            trades_to_check = active_trades.copy()
            
            # Check each active trade
            for trade in trades_to_check:
                order_id = trade['order_id']
                entry_price = trade['entry_price']
                quantity = trade['quantity']
                take_profit = trade['take_profit']
                stop_loss = trade['stop_loss']
                
                # Skip trades that are already being processed
                if trade.get('being_processed', False):
                    continue
                
                # Check if target price is hit (take profit)
                if current_price >= take_profit:
                    print(f"\n============ TAKE PROFIT HIT ============")
                    print(f"Order ID: {order_id} - Target: ${take_profit} - Current: ${current_price}")
                    
                    # Mark as being processed to prevent duplicate sells
                    trade['being_processed'] = True
                    
                    # Execute market sell
                    try:
                        sell_result = client.place_market_sell_order(
                            symbol=TRADING_SYMBOL,
                            quantity=quantity
                        )
                        print(f"Take profit sell executed: {sell_result}")
                        
                        # Remove from active trades if successful
                        if 'orderId' in sell_result and not 'code' in sell_result:
                            active_trades.remove(trade)
                            print(f"Trade {order_id} removed from monitoring (take profit)")
                        else:
                            # Failed, unmark as being processed
                            trade['being_processed'] = False
                    except Exception as e:
                        print(f"Error executing take profit: {e}")
                        trade['being_processed'] = False
                
                # Check if stop loss is hit
                elif current_price <= stop_loss:
                    print(f"\n============ STOP LOSS HIT ============")
                    print(f"Order ID: {order_id} - Stop Loss: ${stop_loss} - Current: ${current_price}")
                    
                    # Mark as being processed
                    trade['being_processed'] = True
                    
                    # Execute market sell
                    try:
                        sell_result = client.place_market_sell_order(
                            symbol=TRADING_SYMBOL,
                            quantity=quantity
                        )
                        print(f"Stop loss sell executed: {sell_result}")
                        
                        # Remove from active trades if successful
                        if 'orderId' in sell_result and not 'code' in sell_result:
                            active_trades.remove(trade)
                            print(f"Trade {order_id} removed from monitoring (stop loss)")
                        else:
                            # Failed, unmark as being processed
                            trade['being_processed'] = False
                    except Exception as e:
                        print(f"Error executing stop loss: {e}")
                        trade['being_processed'] = False
            
            # Wait a short time before checking prices again
            time.sleep(1)
            
        except Exception as e:
            print(f"Error in trade monitor: {e}")
            time.sleep(10)  # Longer wait on error
    
    print("\n============ TRADE MONITOR STOPPED ============")

def start_trade_monitor():
    """Start the trade monitoring thread if not already running"""
    global trade_monitor_running, trade_monitor_thread
    
    if not trade_monitor_running:
        trade_monitor_running = True
        trade_monitor_thread = threading.Thread(target=monitor_active_trades)
        trade_monitor_thread.daemon = True  # Allow the thread to exit when main program exits
        trade_monitor_thread.start()
        print("Trade monitoring thread started")

def stop_trade_monitor():
    """Stop the trade monitoring thread"""
    global trade_monitor_running
    
    if trade_monitor_running:
        trade_monitor_running = False
        if trade_monitor_thread:
            trade_monitor_thread.join(timeout=5)
        print("Trade monitoring thread stopped")

def execute_order(order):
    """Execute an order on Binance Testnet"""
    if not TRADING_ENABLED:
        print("Trading is disabled. Not placing actual order.")
        return None
    
    if not order:
        print("No order to execute.")
        return None
    
    # Save the justification to print later
    justification = order.pop("justification", "No justification provided")
    
    # Check available balance
    balance = get_account_balance("USDT")
    available_funds = balance['free']
    
    order_value = order['position_value']
    if order_value > available_funds:
        print(f"Insufficient funds. Required: ${order_value:.2f}, Available: ${available_funds:.2f}")
        # Adjust order quantity based on available funds
        order['quantity'] = (available_funds / order['price']) * 0.99  # Using 99% of available funds
        order['position_value'] = order['quantity'] * order['price']
        print(f"Adjusted order: {order['quantity']:.5f} BTC (${order['position_value']:.2f})")
    
    # Ensure order quantity is not too small
    min_quantity = 0.001  # Using higher minimum to ensure MIN_NOTIONAL
    if float(order['quantity']) < min_quantity:
        print(f"Order quantity {order['quantity']} is below minimum {min_quantity}. Adjusting order size.")
        order['quantity'] = min_quantity
        order['position_value'] = order['quantity'] * order['price']
        print(f"Adjusted minimum order: {order['quantity']} BTC (${order['position_value']:.2f})")
    
    # Make sure the quantity is properly formatted and never zero
    if float(order['quantity']) <= 0:
        print(f"ERROR: Order quantity {order['quantity']} is invalid. Setting to minimum.")
        order['quantity'] = min_quantity
        order['position_value'] = order['quantity'] * order['price']
        
    # Create a hard-coded safe quantity string with 5 decimal places
    safe_quantity = f"{float(order['quantity']):.5f}"
    
    # Update the order with our safe quantity
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
        # Place main order
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
        
        # If there was an error, log it and return
        if 'code' in main_order_result:
            print(f"Order placement error: {main_order_result.get('msg')} (Code: {main_order_result.get('code')})")
            print("\n============ TRADE JUSTIFICATION ============")
            print(justification)
            return results
        
        # If order was successful, add to active trades for monitoring
        if main_order_result.get('orderId'):
            # Start the trade monitor if not already running
            start_trade_monitor()
            
            # Add this trade to our monitoring list
            new_trade = {
                'order_id': main_order_result.get('orderId'),
                'symbol': order['symbol'],
                'entry_price': float(order['price']),
                'quantity': order['quantity'],
                'take_profit': float(order['takeProfit']),
                'stop_loss': float(order['stopLoss']),
                'time': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'being_processed': False
            }
            
            active_trades.append(new_trade)
            print(f"\n============ TRADE ADDED TO MONITORING ============")
            print(f"Order ID: {new_trade['order_id']}")
            print(f"Entry: ${new_trade['entry_price']}")
            print(f"Target: ${new_trade['take_profit']}")
            print(f"Stop Loss: ${new_trade['stop_loss']}")
        
        # Print the trade justification
        print("\n============ TRADE JUSTIFICATION ============")
        print(justification)
        
        return results
    except Exception as e:
        print(f"Error executing order: {e}")
        
        # Still print justification even if there was an error
        print("\n============ TRADE JUSTIFICATION ============")
        print(justification)
        
        results['error'] = str(e)
        return results

def on_message(ws, message):
    global candles, historical_data
    data = json.loads(message)
    kline = data.get('k', {})
    
    if (kline.get('x')):  # Check if the kline is closed
        # Add current candle to our list with only selected columns
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
        
        # call indicator function
        indicator_response = get_indicator_data(candles)
        
        # call monte carlo function
        monte_carlo_response = get_monte_carlo_data(candles)
        
        # Generate trading order based on analysis results
        order = generate_order(lstm_response, indicator_response, monte_carlo_response)
        
        # Execute order if generated
        if order:
            execution_result = execute_order(order)
            # Store execution result if needed
        
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
        # Start trade monitoring thread
        start_trade_monitor()
        
        # Verify API key is working by getting account info
        account_info = client.get_account_info()
        print("Successfully connected to Binance Testnet")
        print(f"Account Status: {account_info.get('status')}")
        
        # Display initial balance
        get_account_balance("USDT")
        get_account_balance("BTC")
        
        # Fetch historical candle data before starting WebSocket connection
        symbol = TRADING_SYMBOL.lower()
        interval = TRADING_INTERVAL
        
        # Get a large number of historical candles
        historical_data = get_historical_candles(symbol, interval)
        print(f"Fetched {len(historical_data)} historical candles")
        
        # Calculate indicators using all historical data
        candles_with_indicators = calculate_indicators(historical_data)
        
        # Initialize the deque with only the last 60 candles that have indicators
        candles = deque(candles_with_indicators[-60:], maxlen=60)
        print(f"Initialized display with {len(candles)} recent candles with indicators")
        
        # Start WebSocket connection for real-time data
        # Note: Binance testnet uses the same WebSocket endpoint as the main net
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
    except Exception as e:
        print(f"Unexpected error: {e}")
        stop_trade_monitor()

if __name__ == "__main__":
    main()