from binance.client import Client
import pandas as pd
import ta
import time

# Testnet API Keys
API_KEY = "X0ZiEuPfI49P2ohUiXadtUFZ9YRudWs6ytnvzGIA9cqGKtXp458CVcXmfBnkPjBy"
API_SECRET = "ja6BuokiILSUc2iaDGWkisQg8FEP8FzwHIH9yt1WoMX66PHTRJHIkJxvNIDbvd8U"


# Initialize Client for TESTNET
client = Client(API_KEY, API_SECRET, tld="com", testnet=True)

# Function to show account balance
def show_balance():
    try:
        # Retrieve account details
        account = client.get_account()
        
        # Show balances of all assets
        balances = account['balances']
        for balance in balances:
            if float(balance['free']) > 0:  # Only show balances with a non-zero free amount
                print(f"{balance['asset']}: {balance['free']} free")
    except Exception as e:
        print(f"Error retrieving balance: {e}")

# Function to get RSI
def get_rsi(symbol="BTCUSDT", interval="1m", period=14):
    klines = client.get_klines(symbol=symbol, interval=interval, limit=100)
    df = pd.DataFrame(klines, columns=['time', 'open', 'high', 'low', 'close', 'volume', '_', '_', '_', '_', '_', '_'])
    df["close"] = df["close"].astype(float)
    
    # Calculate RSI
    df["rsi"] = ta.momentum.RSIIndicator(df["close"], window=period).rsi()
    return df["rsi"].iloc[-1]  # Return latest RSI value

# Function to place an order
def place_order(symbol, side, quantity):
    try:
        order = client.create_order(
            symbol=symbol,
            side=side,
            type="MARKET",
            quantity=quantity
        )
        print(f"Order placed: {order}")
    except Exception as e:
        print(f"Error placing order: {e}")

# Function to show order history
def show_order_history(symbol="BTCUSDT", limit=5):
    try:
        orders = client.get_all_orders(symbol=symbol, limit=limit)
        if orders:
            print(f"\nLast {limit} orders for {symbol}:")
            for order in orders:
                print(f"Order ID: {order['orderId']}, Side: {order['side']}, Quantity: {order['origQty']}, Price: {order['price']}, Status: {order['status']}")
        else:
            print(f"No orders found for {symbol}.")
    except Exception as e:
        print(f"Error retrieving order history: {e}")

# Main trading function
def trade(symbol="BTCUSDT", quantity=0.001, rsi_period=14, rsi_overbought=60, rsi_oversold=40):
    while True:
        # Show account balance
        show_balance()
        
        # Show order history (latest 5 orders)
        show_order_history(symbol)

        rsi = get_rsi(symbol, period=rsi_period)
        print(f"RSI: {rsi}")

        if rsi < rsi_oversold:
            print("Buying...")
            place_order(symbol, "BUY", quantity)
        elif rsi > rsi_overbought:
            print("Selling...")
            place_order(symbol, "SELL", quantity)
        
        time.sleep(60)  # Wait for 1 minute before checking again

# Run the bot
trade()
