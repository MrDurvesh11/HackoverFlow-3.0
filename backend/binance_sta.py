import pandas as pd
import numpy as np
import time
from binance.client import Client
from binance.enums import *
import ta
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("rsi_strategy.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Binance API configuration (replace with your own API keys)
USE_TESTNET = False  # Set to False for real trading
API_KEY = 'xsyxgVeL5Ob4izbnKZnqVjjBz4s3KJhuM9VYR4kk0AUYLdqXQN21M8q2mW7y0wDz'
API_SECRET = 'YIaxVeYjmLwcMgpE8KlgQs2xFW9zoMHQhfi8VihP1P76nJHNr5i2cJdaYLVeNffo'

# Strategy parameters
SYMBOL = 'BTCUSDT'  # Trading pair
TIMEFRAME = '1m'    # 1-minute timeframe
RSI_PERIOD = 14     # RSI calculation period
RSI_OVERSOLD = 40   # RSI oversold threshold
RSI_OVERBOUGHT = 60 # RSI overbought threshold
TRADE_QUANTITY = 0.001  # Amount to trade (in BTC for this example)
TAKE_PROFIT = 0.05   # Take profit percentage
STOP_LOSS = 0.05     # Stop loss percentage

class RSIStrategy:
    def __init__(self):
        # Use testnet if enabled
        if USE_TESTNET:
            self.client = Client(API_KEY, API_SECRET, testnet=True)
            logger.info("Running on TESTNET - no real funds will be used")
        else:
            self.client = Client(API_KEY, API_SECRET)
            logger.info("WARNING: Running on REAL BINANCE - real funds will be used")
            
        self.in_position = False
        self.entry_price = 0
        self.take_profit_price = 0
        self.stop_loss_price = 0
        self.last_trade_time = None
        self.cooldown_period = 60  # seconds (1 minute)
        logger.info(f"RSI Strategy initialized with RSI thresholds: {RSI_OVERSOLD}/{RSI_OVERBOUGHT}")

    # Rest of the code remains the same...
    
    def get_historical_data(self):
        """Fetch historical kline data from Binance"""
        try:
            # Get the most recent 100 candles
            klines = self.client.get_klines(symbol=SYMBOL, interval=TIMEFRAME, limit=100)
            
            # Format the data into a dataframe
            df = pd.DataFrame(klines, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume', 
                                              'close_time', 'quote_asset_volume', 'number_of_trades', 
                                              'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'])
            
            # Convert price columns to float
            df['close'] = df['close'].astype(float)
            df['open'] = df['open'].astype(float)
            df['high'] = df['high'].astype(float)
            df['low'] = df['low'].astype(float)
            
            # Calculate RSI
            df['rsi'] = ta.momentum.RSIIndicator(df['close'], window=RSI_PERIOD).rsi()
            
            return df
        except Exception as e:
            logger.error(f"Error fetching historical data: {e}")
            return None

    def calculate_take_profit_stop_loss(self, entry_price, side):
        """Calculate take profit and stop loss prices based on entry price and position side"""
        if side == 'BUY':  # Long position
            take_profit = entry_price * (1 + TAKE_PROFIT / 100)
            stop_loss = entry_price * (1 - STOP_LOSS / 100)
        else:  # Short position
            take_profit = entry_price * (1 - TAKE_PROFIT / 100)
            stop_loss = entry_price * (1 + STOP_LOSS / 100)
            
        return take_profit, stop_loss

    def place_order(self, side):
        """Place an order on Binance"""
        try:
            current_time = time.time()
            
            # Check if enough time has passed since the last trade
            if self.last_trade_time and (current_time - self.last_trade_time) < self.cooldown_period:
                logger.info("Skipping trade due to cooldown period")
                return False
                
            order = self.client.create_order(
                symbol=SYMBOL,
                side=side,
                type=ORDER_TYPE_MARKET,
                quantity=TRADE_QUANTITY
            )
            
            # Get the filled price
            fills = order.get('fills', [])
            if fills:
                avg_price = sum(float(fill['price']) * float(fill['qty']) for fill in fills) / sum(float(fill['qty']) for fill in fills)
            else:
                # Get the current price as a fallback
                ticker = self.client.get_symbol_ticker(symbol=SYMBOL)
                avg_price = float(ticker['price'])
                
            self.entry_price = avg_price
            self.take_profit_price, self.stop_loss_price = self.calculate_take_profit_stop_loss(avg_price, side)
            self.in_position = True
            self.position_side = side
            self.last_trade_time = current_time
            
            logger.info(f"Placed {side} order at {avg_price}. Take profit: {self.take_profit_price}, Stop loss: {self.stop_loss_price}")
            return True
            
        except Exception as e:
            logger.error(f"Error placing order: {e}")
            return False

    def close_position(self):
        """Close the current position"""
        try:
            side = SIDE_SELL if self.position_side == SIDE_BUY else SIDE_BUY
            
            order = self.client.create_order(
                symbol=SYMBOL,
                side=side,
                type=ORDER_TYPE_MARKET,
                quantity=TRADE_QUANTITY
            )
            
            self.in_position = False
            logger.info(f"Closed position with {side} order")
            return True
            
        except Exception as e:
            logger.error(f"Error closing position: {e}")
            return False

    def check_exit_conditions(self, current_price):
        """Check if we need to exit the position based on take profit or stop loss"""
        if not self.in_position:
            return False
            
        if self.position_side == SIDE_BUY:  # Long position
            if current_price >= self.take_profit_price:
                logger.info(f"Take profit triggered at {current_price}")
                return self.close_position()
            elif current_price <= self.stop_loss_price:
                logger.info(f"Stop loss triggered at {current_price}")
                return self.close_position()
        else:  # Short position
            if current_price <= self.take_profit_price:
                logger.info(f"Take profit triggered at {current_price}")
                return self.close_position()
            elif current_price >= self.stop_loss_price:
                logger.info(f"Stop loss triggered at {current_price}")
                return self.close_position()
                
        return False

    def run_strategy(self):
        """Main strategy execution loop"""
        logger.info(f"Starting RSI strategy for {SYMBOL} on {TIMEFRAME} timeframe")
        
        while True:
            try:
                # Get latest data
                df = self.get_historical_data()
                if df is None or df.empty:
                    logger.warning("No data available, retrying in 10 seconds")
                    time.sleep(10)
                    continue
                
                # Get latest price
                current_price = df['close'].iloc[-1]
                current_rsi = df['rsi'].iloc[-1]
                
                # Print current status
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                logger.info(f"[{timestamp}] Price: {current_price}, RSI: {current_rsi:.2f}")
                
                # Check exit conditions first
                if self.in_position:
                    if self.check_exit_conditions(current_price):
                        # Position closed, wait for next signal
                        continue
                
                # Check entry conditions
                if not self.in_position:
                    if current_rsi <= RSI_OVERSOLD:
                        logger.info(f"RSI oversold ({current_rsi:.2f}) - BUY signal")
                        self.place_order(SIDE_BUY)
                    elif current_rsi >= RSI_OVERBOUGHT:
                        logger.info(f"RSI overbought ({current_rsi:.2f}) - SELL signal")
                        self.place_order(SIDE_SELL)
                
                # Wait for the next candle
                time.sleep(60)  # Wait 1 minute
                
            except Exception as e:
                logger.error(f"Error in strategy execution: {e}")
                time.sleep(10)  # Wait before retrying

if __name__ == "__main__":
    # Initialize and run the strategy
    strategy = RSIStrategy()
    strategy.run_strategy()