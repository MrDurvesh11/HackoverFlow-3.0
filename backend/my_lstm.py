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
        model_dir = os.path.join("models", "BTC1min_I60_O10")
        model_path = os.path.join(model_dir, "crypto_lstm_model_multi_step.h5")
        feature_scaler_path = os.path.join(model_dir, "feature_scaler_multi_step.save")
        close_scaler_path = os.path.join(model_dir, "close_scaler_multi_step.save")
        
        model = tf.keras.models.load_model(model_path)
        feature_scaler = joblib.load(feature_scaler_path)
        close_scaler = joblib.load(close_scaler_path)
        
        print("\nLSTM Multi-Step Model Loaded Successfully")
        
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
        
        # Debug prints to understand input shape
        print(f"Input shape: {X_pred.shape}")
        
        # Make prediction for next 10 candles
        predicted_scaled = model.predict(X_pred)
        
        # Debug prints to understand output shape
        print(f"Prediction output shape: {predicted_scaled.shape}")
        
        # Initialize array to store inverse-transformed predictions
        # Handle different possible output shapes
        if len(predicted_scaled.shape) == 3:
            # If shape is (1, forecast_horizon, 1)
            forecast_horizon = predicted_scaled.shape[1]
            predicted_prices = np.zeros(forecast_horizon)
            
            for i in range(forecast_horizon):
                step_prediction = predicted_scaled[0, i].reshape(-1, 1)
                predicted_prices[i] = close_scaler.inverse_transform(step_prediction)[0, 0]
                
        elif len(predicted_scaled.shape) == 2:
            # If shape is (1, forecast_horizon)
            forecast_horizon = predicted_scaled.shape[1]
            predicted_prices = np.zeros(forecast_horizon)
            
            for i in range(forecast_horizon):
                step_prediction = np.array([[predicted_scaled[0, i]]])
                predicted_prices[i] = close_scaler.inverse_transform(step_prediction)[0, 0]
                
        else:
            # If shape is (1, 1) or other unexpected shape
            # Try to handle as single value prediction
            print(f"Unexpected prediction shape: {predicted_scaled.shape}")
            predicted_prices = np.zeros(10)  # Default to 10 steps
            
            try:
                # Try to reshape and inverse_transform
                reshaped_pred = predicted_scaled.reshape(-1, 1)
                single_price = close_scaler.inverse_transform(reshaped_pred)[0, 0]
                predicted_prices.fill(single_price)  # Fill with the same value as fallback
                print(f"Using single value prediction: {single_price}")
            except Exception as reshape_error:
                print(f"Error reshaping prediction: {reshape_error}")
                # As a last resort, just return nominal values
                last_known_price = df['close'].iloc[-1]
                predicted_prices.fill(last_known_price)
                print(f"Fallback to last known price: {last_known_price}")
        
        # Get the last known price for comparison
        last_known_price = df['close'].iloc[-1]
        
        # Calculate immediate price change (first candle)
        immediate_change = predicted_prices[0] - last_known_price
        immediate_percentage = (immediate_change / last_known_price) * 100
        
        # Analyze trend using average of all predicted candles compared to last known price
        avg_predicted_price = np.mean(predicted_prices)
        overall_change = avg_predicted_price - last_known_price
        overall_percentage = (overall_change / last_known_price) * 100
        
        # Also calculate endpoints change for comparison
        first_price = predicted_prices[0]
        last_price = predicted_prices[-1]
        endpoint_change = last_price - first_price
        endpoint_percentage = (endpoint_change / first_price) * 100
        
        # Calculate trend strength using linear regression
        x = np.arange(len(predicted_prices))
        y = predicted_prices
        
        # Handle case where all predictions are the same (avoid zero division)
        if np.all(predicted_prices == predicted_prices[0]):
            print("All predicted prices are identical - setting trend strength to 0")
            trend_strength = 0.0
            slope = 0.0
        else:
            try:
                # Calculate linear regression properly
                slope, intercept = np.polyfit(x, y, 1)
                
                # Calculate R² correctly
                y_pred = slope * x + intercept
                y_mean = np.mean(y)
                
                # R² = 1 - SSres/SStot
                ss_res = np.sum((y - y_pred) ** 2)
                ss_tot = np.sum((y - y_mean) ** 2)
                
                # Avoid division by zero
                if ss_tot == 0:
                    print("No variance in predicted prices - setting trend strength to 0")
                    trend_strength = 0.0
                else:
                    r_squared = 1 - (ss_res / ss_tot)
                    trend_strength = abs(r_squared)
                    print(f"Calculated R²: {r_squared:.4f}, Trend strength: {trend_strength:.4f}")
                    
            except Exception as fit_error:
                print(f"Error in trend calculation: {fit_error}")
                trend_strength = 0.0
                slope = 0.0
        
        # Determine trend direction based on average price comparison
        if overall_percentage > 0.10:
            trend = "STRONG_UPTREND" if trend_strength > 0.7 else "UPTREND"
        elif overall_percentage < -0.10:
            trend = "STRONG_DOWNTREND" if trend_strength > 0.7 else "DOWNTREND"
        elif overall_percentage > 0.04:
            trend = "WEAK_UPTREND"
        elif overall_percentage < -0.04:
            trend = "WEAK_DOWNTREND"
        else:
            trend = "SIDEWAYS"
        
        # Calculate target price based on trend direction
        if "UPTREND" in trend:
            # For uptrends, target is the maximum predicted price
            target_price = float(np.max(predicted_prices))
            target_candle = int(np.argmax(predicted_prices)) + 1  # +1 to make it 1-indexed
            target_change = target_price - last_known_price
            target_percentage = (target_change / last_known_price) * 100
        elif "DOWNTREND" in trend:
            # For downtrends, target is the minimum predicted price
            target_price = float(np.min(predicted_prices))
            target_candle = int(np.argmin(predicted_prices)) + 1  # +1 to make it 1-indexed
            target_change = target_price - last_known_price
            target_percentage = (target_change / last_known_price) * 100
        else:  # SIDEWAYS
            # For simplicity in return value, use avg_predicted_price as the target
            target_price = float(avg_predicted_price)
            target_candle = int(len(predicted_prices) // 2)  # Middle of the forecast horizon
            target_change = target_price - last_known_price
            target_percentage = (target_change / last_known_price) * 100
        
        # Generate trading signal based on trend analysis
        if trend in ["STRONG_UPTREND", "UPTREND"]:
            signal = "BUY"
        elif trend in ["STRONG_DOWNTREND", "DOWNTREND"]:
            signal = "SELL"
        elif trend == "WEAK_UPTREND" and immediate_percentage > 0.04:
            signal = "BUY"
        elif trend == "WEAK_DOWNTREND" and immediate_percentage < -0.04:
            signal = "SELL"
        else:
            signal = "HOLD"
        
        # Print prediction results
        print("\n=======LSTM Multi-Step Price Prediction=======")
        print(f"Last known price: ${last_known_price:.2f}")
        print(f"Predicted prices for next 10 candles:")
        for i, price in enumerate(predicted_prices):
            print(f"  Candle {i+1}: ${price:.2f}")
        
        print(f"\nImmediate change (next candle): ${immediate_change:.2f} ({immediate_percentage:.2f}%)")
        print(f"Average predicted price: ${avg_predicted_price:.2f}")
        print(f"Overall change (avg vs last known): ${overall_change:.2f} ({overall_percentage:.2f}%)")
        print(f"Endpoint change (candle 10 vs candle 1): ${endpoint_change:.2f} ({endpoint_percentage:.2f}%)")
        print(f"Overall trend: {trend}")
        print(f"Trend strength: {trend_strength:.2f}")
        print(f"Trading signal: {signal}")
        print(f"Target price: ${target_price:.2f} (Candle {target_candle})")
        print(f"Target change: ${target_change:.2f} ({target_percentage:.2f}%)")
        
        
        return {
            "predicted_prices": predicted_prices.tolist(),
            "immediate_price_change": float(immediate_change),
            "immediate_percentage_change": float(immediate_percentage),
            "average_predicted_price": float(avg_predicted_price),
            "overall_change": float(overall_change),
            "overall_percentage_change": float(overall_percentage),
            "endpoint_change": float(endpoint_change),
            "endpoint_percentage_change": float(endpoint_percentage),
            "trend": trend,
            "trend_strength": float(trend_strength),
            "signal": signal,
            "target_price": target_price,
            "target_candle": target_candle,
            "target_change": float(target_change),
            "target_percentage": float(target_percentage)
        }
        
    except Exception as e:
        print(f"Error making LSTM prediction: {e}")
        import traceback
        traceback.print_exc()
        return None