from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
import json
import os
import threading
import time
from datetime import datetime
from binance.client import Client
from binance.enums import *
import pandas as pd
from stock_analyzer import stock_analyzer
from crypto_analyzer import crypto_analyzer

load_dotenv()
api_key = os.getenv("api_key")
api_secret = os.getenv("api_secret")

# Initialize Binance client for testnet
client = Client('GiSEgThuzY1dnDTXiAEzQOp1BCmKWfrZnqNBvKypwQVd9sJoqtpyP9dripSiKk7Z', 'OA4HIvrcLe96UGgtnXgXksKghrLKyhHRqnxa93Fy6ulnfsppFD0MBGfD6OE39x5K', testnet=True)

# Trading parameters - configurable via API
trading_config = {
    'symbol': 'BTCUSDT',
    'quantity': 0.001,
    'profit_percentage': 1.5,
    'stop_loss_percentage': 1.0,
    'check_interval': 60  # Time in seconds between price checks
}

# Bot state
bot_state = {
    'is_running': False,
    'thread': None,
    'last_price': None,
    'buy_price': None,
    'current_pnl': None,
    'start_time': None,
    'status': 'Idle',
    'last_updated': None,
    'error': None
}

app = Flask(__name__) 
CORS(app)

@app.route('/analyze_stock', methods=['POST'])
def analyze_stock():
    try:
        stock_name = request.json['stock_name']
        result = stock_analyzer(stock_name)
        return jsonify(result)
    except Exception as e:
        print(f"Error in analyze_stock: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Do for the stock_analyzer function
@app.route('/analyze_crypto', methods=['POST'])
def analyze_crypto():
    try:
        crypto_name = request.json['crypto_name']
        result = crypto_analyzer(crypto_name)
        return jsonify(result)
    except Exception as e:
        print(f"Error in analyze_crypto: {str(e)}")
        return jsonify({"error": str(e)}), 500

def get_account_balance():
    """Get account balance for specific assets"""
    account_info = client.get_account()
    balances = account_info['balances']
    df = pd.DataFrame(balances)
    df['free'] = pd.to_numeric(df['free'])
    df['locked'] = pd.to_numeric(df['locked'])
    df = df[(df['free'] > 0) | (df['locked'] > 0)]
    return df.to_dict('records')

def get_current_price(symbol):
    """Get current price of a symbol"""
    ticker = client.get_ticker(symbol=symbol)
    return float(ticker['lastPrice'])

def buy_bitcoin(symbol, quantity):
    """Place a market buy order"""
    try:
        order = client.create_order(
            symbol=symbol,
            side=SIDE_BUY,
            type=ORDER_TYPE_MARKET,
            quantity=quantity
        )
        return order
    except Exception as e:
        bot_state['error'] = f"Error placing buy order: {str(e)}"
        return None

def sell_bitcoin(symbol, quantity):
    """Place a market sell order"""
    try:
        order = client.create_order(
            symbol=symbol,
            side=SIDE_SELL,
            type=ORDER_TYPE_MARKET,
            quantity=quantity
        )
        return order
    except Exception as e:
        bot_state['error'] = f"Error placing sell order: {str(e)}"
        return None

def place_limit_orders(symbol, quantity, buy_price):
    """Place take profit and stop loss orders"""
    # Calculate target and stop loss prices
    take_profit_price = round(buy_price * (1 + trading_config['profit_percentage']/100), 2)
    stop_loss_price = round(buy_price * (1 - trading_config['stop_loss_percentage']/100), 2)
    
    orders = {}
    
    # Place take profit limit order
    try:
        take_profit_order = client.create_order(
            symbol=symbol,
            side=SIDE_SELL,
            type=ORDER_TYPE_LIMIT,
            timeInForce=TIME_IN_FORCE_GTC,
            quantity=quantity,
            price=str(take_profit_price)
        )
        orders['take_profit'] = take_profit_order
    except Exception as e:
        bot_state['error'] = f"Error placing take profit order: {str(e)}"
    
    # Place stop loss order
    try:
        stop_loss_order = client.create_order(
            symbol=symbol,
            side=SIDE_SELL,
            type=ORDER_TYPE_STOP_LOSS_LIMIT,
            timeInForce=TIME_IN_FORCE_GTC,
            quantity=quantity,
            price=str(stop_loss_price),
            stopPrice=str(stop_loss_price)
        )
        orders['stop_loss'] = stop_loss_order
    except Exception as e:
        bot_state['error'] = f"Error placing stop loss order: {str(e)}"
    
    return orders

def cancel_all_orders(symbol):
    """Cancel all open orders for a symbol"""
    try:
        result = client.cancel_all_orders(symbol=symbol)
        return result
    except Exception as e:
        bot_state['error'] = f"Error canceling orders: {str(e)}"
        return None

def get_trade_history(symbol, limit=10):
    """Retrieve trade history for a specific symbol"""
    try:
        trades = client.get_my_trades(symbol=symbol)
        
        if not trades:
            return []
        
        # Process trades to make them JSON serializable
        for trade in trades:
            trade['time'] = datetime.fromtimestamp(trade['time'] / 1000).strftime('%Y-%m-%d %H:%M:%S')
            # Convert numeric string values to float for better frontend handling
            for key in ['price', 'qty', 'quoteQty', 'commission']:
                if key in trade:
                    trade[key] = float(trade[key])
        
        return trades
    
    except Exception as e:
        bot_state['error'] = f"Error retrieving trade history: {str(e)}"
        return []

def get_order_history(symbol, limit=10):
    """Retrieve the order history for a specific symbol"""
    try:
        orders = client.get_all_orders(symbol=symbol, limit=limit)
        
        if not orders:
            return []
        
        # Process orders to make them JSON serializable
        for order in orders:
            order['time'] = datetime.fromtimestamp(order['time'] / 1000).strftime('%Y-%m-%d %H:%M:%S')
            # Convert numeric string values to float for better frontend handling
            for key in ['price', 'origQty', 'executedQty', 'cummulativeQuoteQty']:
                if key in order and order[key]:
                    order[key] = float(order[key])
        
        return orders
    
    except Exception as e:
        bot_state['error'] = f"Error retrieving order history: {str(e)}"
        return []

# Trading bot function
def run_bot():
    symbol = trading_config['symbol']
    quantity = trading_config['quantity']
    
    try:
        bot_state['status'] = "Starting trading bot..."
        bot_state['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Get initial price
        current_price = get_current_price(symbol)
        bot_state['last_price'] = current_price
        bot_state['status'] = f"Current {symbol} price: ${current_price}"
        bot_state['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Buy Bitcoin
        bot_state['status'] = f"Buying {quantity} {symbol}..."
        bot_state['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        buy_order = buy_bitcoin(symbol, quantity)
        
        if buy_order:
            buy_price = float(buy_order['fills'][0]['price'])
            bot_state['buy_price'] = buy_price
            bot_state['status'] = f"Bought at ${buy_price}"
            bot_state['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # Place take profit and stop loss orders
            place_limit_orders(symbol, quantity, buy_price)
            bot_state['status'] = f"Take profit and stop loss orders placed"
            bot_state['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # Monitor price for 1 hour
            start_time = time.time()
            bot_state['start_time'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            while time.time() - start_time < 3600 and bot_state['is_running']:  # 1 hour in seconds
                current_price = get_current_price(symbol)
                bot_state['last_price'] = current_price
                
                # Calculate current P&L
                pnl_percent = ((current_price - buy_price) / buy_price) * 100
                bot_state['current_pnl'] = pnl_percent
                
                bot_state['status'] = f"Monitoring: ${current_price}, P&L: {pnl_percent:.2f}%"
                bot_state['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                
                # If exit condition met
                if (pnl_percent >= trading_config['profit_percentage'] or 
                    pnl_percent <= -trading_config['stop_loss_percentage']):
                    
                    bot_state['status'] = f"Exit condition met. P&L: {pnl_percent:.2f}%"
                    bot_state['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    
                    cancel_all_orders(symbol)
                    sell_order = sell_bitcoin(symbol, quantity)
                    
                    if sell_order:
                        sell_price = float(sell_order['fills'][0]['price'])
                        final_pnl = ((sell_price - buy_price) / buy_price) * 100
                        bot_state['status'] = f"Trade completed. Final P&L: {final_pnl:.2f}%"
                        bot_state['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    break
                
                time.sleep(trading_config['check_interval'])
            
            # Sell after monitoring period if orders didn't execute
            if bot_state['is_running']:
                cancel_all_orders(symbol)
                bot_state['status'] = "Selling after monitoring period..."
                bot_state['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                
                sell_order = sell_bitcoin(symbol, quantity)
                if sell_order:
                    sell_price = float(sell_order['fills'][0]['price'])
                    final_pnl = ((sell_price - buy_price) / buy_price) * 100
                    bot_state['status'] = f"Trading cycle complete. Final P&L: {final_pnl:.2f}%"
                    bot_state['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
    except Exception as e:
        bot_state['status'] = "Error"
        bot_state['error'] = str(e)
        bot_state['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    finally:
        bot_state['is_running'] = False
        bot_state['thread'] = None

def bot_worker():
    while bot_state['is_running']:
        run_bot()
        # Wait before starting next trade cycle
        bot_state['status'] = "Waiting for next trade cycle..."
        bot_state['last_updated'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        time.sleep(300)  # 5 minutes


# API Routes
@app.route('/api/balance', methods=['GET'])
def api_balance():
    try:
        balances = get_account_balance()
        return jsonify({
            'success': True,
            'data': balances
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/price', methods=['GET'])
def api_price():
    try:
        symbol = request.args.get('symbol', trading_config['symbol'])
        price = get_current_price(symbol)
        return jsonify({
            'success': True,
            'data': {
                'symbol': symbol,
                'price': price,
                'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/trades', methods=['GET'])
def api_trades():
    try:
        symbol = request.args.get('symbol', trading_config['symbol'])
        limit = int(request.args.get('limit', 10))
        trades = get_trade_history(symbol, limit)
        
        # Calculate summary metrics
        if trades:
            buy_trades = [t for t in trades if t.get('isBuyer', False)]
            sell_trades = [t for t in trades if not t.get('isBuyer', False)]
            
            total_bought = sum(t['price'] * t['qty'] for t in buy_trades) if buy_trades else 0
            total_sold = sum(t['price'] * t['qty'] for t in sell_trades) if sell_trades else 0
            pnl = total_sold - total_bought
            pnl_percent = (pnl / total_bought * 100) if total_bought else 0
            
            summary = {
                'total_bought': total_bought,
                'total_sold': total_sold,
                'pnl': pnl,
                'pnl_percent': pnl_percent
            }
        else:
            summary = {}
        
        return jsonify({
            'success': True,
            'data': {
                'trades': trades,
                'summary': summary
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/orders', methods=['GET'])
def api_orders():
    try:
        symbol = request.args.get('symbol', trading_config['symbol'])
        limit = int(request.args.get('limit', 10))
        orders = get_order_history(symbol, limit)
        return jsonify({
            'success': True,
            'data': orders
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/bot/status', methods=['GET'])
def api_bot_status():
    return jsonify({
        'success': True,
        'data': {
            'is_running': bot_state['is_running'],
            'status': bot_state['status'],
            'last_price': bot_state['last_price'],
            'buy_price': bot_state['buy_price'],
            'current_pnl': bot_state['current_pnl'],
            'start_time': bot_state['start_time'],
            'last_updated': bot_state['last_updated'],
            'error': bot_state['error'],
            'config': trading_config
        }
    })

@app.route('/api/bot/start', methods=['POST'])
def api_bot_start():
    if bot_state['is_running']:
        return jsonify({
            'success': False,
            'error': 'Bot is already running'
        }), 400
    
    # Update config if provided
    if request.json:
        for key in request.json:
            if key in trading_config:
                trading_config[key] = request.json[key]
    
    # Start bot in a separate thread
    bot_state['is_running'] = True
    bot_state['error'] = None
    bot_state['thread'] = threading.Thread(target=bot_worker)
    bot_state['thread'].daemon = True
    bot_state['thread'].start()
    
    return jsonify({
        'success': True,
        'message': 'Trading bot started',
        'config': trading_config
    })

@app.route('/api/bot/stop', methods=['POST'])
def api_bot_stop():
    if not bot_state['is_running']:
        return jsonify({
            'success': False,
            'error': 'Bot is not running'
        }), 400
    
    # Stop bot
    bot_state['is_running'] = False
    
    # Cancel any open orders
    symbol = trading_config['symbol']
    try:
        cancel_all_orders(symbol)
    except Exception as e:
        pass  # Ignore errors when stopping
    
    return jsonify({
        'success': True,
        'message': 'Trading bot stopped'
    })

@app.route('/api/config', methods=['GET', 'PUT'])
def api_config():
    if request.method == 'GET':
        return jsonify({
            'success': True,
            'data': trading_config
        })
    else:  # PUT
        if not request.json:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Update config
        for key in request.json:
            if key in trading_config:
                trading_config[key] = request.json[key]
        
        return jsonify({
            'success': True,
            'message': 'Configuration updated',
            'data': trading_config
        })

# Test route to check if API is working
@app.route('/api/test', methods=['GET'])
def api_test():
    try:
        status = client.get_system_status()
        return jsonify({
            'success': True,
            'message': 'API is working',
            'binance_status': status
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)