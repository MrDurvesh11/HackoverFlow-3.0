import pandas as pd
import numpy as np

def process_crypto_data(input_file, output_file):
    """
    Process cryptocurrency data to prepare for LSTM training using pandas_ta
    
    Args:
        input_file (str): Path to input CSV file
        output_file (str): Path to output processed CSV file
    """
    try:
        # Try to import pandas_ta
        import pandas_ta as ta
    except ImportError:
        print("pandas_ta is not installed. Installing now...")
        import subprocess
        subprocess.check_call(["pip", "install", "pandas_ta"])
        import pandas_ta as ta
    
    # Read the CSV file with header
    df = pd.read_csv(input_file)
    
    # Convert Open Time to datetime
    df['Open Time'] = pd.to_datetime(df['Open Time'])
    
    # Calculate RSI (14 period default)
    df['rsi'] = df.ta.rsi(close='Close', length=14)
    
    # Calculate MACD (12, 26, 9 default parameters)
    macd = df.ta.macd(close='Close', fast=12, slow=26, signal=9)
    df['macd'] = macd['MACD_12_26_9']
    df['macd_signal'] = macd['MACDs_12_26_9']
    
    # Calculate Bollinger Bands (20 period, 2 std dev default)
    bbands = df.ta.bbands(close='Close', length=20, std=2)
    df['upper_band'] = bbands['BBU_20_2.0']
    df['lower_band'] = bbands['BBL_20_2.0']
    
    # Select only required columns
    required_columns = [
        'Open Time', 'Close', 'Volume', 
        'Taker Buy Base Asset Volume', 'Taker Buy Quote Asset Volume',
        'rsi', 'macd', 'macd_signal', 'upper_band', 'lower_band'
    ]
    
    processed_df = df[required_columns]
    
    # Fill NaN values for technical indicators
    # First, forward fill
    tech_columns = ['rsi', 'macd', 'macd_signal', 'upper_band', 'lower_band']
    processed_df[tech_columns] = processed_df[tech_columns].fillna(method='ffill')
    
    # Then, backward fill for any remaining NaNs at the beginning
    processed_df[tech_columns] = processed_df[tech_columns].fillna(method='bfill')
    
    # Save the processed data to a new CSV file
    processed_df.to_csv(output_file, index=False)
    
    print(f"Processed data saved to {output_file}")
    print(f"Data shape: {processed_df.shape}")
    
    # Return first few rows to preview
    return processed_df.head()

# Example usage
if __name__ == "__main__":
    # Replace these with your actual file paths
    input_file = "btc_1m_klines.csv"
    output_file = "processed_btc1.csv"
    
    try:
        # Process the data
        preview = process_crypto_data(input_file, output_file)
        print("\nPreview of processed data:")
        print(preview)
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        print("\nIf pandas_ta is not installed, you can install it with:")
        print("pip install pandas_ta")