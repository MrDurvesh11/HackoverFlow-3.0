import requests
import pandas as pd
import numpy as np
import time
from datetime import datetime

# Strategy parameters
SYMBOL = 'BTCUSDT'   # Trading pair
RSI_PERIOD = 14      # RSI calculation period
RSI_OVERSOLD = 40    # RSI oversold threshold
RSI_OVERBOUGHT = 60  # RSI overbought threshold

def get_binance_klines(symbol, interval='1m', limit=100):
    """Get kline/candlestick data directly from Binance public API"""
    url = f"https://api.binance.com/api/v3/klines"
    params = {
        'symbol': symbol,
        'interval': interval,
        'limit': limit
    }
    
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching data: {response.status_code}")
        return None

def calculate_rsi(closes, period=14):
    """Calculate RSI values from closing prices"""
    # Calculate price changes
    delta = np.diff(closes)
    
    # Create arrays for gains and losses
    gains = np.copy(delta)
    losses = np.copy(delta)
    
    gains[gains < 0] = 0
    losses[losses > 0] = 0
    losses = abs(losses)
    
    # Calculate average gains and losses
    avg_gain = np.append([0], np.convolve(gains, np.ones(period)/period, mode='valid'))
    avg_loss = np.append([0], np.convolve(losses, np.ones(period)/period, mode='valid'))
    
    # Calculate RS and RSI
    rs = np.zeros_like(avg_gain)
    rsi = np.zeros_like(avg_gain)
    
    for i in range(1, len(avg_gain)):
        avg_gain[i] = (avg_gain[i-1] * (period-1) + gains[i-1]) / period
        avg_loss[i] = (avg_loss[i-1] * (period-1) + losses[i-1]) / period
        
        if avg_loss[i] == 0:
            rs[i] = 100
        else:
            rs[i] = avg_gain[i] / avg_loss[i]
            
        rsi[i] = 100 - (100 / (1 + rs[i]))
    
    return rsi

def main():
    print(f"Starting minimal RSI signal monitor for {SYMBOL}")
    print(f"Signals: BUY when RSI < {RSI_OVERSOLD}, SELL when RSI > {RSI_OVERBOUGHT}")
    
    last_signal = None
    last_signal_time = 0
    signal_cooldown = 60  # 1 minute cooldown
    
    try:
        while True:
            # Fetch the latest price data
            klines = get_binance_klines(SYMBOL, '1m', 100)
            
            if klines:
                # Extract closing prices
                closes = np.array([float(kline[4]) for kline in klines])
                
                # Calculate RSI
                rsi_values = calculate_rsi(closes, RSI_PERIOD)
                current_rsi = rsi_values[-1]
                current_price = closes[-1]
                current_time = time.time()
                
                # Format timestamp
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                
                # Log current values
                print(f"[{timestamp}] Price: {current_price}, RSI: {current_rsi:.2f}")
                
                # Check for signals
                signal = None
                if current_rsi <= RSI_OVERSOLD:
                    signal = "BUY"
                elif current_rsi >= RSI_OVERBOUGHT:
                    signal = "SELL"
                
                # Print signal if new or after cooldown
                if signal and (signal != last_signal or (current_time - last_signal_time) > signal_cooldown):
                    print(f">>> SIGNAL: {signal} - Price: {current_price}, RSI: {current_rsi:.2f} <<<")
                    last_signal = signal
                    last_signal_time = current_time
            
            # Wait before checking again
            time.sleep(15)
            
    except KeyboardInterrupt:
        print("\nRSI monitoring stopped.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()