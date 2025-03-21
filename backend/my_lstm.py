def get_lstm_output(candles):
    print("LSTM Model Analysis")
    print(f"Total candles available: {len(candles)}")
    
    # Define column headers
    headers = ["Open Time", "Close", "Volume", "Taker Buy Base Vol", "Taker Buy Quote Vol"]
    
    # Calculate column widths based on headers and data
    col_widths = [15, 12, 15, 20, 22]  # Default widths
    
    # Create header row
    header_row = "| " + " | ".join(f"{headers[i]:<{col_widths[i]}}" for i in range(len(headers))) + " |"
    separator = "|-" + "-|-".join("-" * width for width in col_widths) + "-|"
    
    # Print table header
    print(separator)
    print(header_row)
    print(separator)
    
    # Print each row of data
    for i, candle in enumerate(candles):
        # Convert timestamp to readable format if needed
        open_time = candle['open_time']
        
        row = f"| {open_time:<15} | {candle['close']:<12.2f} | {candle['volume']:<15.4f} | {candle['taker_buy_base_asset_volume']:<20.4f} | {candle['taker_buy_quote_asset_volume']:<22.4f} |"
        print(row)
    
    print(separator)
    return None