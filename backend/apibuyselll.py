import os
from binance.client import Client
from binance.enums import *
import pandas as pd
import time
from datetime import datetime

# Binance API credentials for testnet
# Replace with your own testnet API keys from https://testnet.binance.vision/
api_key = 'kVM8zPhHLxBJng5o99A7NHa1Kr8KpXXoqeYKpMcTTign8lXmtFwwovQ2cHkOuwQ9'
api_secret = 'ltwZuBvMDTskvl3FhGvI5rF7OrmRLZRh5199yuTvPkNpohSy4Vkq5Tb5QkRQsRnj'

# Initialize Binance client for testnet
client = Client(api_key, api_secret, testnet=True)

# Trading parameters
symbol = 'BTCUSDT'
quantity = 0.001  # Amount of BTC to trade (minimum is 0.001)
profit_percentage = 1.5  # Target profit percentage
stop_loss_percentage = 1.0  # Stop loss percentage
check_interval = 60  # Time in seconds between price checks

def get_account_balance():
    """Get account balance for specific assets"""
    account_info = client.get_account()
    balances = account_info['balances']
    df = pd.DataFrame(balances)
    df['free'] = pd.to_numeric(df['free'])
    df['locked'] = pd.to_numeric(df['locked'])
    df = df[(df['free'] > 0) | (df['locked'] > 0)]
    return df

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
        print(f"Buy order placed: {order}")
        return order
    except Exception as e:
        print(f"Error placing buy order: {e}")
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
        print(f"Sell order placed: {order}")
        return order
    except Exception as e:
        print(f"Error placing sell order: {e}")
        return None

def place_limit_orders(symbol, quantity, buy_price):
    """Place take profit and stop loss orders"""
    # Calculate target and stop loss prices
    take_profit_price = round(buy_price * (1 + profit_percentage/100), 2)
    stop_loss_price = round(buy_price * (1 - stop_loss_percentage/100), 2)
    
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
        print(f"Take profit order placed at {take_profit_price}: {take_profit_order}")
    except Exception as e:
        print(f"Error placing take profit order: {e}")
    
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
        print(f"Stop loss order placed at {stop_loss_price}: {stop_loss_order}")
    except Exception as e:
        print(f"Error placing stop loss order: {e}")

def cancel_all_orders(symbol):
    """Cancel all open orders for a symbol"""
    try:
        result = client.cancel_all_orders(symbol=symbol)
        print(f"All orders canceled for {symbol}")
        return result
    except Exception as e:
        print(f"Error canceling orders: {e}")
        return None

def get_trade_history(symbol, limit=10):
    """
    Retrieve and display recent trade history for a specific symbol
    
    Parameters:
    symbol (str): The trading pair (e.g., 'BTCUSDT')
    limit (int): Maximum number of trades to retrieve (default: 10)
    
    Returns:
    DataFrame: A pandas DataFrame containing the trade history
    """
    try:
        # Get list of trades
        trades = client.get_my_trades(symbol=symbol, limit=limit)
        
        if not trades:
            print(f"No trade history found for {symbol}")
            return None
        
        # Convert to DataFrame for better display
        df = pd.DataFrame(trades)
        
        # Convert numeric columns
        numeric_columns = ['price', 'qty', 'quoteQty', 'commission']
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col])
        
        # Convert timestamp to datetime
        if 'time' in df.columns:
            df['time'] = pd.to_datetime(df['time'], unit='ms')
        
        # Select and rename relevant columns
        if len(df) > 0:
            selected_columns = ['time', 'symbol', 'side', 'price', 'qty', 'quoteQty', 'commission', 'commissionAsset']
            available_columns = [col for col in selected_columns if col in df.columns]
            df = df[available_columns]
            
            # Calculate total cost/proceeds (price * quantity)
            if 'price' in df.columns and 'qty' in df.columns:
                df['total'] = df['price'] * df['qty']
            
            # Add a column to show if it was a buy or sell more clearly
            if 'side' in df.columns:
                df['side'] = df['side'].apply(lambda x: 'BUY' if x.lower() == 'buy' else 'SELL')
            
            # Format columns for display
            if 'time' in df.columns:
                df['time'] = df['time'].dt.strftime('%Y-%m-%d %H:%M:%S')
            
            print(f"\n--- TRADE HISTORY FOR {symbol} (LAST {len(df)} TRADES) ---")
            print(df.to_string(index=False))
            
            # Calculate total profit/loss if there are both buys and sells
            if 'side' in df.columns and 'total' in df.columns and set(df['side']) == {'BUY', 'SELL'}:
                total_bought = df[df['side'] == 'BUY']['total'].sum()
                total_sold = df[df['side'] == 'SELL']['total'].sum()
                pnl = total_sold - total_bought
                print(f"\nTotal bought: ${total_bought:.2f}")
                print(f"Total sold: ${total_sold:.2f}")
                print(f"Profit/Loss: ${pnl:.2f} ({(pnl/total_bought*100 if total_bought else 0):.2f}%)")
            
            return df
    
    except Exception as e:
        print(f"Error retrieving trade history: {e}")
        return None

def get_order_history(symbol, limit=10):
    """
    Retrieve and display the order history for a specific symbol
    
    Parameters:
    symbol (str): The trading pair (e.g., 'BTCUSDT')
    limit (int): Maximum number of orders to retrieve (default: 10)
    
    Returns:
    DataFrame: A pandas DataFrame containing the order history
    """
    try:
        # Get list of all orders
        orders = client.get_all_orders(symbol=symbol, limit=limit)
        
        if not orders:
            print(f"No order history found for {symbol}")
            return None
        
        # Convert to DataFrame for better display
        df = pd.DataFrame(orders)
        
        # Convert numeric columns
        numeric_columns = ['price', 'origQty', 'executedQty', 'cummulativeQuoteQty']
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col])
        
        # Convert timestamp to datetime
        if 'time' in df.columns:
            df['time'] = pd.to_datetime(df['time'], unit='ms')
        
        # Select and rename relevant columns
        if len(df) > 0:
            selected_columns = ['time', 'symbol', 'side', 'type', 'price', 
                              'origQty', 'executedQty', 'status']
            available_columns = [col for col in selected_columns if col in df.columns]
            df = df[available_columns]
            
            # Format columns for display
            if 'time' in df.columns:
                df['time'] = df['time'].dt.strftime('%Y-%m-%d %H:%M:%S')
            
            print(f"\n--- ORDER HISTORY FOR {symbol} (LAST {len(df)} ORDERS) ---")
            print(df.to_string(index=False))
            
            return df
    
    except Exception as e:
        print(f"Error retrieving order history: {e}")
        return None

def check_transaction_history():
    """Display menu for checking transaction history"""
    global symbol  # Access the global symbol variable
    
    print("\n=== TRANSACTION HISTORY MENU ===")
    print("1. View recent trades")
    print("2. View order history")
    print("3. Return to main menu")
    
    choice = input("Enter your choice (1-3): ")
    
    if choice == '1':
        selected_symbol = input(f"Enter trading pair (default: {symbol}): ") or symbol
        limit = int(input("Enter number of trades to display (default: 10): ") or 10)
        get_trade_history(selected_symbol, limit)
    elif choice == '2':
        selected_symbol = input(f"Enter trading pair (default: {symbol}): ") or symbol
        limit = int(input("Enter number of orders to display (default: 10): ") or 10)
        get_order_history(selected_symbol, limit)
    elif choice == '3':
        return
    else:
        print("Invalid choice. Please try again.")
    
    # Wait for user to press enter before continuing
    input("\nPress Enter to continue...")

def run_trading_bot():
    print("Starting Bitcoin paper trading bot on Binance Testnet...")
    
    # Print initial account balance
    print("Initial account balance:")
    print(get_account_balance())
    
    while True:
        try:
            current_price = get_current_price(symbol)
            print(f"Current {symbol} price: ${current_price}")
            
            # Buy Bitcoin
            print(f"Buying {quantity} {symbol}...")
            buy_order = buy_bitcoin(symbol, quantity)  # Fixed: Define buy_order variable
            
            if buy_order:
                buy_price = float(buy_order['fills'][0]['price'])
                print(f"Bought at ${buy_price}")
                
                # Place take profit and stop loss orders
                place_limit_orders(symbol, quantity, buy_price)
                
                # Monitor price for 1 hour
                start_time = time.time()
                while time.time() - start_time < 3600:  # 1 hour in seconds
                    current_price = get_current_price(symbol)
                    print(f"Current price: ${current_price}, Buy price: ${buy_price}")
                    
                    # Calculate current P&L
                    pnl_percent = ((current_price - buy_price) / buy_price) * 100
                    print(f"Current P&L: {pnl_percent:.2f}%")
                    
                    # If manual exit condition (for demo purposes)
                    if pnl_percent >= profit_percentage or pnl_percent <= -stop_loss_percentage:
                        print(f"Exit condition met. P&L: {pnl_percent:.2f}%")
                        cancel_all_orders(symbol)
                        sell_bitcoin(symbol, quantity)
                        break
                    
                    time.sleep(check_interval)
                
                # Sell after monitoring period if orders didn't execute
                cancel_all_orders(symbol)
                print("Selling after monitoring period...")
                sell_bitcoin(symbol, quantity)
            
            # Print final balance after this trade cycle
            print("Updated account balance:")
            print(get_account_balance())
            
            # Wait before starting next trade cycle
            print("Waiting for next trade cycle...")
            time.sleep(300)  # 5 minutes
            
        except Exception as e:
            print(f"Error in trading loop: {e}")
            time.sleep(60)

def main_menu():
    """Main menu for the trading bot"""
    while True:
        print("\n=== BINANCE BITCOIN PAPER TRADING BOT ===")
        print("1. Check account balance")
        print("2. View transaction history")
        print("3. Start trading bot")
        print("4. Exit program")
        
        choice = input("Enter your choice (1-4): ")
        
        if choice == '1':
            print("\n--- ACCOUNT BALANCE ---")
            print(get_account_balance())
            input("\nPress Enter to continue...")
        elif choice == '2':
            check_transaction_history()
        elif choice == '3':
            run_trading_bot()
        elif choice == '4':
            print("Exiting program. Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    # Test API connection
    try:
        status = client.get_system_status()
        print("Binance Testnet connection successful!")
        main_menu()  # Added a main menu instead of directly calling functions
    except Exception as e:
        print(f"Error connecting to Binance Testnet: {e}")