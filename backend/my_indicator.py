def get_indicator_data(candles):
    # we have rsi in the candles just need to appli rsi 65 and 35 and get the signal
    # retunr the signal, rsi and close price
    
    import pandas as pd
    import pandas_ta as ta
    import numpy as np
    
    # Extract the latest candle data
    if not candles or len(candles) == 0:
        return {"signal": "NEUTRAL", "rsi": None, "price": None, "ema_signal": None}
    
    # Convert candles to DataFrame for EMA calculation
    df = pd.DataFrame(candles)
    
    # Calculate EMAs if not already present
    if 'ema9' not in df.columns:
        df['ema9'] = ta.ema(df['close'], length=9)
    if 'ema20' not in df.columns:
        df['ema20'] = ta.ema(df['close'], length=20)
    if 'ema50' not in df.columns:
        df['ema50'] = ta.ema(df['close'], length=50)
    
    # Replace NaN with None for JSON serialization
    df = df.replace({np.nan: None})
    
    # Get the latest values
    latest_candle = df.iloc[-1].to_dict()
    previous_candle = df.iloc[-2].to_dict() if len(df) > 1 else None
    
    # Get the current RSI and closing price
    current_rsi = latest_candle.get('rsi')
    current_price = latest_candle.get('close')
    
    # Get EMA values
    ema9 = latest_candle.get('ema9')
    ema20 = latest_candle.get('ema20')
    ema50 = latest_candle.get('ema50')
    
    # Initialize signals
    rsi_signal = 'NEUTRAL'
    ema_signal = 'NEUTRAL'
    
    # Previous candle RSI (for detecting crossovers)
    previous_rsi = previous_candle.get('rsi') if previous_candle else None
    
    # RSI logic
    if current_rsi is not None:
        # Check for RSI crossing above 35 (potentially oversold to neutral)
        if previous_rsi is not None and previous_rsi <= 35 and current_rsi > 35:
            rsi_signal = 'BUY'  # Bullish signal when RSI crosses above oversold threshold
        
        # Check for RSI crossing below 65 (potentially overbought to neutral)
        elif previous_rsi is not None and previous_rsi >= 65 and current_rsi < 65:
            rsi_signal = 'SELL'  # Bearish signal when RSI crosses below overbought threshold
        
        # Check for extremely oversold conditions
        elif current_rsi <= 35:
            rsi_signal = 'OVERSOLD'
        
        # Check for extremely overbought conditions
        elif current_rsi >= 65:
            rsi_signal = 'OVERBOUGHT'
    
    # EMA RGB strategy logic
    if ema9 is not None and ema20 is not None and ema50 is not None:
        # Bullish alignment: EMA9 > EMA20 > EMA50 (Green)
        if ema9 > ema20 > ema50:
            ema_signal = 'STRONG_BUY'
        
        # Bearish alignment: EMA9 < EMA20 < EMA50 (Red)
        elif ema9 < ema20 < ema50:
            ema_signal = 'STRONG_SELL'
        
        # EMA9 crosses above EMA20 (potential bullish)
        elif previous_candle and ema9 > ema20 and previous_candle.get('ema9', 0) <= previous_candle.get('ema20', 0):
            ema_signal = 'BUY'
        
        # EMA9 crosses below EMA20 (potential bearish)
        elif previous_candle and ema9 < ema20 and previous_candle.get('ema9', 0) >= previous_candle.get('ema20', 0):
            ema_signal = 'SELL'
        
        # Mixed signals (Yellow)
        else:
            ema_signal = 'NEUTRAL'
    
    print("\n============== Indicators ========================\n")
    print(f"RSI Signal: {rsi_signal}, RSI: {current_rsi}")
    print(f"EMA Signal: {ema_signal}, EMA9: {ema9}, EMA20: {ema20}, EMA50: {ema50}")
    print(f"Price: {current_price}")
    
    # Return all signals and indicators
    return {
        'rsi_signal': rsi_signal,
        'ema_signal': ema_signal,
        'rsi': current_rsi,
        'price': current_price,
        'ema9': ema9,
        'ema20': ema20,
        'ema50': ema50
    }
