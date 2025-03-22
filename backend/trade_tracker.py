import csv
import os
from datetime import datetime
import pandas as pd
import matplotlib.pyplot as plt

CSV_FILE_PATH = "trade_history.csv"

def initialize_csv():
    """Create CSV file with headers if it doesn't exist"""
    if not os.path.exists(CSV_FILE_PATH):
        with open(CSV_FILE_PATH, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow([
                'order_id', 
                'timestamp', 
                'symbol', 
                'entry_price', 
                'exit_price',
                'quantity', 
                'pnl', 
                'percentage_gain',
                'take_profit_price',
                'stop_loss_price',
                'trade_duration_minutes',
                'result'  # 'TAKE_PROFIT', 'STOP_LOSS', 'MANUAL'
            ])
        print(f"Created new trade history CSV file at {CSV_FILE_PATH}")
    else:
        print(f"Using existing trade history CSV file at {CSV_FILE_PATH}")

def log_trade(order_id, symbol, entry_price, exit_price, quantity, 
              take_profit_price, stop_loss_price, exit_type, entry_time=None):
    """
    Record a completed trade to the CSV file
    
    Parameters:
    - order_id: The unique ID of the trade
    - symbol: Trading pair symbol
    - entry_price: Price at which the position was opened
    - exit_price: Price at which the position was closed
    - quantity: Amount of base asset traded
    - take_profit_price: The target price for the trade
    - stop_loss_price: The stop loss price for the trade
    - exit_type: How the trade was closed ('TAKE_PROFIT', 'STOP_LOSS', 'MANUAL')
    - entry_time: When the trade was opened (defaults to now if not provided)
    """
    # Make sure the CSV file exists
    initialize_csv()
    
    # Calculate profit/loss
    pnl = (exit_price - entry_price) * float(quantity)
    percentage_gain = ((exit_price - entry_price) / entry_price) * 100
    
    # Calculate trade duration
    current_time = datetime.now()
    if entry_time is None or not isinstance(entry_time, datetime):
        # Default to now minus 1 hour if entry_time is not provided or invalid
        entry_time = current_time.replace(hour=current_time.hour-1)
    
    # Calculate duration in minutes
    duration_minutes = (current_time - entry_time).total_seconds() / 60
    
    # Prepare the trade record
    trade_record = [
        order_id,
        current_time.strftime("%Y-%m-%d %H:%M:%S"),
        symbol,
        entry_price,
        exit_price,
        quantity,
        round(pnl, 2),
        round(percentage_gain, 2),
        take_profit_price,
        stop_loss_price,
        round(duration_minutes, 2),
        exit_type
    ]
    
    # Write to CSV file
    with open(CSV_FILE_PATH, 'a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(trade_record)
    
    print(f"Trade recorded: {symbol} {exit_type}, PnL: ${pnl:.2f} ({percentage_gain:.2f}%)")
    return trade_record

def generate_performance_summary():
    """Generate a performance summary from the trade history CSV"""
    if not os.path.exists(CSV_FILE_PATH):
        print("No trade history found. Start trading to generate data.")
        return None
    
    # Load the CSV into a pandas DataFrame
    df = pd.read_csv(CSV_FILE_PATH)
    
    # Skip if no trades are recorded
    if len(df) == 0:
        print("No trades have been recorded yet.")
        return None
    
    # Calculate performance metrics
    total_trades = len(df)
    profitable_trades = len(df[df['pnl'] > 0])
    take_profit_trades = len(df[df['result'] == 'TAKE_PROFIT'])
    stop_loss_trades = len(df[df['result'] == 'STOP_LOSS'])
    manual_trades = len(df[df['result'] == 'MANUAL'])
    
    total_pnl = df['pnl'].sum()
    win_rate = (profitable_trades / total_trades) * 100 if total_trades > 0 else 0
    
    # Calculate average gains and losses
    avg_win = df[df['pnl'] > 0]['pnl'].mean() if profitable_trades > 0 else 0
    avg_loss = df[df['pnl'] < 0]['pnl'].mean() if (total_trades - profitable_trades) > 0 else 0
    
    # Output the results
    summary = {
        'total_trades': total_trades,
        'profitable_trades': profitable_trades,
        'take_profit_trades': take_profit_trades,
        'stop_loss_trades': stop_loss_trades,
        'manual_trades': manual_trades,
        'total_pnl': round(total_pnl, 2),
        'win_rate': round(win_rate, 2),
        'avg_win': round(avg_win, 2) if avg_win else 0,
        'avg_loss': round(avg_loss, 2) if avg_loss else 0
    }
    
    print("\n============ PERFORMANCE SUMMARY ============")
    print(f"Total Trades: {total_trades}")
    print(f"Profitable Trades: {profitable_trades} ({win_rate:.2f}%)")
    print(f"Take Profit Hits: {take_profit_trades}")
    print(f"Stop Loss Hits: {stop_loss_trades}")
    print(f"Manual Exits: {manual_trades}")
    print(f"Total P&L: ${total_pnl:.2f}")
    print(f"Average Win: ${avg_win:.2f}")
    print(f"Average Loss: ${avg_loss:.2f}")
    
    return summary

def plot_performance():
    """Generate performance charts from trade history"""
    if not os.path.exists(CSV_FILE_PATH):
        print("No trade history found. Start trading to generate data.")
        return
    
    df = pd.read_csv(CSV_FILE_PATH)
    
    if len(df) == 0:
        print("No trades have been recorded yet.")
        return
    
    # Convert timestamp to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Create a figure with multiple subplots
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    
    # 1. Cumulative P&L over time
    df_sorted = df.sort_values('timestamp')
    df_sorted['cumulative_pnl'] = df_sorted['pnl'].cumsum()
    
    axes[0, 0].plot(df_sorted['timestamp'], df_sorted['cumulative_pnl'])
    axes[0, 0].set_title('Cumulative P&L Over Time')
    axes[0, 0].set_ylabel('P&L ($)')
    axes[0, 0].tick_params(axis='x', rotation=45)
    
    # 2. Trade results distribution (take profit, stop loss, manual)
    result_counts = df['result'].value_counts()
    axes[0, 1].bar(result_counts.index, result_counts.values)
    axes[0, 1].set_title('Trade Result Distribution')
    axes[0, 1].set_ylabel('Count')
    
    # 3. P&L per trade
    axes[1, 0].bar(range(len(df)), df['pnl'], color=['green' if pnl > 0 else 'red' for pnl in df['pnl']])
    axes[1, 0].axhline(y=0, color='black', linestyle='-', alpha=0.3)
    axes[1, 0].set_title('P&L per Trade')
    axes[1, 0].set_xlabel('Trade #')
    axes[1, 0].set_ylabel('P&L ($)')
    
    # 4. Trade duration vs P&L
    scatter = axes[1, 1].scatter(df['trade_duration_minutes'], df['pnl'], 
                       c=['green' if pnl > 0 else 'red' for pnl in df['pnl']], alpha=0.6)
    axes[1, 1].set_title('Trade Duration vs P&L')
    axes[1, 1].set_xlabel('Duration (minutes)')
    axes[1, 1].set_ylabel('P&L ($)')
    axes[1, 1].axhline(y=0, color='black', linestyle='-', alpha=0.3)
    
    plt.tight_layout()
    
    # Save the figure
    chart_path = "d:/Programming/React JS/HackoverFlow-3.0/backend/performance_charts.png"
    plt.savefig(chart_path)
    plt.close()
    
    print(f"Performance charts saved to {chart_path}")
    
