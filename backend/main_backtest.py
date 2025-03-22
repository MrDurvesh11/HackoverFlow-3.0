import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from collections import deque
import os
import time
from datetime import datetime, timedelta
import argparse
import csv

# Import existing modules
from my_lstm import get_lstm_output
from my_indicator import get_indicator_data
from my_monte_carlo import get_monte_carlo_data
from my_order_manager import generate_order

# Backtesting parameters
INITIAL_CAPITAL = 10000.0  # Starting capital
CSV_FILE_PATH = "../processed_eth1.csv"  # Default path
WARMUP_CANDLES = 60  # Number of candles needed for indicators and LSTM
OUTPUT_DIR = "backtest_results"  # Directory to save results

class Trade:
    """Class to represent a trade during backtesting"""
    def __init__(self, order_id, symbol, entry_price, quantity, take_profit, stop_loss, entry_time):
        self.order_id = order_id
        self.symbol = symbol
        self.entry_price = entry_price
        self.quantity = quantity
        self.take_profit = take_profit
        self.stop_loss = stop_loss
        self.entry_time = entry_time
        self.exit_price = None
        self.exit_time = None
        self.exit_type = None
        self.profit_loss = None
        self.profit_loss_pct = None
        
    def close_trade(self, exit_price, exit_time, exit_type):
        """Close the trade and calculate profit/loss"""
        self.exit_price = exit_price
        self.exit_time = exit_time
        self.exit_type = exit_type
        
        # Calculate profit/loss
        self.profit_loss = (self.exit_price - self.entry_price) * self.quantity
        self.profit_loss_pct = (self.exit_price - self.entry_price) / self.entry_price * 100
        
    def __str__(self):
        return (f"Trade {self.order_id}: {self.symbol} - "
                f"Entry: ${self.entry_price:.2f} at {self.entry_time} - "
                f"Exit: ${self.exit_price:.2f} at {self.exit_time} - "
                f"P/L: ${self.profit_loss:.2f} ({self.profit_loss_pct:.2f}%)")

class Portfolio:
    """Class to track portfolio state during backtesting"""
    def __init__(self, initial_capital):
        self.initial_capital = initial_capital
        self.cash = initial_capital
        self.holdings = {}  # symbol -> quantity
        self.equity_history = []  # List of (timestamp, equity_value) tuples
        self.trades = []  # List of Trade objects
        self.active_trades = []  # List of active Trade objects
        self.next_order_id = 1
        
    def update_equity(self, timestamp, current_prices):
        """Update the equity value based on current holdings and prices"""
        holdings_value = sum(self.holdings.get(symbol, 0) * price 
                            for symbol, price in current_prices.items())
        total_equity = self.cash + holdings_value
        self.equity_history.append((timestamp, total_equity))
        return total_equity
    
    def execute_buy(self, symbol, price, quantity, take_profit, stop_loss, timestamp):
        """Execute a buy order if there's enough cash"""
        order_cost = price * quantity
        
        if order_cost > self.cash:
            # Adjust quantity based on available cash (95% to leave some buffer)
            quantity = (self.cash * 0.95) / price
            if quantity <= 0:
                print(f"Not enough cash to execute buy order at {timestamp}")
                return None
            order_cost = price * quantity
            
        # Deduct cash and add to holdings
        self.cash -= order_cost
        self.holdings[symbol] = self.holdings.get(symbol, 0) + quantity
        
        # Create and record trade
        trade = Trade(
            order_id=self.next_order_id,
            symbol=symbol,
            entry_price=price,
            quantity=quantity,
            take_profit=take_profit,
            stop_loss=stop_loss,
            entry_time=timestamp
        )
        self.next_order_id += 1
        self.active_trades.append(trade)
        
        print(f"BUY executed at {timestamp}: {quantity:.5f} {symbol} @ ${price:.2f}")
        print(f"Cash: ${self.cash:.2f}, Holdings: {self.holdings}")
        
        return trade
    
    def execute_sell(self, trade, price, timestamp, exit_type):
        """Execute a sell order for an existing trade"""
        if trade.symbol not in self.holdings or self.holdings[trade.symbol] < trade.quantity:
            print(f"Warning: Not enough {trade.symbol} to execute sell at {timestamp}")
            return False
        
        # Add cash and reduce holdings
        self.cash += price * trade.quantity
        self.holdings[trade.symbol] -= trade.quantity
        
        # If holdings become very small, remove them (avoid dust)
        if self.holdings[trade.symbol] < 0.00001:
            self.holdings[trade.symbol] = 0
        
        # Close the trade
        trade.close_trade(price, timestamp, exit_type)
        
        # Move from active to completed trades
        self.active_trades.remove(trade)
        self.trades.append(trade)
        
        print(f"SELL executed at {timestamp}: {trade.quantity:.5f} {trade.symbol} @ ${price:.2f}")
        print(f"Exit type: {exit_type}, P/L: ${trade.profit_loss:.2f} ({trade.profit_loss_pct:.2f}%)")
        print(f"Cash: ${self.cash:.2f}, Holdings: {self.holdings}")
        
        return True
    
    def check_take_profit_stop_loss(self, current_prices, timestamp):
        """Check if any active trades hit take profit or stop loss"""
        for trade in list(self.active_trades):  # Use list to avoid modification during iteration
            current_price = current_prices.get(trade.symbol)
            if current_price is None:
                continue
                
            # Check take profit
            if current_price >= trade.take_profit:
                print(f"\n=== TAKE PROFIT HIT at {timestamp} ===")
                print(f"Symbol: {trade.symbol}, Current: ${current_price:.2f}, Target: ${trade.take_profit:.2f}")
                self.execute_sell(trade, current_price, timestamp, "TAKE_PROFIT")
                
            # Check stop loss
            elif current_price <= trade.stop_loss:
                print(f"\n=== STOP LOSS HIT at {timestamp} ===")
                print(f"Symbol: {trade.symbol}, Current: ${current_price:.2f}, Stop: ${trade.stop_loss:.2f}")
                self.execute_sell(trade, current_price, timestamp, "STOP_LOSS")

def load_data(file_path):
    """Load and preprocess backtest data from CSV"""
    print(f"Loading data from {file_path}...")
    
    try:
        # Load data
        df = pd.read_csv(file_path)
        
        # Convert timestamp string to datetime
        df['Open Time'] = pd.to_datetime(df['Open Time'])
        
        # Rename columns to match expected format for analysis modules
        df = df.rename(columns={
            'Open Time': 'open_time',
            'Close': 'close',
            'Volume': 'volume',
            'Taker Buy Base Asset Volume': 'taker_buy_base_asset_volume',
            'Taker Buy Quote Asset Volume': 'taker_buy_quote_asset_volume',
            'rsi': 'rsi',
            'macd': 'macd',
            'macd_signal': 'macd_signal',
            'upper_band': 'upper_band',
            'lower_band': 'lower_band'
        })
        
        # Add high and low columns if not present (needed by some functions)
        if 'high' not in df.columns:
            df['high'] = df['close']
        if 'low' not in df.columns:
            df['low'] = df['close']
        if 'open' not in df.columns:
            df['open'] = df['close']
        
        print(f"Loaded {len(df)} candles from {df['open_time'].min()} to {df['open_time'].max()}")
        return df
        
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

def run_backtest(data, initial_capital):
    """Run the backtest on the provided data"""
    # Create portfolio to track performance
    portfolio = Portfolio(initial_capital)
    
    # Initialize candles deque (like in main.py)
    candles = deque(maxlen=WARMUP_CANDLES)
    
    # Skip first WARMUP_CANDLES to have enough data for indicators
    start_idx = WARMUP_CANDLES
    
    print(f"Starting backtest with {len(data)} candles...")
    print(f"Initial capital: ${initial_capital:.2f}")
    print(f"Warming up with {WARMUP_CANDLES} candles...")
    
    # Add initial candles to the deque
    for i in range(start_idx):
        candle = data.iloc[i].to_dict()
        candles.append(candle)
    
    # Prepare results storage
    results = {
        "timestamps": [],
        "prices": [],
        "signals": [],
        "equity": []
    }
    
    # Run backtest
    for i in range(start_idx, len(data)):
        # Get current candle
        candle = data.iloc[i].to_dict()
        current_time = candle['open_time']
        current_price = candle['close']
        
        # Store timestamp and price for plotting
        results["timestamps"].append(current_time)
        results["prices"].append(current_price)
        
        # Add current candle to our deque
        candles.append(candle)
        
        # Check if any active trades hit take profit or stop loss
        portfolio.check_take_profit_stop_loss(
            {"BTCUSDT": current_price}, 
            current_time
        )
        
        # Update portfolio value
        equity = portfolio.update_equity(
            current_time, 
            {"BTCUSDT": current_price}
        )
        results["equity"].append(equity)
        
        # Only generate new signals every 5 candles to avoid excessive trading
        # and to better simulate real-world conditions
        if i % 5 == 0:
            # Convert deque to list for analysis
            candles_list = list(candles)
            
            # Run analysis modules
            print(f"\n=== Analyzing candle at {current_time} (index {i}/{len(data)}) ===")
            print(f"Current price: ${current_price:.2f}")
            
            # Call analysis modules
            try:
                lstm_response = get_lstm_output(candles_list)
                indicator_response = get_indicator_data(candles_list)
                monte_carlo_response = get_monte_carlo_data(candles_list)
                
                # Generate order based on analysis
                order = generate_order(lstm_response, indicator_response, monte_carlo_response)
                
                # Store signal for plotting
                if order:
                    signal = "BUY"
                    results["signals"].append((current_time, current_price, signal))
                    
                    # Simulate execution on the next candle to avoid lookahead bias
                    if i + 1 < len(data):
                        next_candle = data.iloc[i + 1].to_dict()
                        next_price = next_candle['close']
                        next_time = next_candle['open_time']
                        
                        # Execute the order
                        trade = portfolio.execute_buy(
                            symbol="BTCUSDT",
                            price=next_price,
                            quantity=float(order['quantity']),
                            take_profit=float(order['takeProfit']),
                            stop_loss=float(order['stopLoss']),
                            timestamp=next_time
                        )
                else:
                    print("No order generated for this candle")
                    
            except Exception as e:
                print(f"Error in analysis at candle {i}: {e}")
        
        # Print progress occasionally
        if i % 100 == 0 or i == len(data) - 1:
            completed_pct = (i - start_idx + 1) / (len(data) - start_idx) * 100
            print(f"Progress: {completed_pct:.1f}% - Current Equity: ${equity:.2f}")
    
    # Close any remaining trades at the last price
    last_candle = data.iloc[-1].to_dict()
    last_price = last_candle['close']
    last_time = last_candle['open_time']
    
    for trade in list(portfolio.active_trades):
        print(f"\n=== CLOSING TRADE AT END OF BACKTEST ===")
        portfolio.execute_sell(trade, last_price, last_time, "BACKTEST_END")
    
    # Final portfolio update
    final_equity = portfolio.update_equity(
        last_time, 
        {"BTCUSDT": last_price}
    )
    
    print(f"\nBacktest completed. Final equity: ${final_equity:.2f}")
    
    return portfolio, results

def calculate_metrics(portfolio):
    """Calculate performance metrics from backtest results"""
    if not portfolio.trades:
        return {
            "total_trades": 0,
            "winning_trades": 0,
            "losing_trades": 0,
            "win_rate": 0,
            "profit_loss": 0,
            "return_pct": 0,
            "max_drawdown": 0,
            "average_profit": 0,
            "average_loss": 0,
            "profit_factor": 0,
            "sharpe_ratio": 0
        }
        
    # Basic trade statistics
    total_trades = len(portfolio.trades)
    winning_trades = sum(1 for trade in portfolio.trades if trade.profit_loss > 0)
    losing_trades = sum(1 for trade in portfolio.trades if trade.profit_loss <= 0)
    win_rate = winning_trades / total_trades if total_trades > 0 else 0
    
    # Profit and loss
    total_profit = sum(trade.profit_loss for trade in portfolio.trades if trade.profit_loss > 0)
    total_loss = sum(trade.profit_loss for trade in portfolio.trades if trade.profit_loss <= 0)
    net_profit = total_profit + total_loss
    
    # Average profit and loss
    avg_profit = total_profit / winning_trades if winning_trades > 0 else 0
    avg_loss = total_loss / losing_trades if losing_trades > 0 else 0
    
    # Profit factor
    profit_factor = abs(total_profit / total_loss) if total_loss != 0 else float('inf')
    
    # Calculate equity curve and drawdown
    equity_values = [value for _, value in portfolio.equity_history]
    return_pct = (equity_values[-1] / portfolio.initial_capital - 1) * 100
    
    # Calculate max drawdown
    max_drawdown = 0
    peak = equity_values[0]
    
    for equity in equity_values:
        if equity > peak:
            peak = equity
        drawdown = (peak - equity) / peak * 100
        if drawdown > max_drawdown:
            max_drawdown = drawdown
    
    # Calculate daily returns for Sharpe ratio
    if len(equity_values) >= 2:
        daily_returns = [(equity_values[i] / equity_values[i-1]) - 1 
                        for i in range(1, len(equity_values))]
        avg_return = np.mean(daily_returns)
        std_return = np.std(daily_returns)
        sharpe_ratio = (avg_return / std_return) * np.sqrt(252) if std_return > 0 else 0
    else:
        sharpe_ratio = 0
    
    return {
        "total_trades": total_trades,
        "winning_trades": winning_trades,
        "losing_trades": losing_trades,
        "win_rate": win_rate * 100,  # as percentage
        "profit_loss": net_profit,
        "return_pct": return_pct,
        "max_drawdown": max_drawdown,
        "average_profit": avg_profit,
        "average_loss": avg_loss,
        "profit_factor": profit_factor,
        "sharpe_ratio": sharpe_ratio
    }

def plot_results(data, portfolio, results, metrics, save_path=None):
    """Visualize backtest results"""
    # Create figure with subplots
    fig = plt.figure(figsize=(15, 12))
    
    # Price chart with buy/sell signals
    ax1 = plt.subplot2grid((4, 1), (0, 0), rowspan=2)
    ax1.set_title('BTC/USDT Price with Trading Signals')
    ax1.plot(results["timestamps"], results["prices"], label='Price', color='blue')
    
    # Add buy signals
    for timestamp, price, signal in results["signals"]:
        if signal == "BUY":
            ax1.scatter(timestamp, price, marker='^', color='green', s=100, label='Buy Signal')
    
    # Add trades
    for trade in portfolio.trades:
        # Plot entry points
        ax1.scatter(trade.entry_time, trade.entry_price, marker='o', color='green', s=80)
        
        # Plot exit points
        color = 'blue' if trade.exit_type == "TAKE_PROFIT" else 'red' if trade.exit_type == "STOP_LOSS" else 'gray'
        ax1.scatter(trade.exit_time, trade.exit_price, marker='x', color=color, s=80)
        
        # Connect entry and exit with a line
        ax1.plot([trade.entry_time, trade.exit_time], 
                [trade.entry_price, trade.exit_price], 
                color=color, linestyle='--', alpha=0.5)
    
    ax1.grid(True)
    ax1.legend()
    
    # Equity curve
    ax2 = plt.subplot2grid((4, 1), (2, 0))
    ax2.set_title('Portfolio Equity Curve')
    timestamps = [timestamp for timestamp, _ in portfolio.equity_history]
    equity = [value for _, value in portfolio.equity_history]
    ax2.plot(timestamps, equity, label='Equity', color='green')
    ax2.axhline(y=portfolio.initial_capital, color='red', linestyle='--', label='Initial Capital')
    ax2.grid(True)
    ax2.legend()
    
    # Performance metrics
    ax3 = plt.subplot2grid((4, 1), (3, 0))
    ax3.axis('off')
    ax3.set_title('Performance Metrics')
    
    metrics_text = (
        f"Total Trades: {metrics['total_trades']}\n"
        f"Win Rate: {metrics['win_rate']:.2f}%\n"
        f"Net Profit/Loss: ${metrics['profit_loss']:.2f}\n"
        f"Return: {metrics['return_pct']:.2f}%\n"
        f"Max Drawdown: {metrics['max_drawdown']:.2f}%\n"
        f"Profit Factor: {metrics['profit_factor']:.2f}\n"
        f"Sharpe Ratio: {metrics['sharpe_ratio']:.2f}\n"
        f"Avg. Profit: ${metrics['average_profit']:.2f}\n"
        f"Avg. Loss: ${metrics['average_loss']:.2f}"
    )
    
    ax3.text(0.1, 0.5, metrics_text, fontsize=12, verticalalignment='center')
    
    plt.tight_layout()
    
    # Save if path is provided
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        print(f"Results plot saved to {save_path}")
    
    plt.show()

def save_trade_history(portfolio, file_path):
    """Save trade history to CSV file"""
    with open(file_path, 'w', newline='') as csvfile:
        fieldnames = [
            'order_id', 'symbol', 'entry_time', 'entry_price', 
            'exit_time', 'exit_price', 'quantity', 'exit_type',
            'profit_loss', 'profit_loss_pct', 'take_profit', 'stop_loss'
        ]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for trade in portfolio.trades:
            writer.writerow({
                'order_id': trade.order_id,
                'symbol': trade.symbol,
                'entry_time': trade.entry_time,
                'entry_price': trade.entry_price,
                'exit_time': trade.exit_time,
                'exit_price': trade.exit_price,
                'quantity': trade.quantity,
                'exit_type': trade.exit_type,
                'profit_loss': trade.profit_loss,
                'profit_loss_pct': trade.profit_loss_pct,
                'take_profit': trade.take_profit,
                'stop_loss': trade.stop_loss
            })
    
    print(f"Trade history saved to {file_path}")

def save_equity_curve(portfolio, file_path):
    """Save equity curve to CSV file"""
    with open(file_path, 'w', newline='') as csvfile:
        fieldnames = ['timestamp', 'equity']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for timestamp, equity in portfolio.equity_history:
            writer.writerow({
                'timestamp': timestamp,
                'equity': equity
            })
    
    print(f"Equity curve saved to {file_path}")

def print_summary(metrics):
    """Print summary of backtest results"""
    print("\n=== BACKTEST SUMMARY ===")
    print(f"Total Trades: {metrics['total_trades']}")
    print(f"Winning Trades: {metrics['winning_trades']} ({metrics['win_rate']:.2f}%)")
    print(f"Losing Trades: {metrics['losing_trades']} ({100 - metrics['win_rate']:.2f}%)")
    print(f"Net Profit/Loss: ${metrics['profit_loss']:.2f}")
    print(f"Return: {metrics['return_pct']:.2f}%")
    print(f"Max Drawdown: {metrics['max_drawdown']:.2f}%")
    print(f"Profit Factor: {metrics['profit_factor']:.2f}")
    print(f"Sharpe Ratio: {metrics['sharpe_ratio']:.2f}")
    print(f"Average Profit: ${metrics['average_profit']:.2f}")
    print(f"Average Loss: ${metrics['average_loss']:.2f}")

def main():
    # Parse command line arguments for flexibility
    parser = argparse.ArgumentParser(description='Backtest trading strategy on historical data')
    parser.add_argument('--file', type=str, default=CSV_FILE_PATH, 
                       help='Path to CSV file with historical data')
    parser.add_argument('--capital', type=float, default=INITIAL_CAPITAL, 
                       help='Initial capital for backtest')
    parser.add_argument('--output', type=str, default=OUTPUT_DIR,
                       help='Directory to save results')
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    os.makedirs(args.output, exist_ok=True)
    
    # Generate timestamp for this backtest run
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Load data
    data = load_data(args.file)
    if data is None or len(data) == 0:
        print("Error: No data loaded for backtesting")
        return
    
    # Run backtest
    start_time = time.time()
    portfolio, results = run_backtest(data, args.capital)
    end_time = time.time()
    
    # Calculate performance metrics
    metrics = calculate_metrics(portfolio)
    
    # Print summary
    print_summary(metrics)
    print(f"Backtest completed in {end_time - start_time:.2f} seconds")
    
    # Save results
    trade_history_path = os.path.join(args.output, f"trade_history_{timestamp}.csv")
    equity_curve_path = os.path.join(args.output, f"equity_curve_{timestamp}.csv")
    plot_path = os.path.join(args.output, f"backtest_plot_{timestamp}.png")
    
    save_trade_history(portfolio, trade_history_path)
    save_equity_curve(portfolio, equity_curve_path)
    
    # Visualize results
    plot_results(data, portfolio, results, metrics, plot_path)

if __name__ == "__main__":
    main()
