import os
import numpy as np
import tensorflow as tf
import joblib
import pandas as pd

def get_lstm_output(candles):
    print("LSTM Model Analysis")
    print(f"Total candles available: {len(candles)}")
    
    # Define column headers with new indicators
    headers = ["Open Time", "Close", "Volume", "RSI", "MACD", "MACD Signal", "Upper Band", "Lower Band"]
    
    # Calculate column widths based on headers and data
    col_widths = [15, 12, 15, 8, 10, 12, 15, 15]  # Adjusted widths
    
    # Create header row
    header_row = "| " + " | ".join(f"{headers[i]:<{col_widths[i]}}" for i in range(len(headers))) + " |"
    separator = "|-" + "-|-".join("-" * width for width in col_widths) + "-|"
    
    # Print table header
    print(separator)
    print(header_row)
    print(separator)
    
    # Print each row of data
    for i, candle in enumerate(candles):
        # Check if we have the indicators available (handles None values)
        rsi = f"{candle.get('rsi', ''):<8.2f}" if candle.get('rsi') is not None else "N/A     "
        macd = f"{candle.get('macd', ''):<10.2f}" if candle.get('macd') is not None else "N/A       "
        macd_signal = f"{candle.get('macd_signal', ''):<12.2f}" if candle.get('macd_signal') is not None else "N/A         "
        upper_band = f"{candle.get('upper_band', ''):<15.2f}" if candle.get('upper_band') is not None else "N/A            "
        lower_band = f"{candle.get('lower_band', ''):<15.2f}" if candle.get('lower_band') is not None else "N/A            "
        
        # Convert timestamp to readable format if needed
        open_time = candle['open_time']
        
        row = f"| {open_time:<15} | {candle['close']:<12.2f} | {candle['volume']:<15.4f} | {rsi} | {macd} | {macd_signal} | {upper_band} | {lower_band} |"
        print(row)
    
    print(separator)
    
    # Only proceed if we have enough candles for prediction (need 60 for the model)
    if len(candles) < 60:
        print("Not enough candles for LSTM prediction (need at least 60)")
        return None
    
    try:
        # Load the model and scalers
        model_dir = os.path.join("models", "BTC1min_I60")
        model_path = os.path.join(model_dir, "crypto_lstm_model.h5")
        feature_scaler_path = os.path.join(model_dir, "feature_scaler.save")
        close_scaler_path = os.path.join(model_dir, "close_scaler.save")
        
        model = tf.keras.models.load_model(model_path)
        feature_scaler = joblib.load(feature_scaler_path)
        close_scaler = joblib.load(close_scaler_path)
        
        print("\nLSTM Model Loaded Successfully")
        
        # Extract features needed for prediction (same as used during training)
        df = pd.DataFrame(candles)
        feature_columns = ['close', 'volume', 'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume',
                           'rsi', 'macd', 'macd_signal', 'upper_band', 'lower_band']
        
        # Make sure all required columns are available
        for col in feature_columns:
            if col not in df.columns:
                print(f"Warning: Missing required column '{col}' for prediction")
                return None
        
        # Get last 60 candles for prediction
        last_sequence = df[feature_columns].tail(60).values
        
        # Scale the features
        last_sequence_scaled = feature_scaler.transform(last_sequence)
        
        # Reshape for LSTM input [samples, time steps, features]
        X_pred = np.array([last_sequence_scaled])
        
        # Make prediction
        predicted_scaled = model.predict(X_pred)
        
        # Inverse transform to get the actual price
        predicted_price = close_scaler.inverse_transform(predicted_scaled)
        
        # Get the last known price for comparison
        last_known_price = df['close'].iloc[-1]
        
        # Calculate price change and percentage change
        price_change = predicted_price[0][0] - last_known_price
        percentage_change = (price_change / last_known_price) * 100
        
        # Print prediction results
        print("\nLSTM Price Prediction:")
        print(f"Last known price: ${last_known_price:.2f}")
        print(f"Predicted next price: ${predicted_price[0][0]:.2f}")
        print(f"Predicted change: ${price_change:.2f} ({percentage_change:.2f}%)")
        
        # Simple trading signal based on predicted change
        if percentage_change > 0.5:
            signal = "BUY"
        elif percentage_change < -0.5:
            signal = "SELL"
        else:
            signal = "HOLD"
        
        print(f"Trading signal: {signal}")
        
        return {
            "predicted_price": float(predicted_price[0][0]),
            "price_change": float(price_change),
            "percentage_change": float(percentage_change),
            "signal": signal
        }
        
    except Exception as e:
        print(f"Error making LSTM prediction: {e}")
        return None