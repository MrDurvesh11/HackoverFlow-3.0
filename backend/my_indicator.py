def get_indicator_data(candles):
    import pandas as pd
    import pandas_ta as ta
    import numpy as np
    
    # Import configuration from main
    from main import RSI_OVERSOLD, RSI_OVERBOUGHT, EMA_SHORT, EMA_MEDIUM, EMA_LONG
    
    if not candles or len(candles) == 0:
        return {"signal": "NEUTRAL", "rsi": None, "price": None, "ema_signal": None}
    
    df = pd.DataFrame(candles)
    
    if f'ema{EMA_SHORT}' not in df.columns:
        df[f'ema{EMA_SHORT}'] = ta.ema(df['close'], length=EMA_SHORT)
    if f'ema{EMA_MEDIUM}' not in df.columns:
        df[f'ema{EMA_MEDIUM}'] = ta.ema(df['close'], length=EMA_MEDIUM)
    if f'ema{EMA_LONG}' not in df.columns:
        df[f'ema{EMA_LONG}'] = ta.ema(df['close'], length=EMA_LONG)
    
    df = df.replace({np.nan: None})
    
    latest_candle = df.iloc[-1].to_dict()
    previous_candle = df.iloc[-2].to_dict() if len(df) > 1 else None
    
    current_rsi = latest_candle.get('rsi')
    current_price = latest_candle.get('close')
    
    ema_short = latest_candle.get(f'ema{EMA_SHORT}')
    ema_medium = latest_candle.get(f'ema{EMA_MEDIUM}')
    ema_long = latest_candle.get(f'ema{EMA_LONG}')
    
    rsi_signal = 'NEUTRAL'
    ema_signal = 'NEUTRAL'
    
    previous_rsi = previous_candle.get('rsi') if previous_candle else None
    
    if current_rsi is not None:
        if previous_rsi is not None and previous_rsi <= RSI_OVERSOLD and current_rsi > RSI_OVERSOLD:
            rsi_signal = 'BUY'
        elif previous_rsi is not None and previous_rsi >= RSI_OVERBOUGHT and current_rsi < RSI_OVERBOUGHT:
            rsi_signal = 'SELL'
        elif current_rsi <= RSI_OVERSOLD:
            rsi_signal = 'OVERSOLD'
        elif current_rsi >= RSI_OVERBOUGHT:
            rsi_signal = 'OVERBOUGHT'
    
    if ema_short is not None and ema_medium is not None and ema_long is not None:
        if ema_short > ema_medium > ema_long:
            ema_signal = 'STRONG_BUY'
        elif ema_short < ema_medium < ema_long:
            ema_signal = 'STRONG_SELL'
        elif previous_candle and ema_short > ema_medium and previous_candle.get(f'ema{EMA_SHORT}', 0) <= previous_candle.get(f'ema{EMA_MEDIUM}', 0):
            ema_signal = 'BUY'
        elif previous_candle and ema_short < ema_medium and previous_candle.get(f'ema{EMA_SHORT}', 0) >= previous_candle.get(f'ema{EMA_MEDIUM}', 0):
            ema_signal = 'SELL'
        else:
            ema_signal = 'NEUTRAL'
    
    print("\n============== Indicators ========================\n")
    print(f"RSI Signal: {rsi_signal}, RSI: {current_rsi}")
    print(f"EMA Signal: {ema_signal}, EMA{EMA_SHORT}: {ema_short}, EMA{EMA_MEDIUM}: {ema_medium}, EMA{EMA_LONG}: {ema_long}")
    print(f"Price: {current_price}")
    
    return {
        'rsi_signal': rsi_signal,
        'ema_signal': ema_signal,
        'rsi': current_rsi,
        'price': current_price,
        f'ema{EMA_SHORT}': ema_short,
        f'ema{EMA_MEDIUM}': ema_medium,
        f'ema{EMA_LONG}': ema_long
    }
