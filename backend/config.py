"""
Configuration file for the trading system.
Edit these values to customize the behavior of the trading bot.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Configuration
API_KEY = os.getenv('BINANCE_TESTNET_API_KEY')
API_SECRET = os.getenv('BINANCE_TESTNET_API_SECRET')

# Trading Configuration
TRADING_ENABLED = True  # Set to False to disable actual order placement
TRADING_SYMBOL = "BTCUSDT"  # Trading pair
TRADING_INTERVAL = "1m"  # Candle interval (1m, 5m, 15m, 1h, etc.)
TRADING_AMOUNT = 1000.0  # Amount in USD to trade with
MAX_RISK_PERCENT = 1.0   # Maximum risk per trade (percentage of trading amount)

# Data Storage Configuration
MAX_CANDLES = 60  # Number of candles to keep in memory for display and analysis
MAX_HISTORICAL_DATA = 1000  # Longer history for accurate calculations

# WebSocket Configuration
WS_SERVER_HOST = 'localhost'  # WebSocket server host
WS_SERVER_PORT = 8765  # WebSocket server port

# Indicator Configuration
RSI_OVERBOUGHT = 65  # RSI level considered overbought
RSI_OVERSOLD = 35  # RSI level considered oversold
RSI_PERIOD = 14  # Period for RSI calculation
MACD_FAST = 12  # Fast period for MACD
MACD_SLOW = 26  # Slow period for MACD
MACD_SIGNAL = 9  # Signal period for MACD
BB_PERIOD = 20  # Period for Bollinger Bands
BB_STD = 2  # Standard deviation for Bollinger Bands
EMA_SHORT = 9  # Short EMA period
EMA_MEDIUM = 20  # Medium EMA period
EMA_LONG = 50  # Long EMA period

# Monte Carlo Configuration
MC_SIMULATIONS = 1000  # Number of Monte Carlo simulations
MC_FORECAST_PERIODS = 10  # Number of periods to forecast
MC_CONFIDENCE_LEVEL = 90  # Confidence interval (5th to 95th percentile = 90%)

# LSTM Configuration
LSTM_INPUT_SEQUENCE = 60  # Number of candles used for prediction input
LSTM_OUTPUT_SEQUENCE = 10  # Number of future candles to predict
LSTM_MODEL_DIR = os.path.join("models", "BTC1min_I60_O10")  # LSTM model directory
