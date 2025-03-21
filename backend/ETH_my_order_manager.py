import numpy as np
import json
from ETH_my_justification import get_justification

# User trading parameters (these will be inputs later)
TRADING_AMOUNT = 1000.0  # Amount in USD to trade with
MAX_RISK_PERCENT = 1.0   # Maximum risk per trade (percentage of trading amount)

def generate_order(lstm_data, indicator_data, monte_carlo_data):
    """
    Generate trading order based on the combined analysis of LSTM, indicators and Monte Carlo
    
    Parameters:
    lstm_data: Dictionary containing LSTM prediction results
    indicator_data: Dictionary containing technical indicator results
    monte_carlo_data: Dictionary containing Monte Carlo simulation results
    
    Returns:
    Dictionary containing order details
    """
    # Check if we have valid data from all sources
    if not all([lstm_data, indicator_data, monte_carlo_data]):
        print("\n============ ORDER MANAGER ============")
        print("Missing data from one or more analysis sources. Cannot generate order.")
        return None
    
    # Extract current price
    current_price = indicator_data.get('price')
    
    # Extract signals from all sources
    lstm_signal = lstm_data.get('signal')
    rsi_signal = indicator_data.get('rsi_signal')
    ema_signal = indicator_data.get('ema_signal')
    monte_carlo_signal = monte_carlo_data.get('signal')
    
    # Get LSTM target price and trend
    lstm_target_price = lstm_data.get('target_price')
    lstm_trend = lstm_data.get('trend')
    lstm_trend_strength = lstm_data.get('trend_strength')
    
    # Get Monte Carlo confidence interval for risk assessment
    mc_lower_bound = monte_carlo_data.get('lower_bound')[-1] if monte_carlo_data.get('lower_bound') else None
    
    # Calculate weighted signal score to determine trading decision
    signal_scores = {
        'STRONG_BUY': 2,
        'BUY': 1,
        'HOLD': 0,
        'NEUTRAL': 0,
        'SELL': -1,
        'STRONG_SELL': -2,
        'OVERSOLD': 0.5,  # Slightly bullish
        'OVERBOUGHT': -0.5  # Slightly bearish
    }
    
    # Weight the signals (can be adjusted based on preference)
    weights = {
        'lstm': 0.35,
        'rsi': 0.20,
        'ema': 0.25,
        'monte_carlo': 0.20
    }
    
    total_score = (
        weights['lstm'] * signal_scores.get(lstm_signal, 0) +
        weights['rsi'] * signal_scores.get(rsi_signal, 0) +
        weights['ema'] * signal_scores.get(ema_signal, 0) +
        weights['monte_carlo'] * signal_scores.get(monte_carlo_signal, 0)
    )
    
    # Determine if we should place an order
    should_place_order = False
    order_type = "BUY"  # We only consider BUY orders per the requirement
    
    # Only place buy orders when the score is positive
    if total_score > 0:
        should_place_order = True
    
    # Print decision info
    print("\n============ ORDER MANAGER For ETH ============")
    print(f"LSTM Signal: {lstm_signal} | RSI Signal: {rsi_signal}")
    print(f"EMA Signal: {ema_signal} | Monte Carlo Signal: {monte_carlo_signal}")
    print(f"Combined Signal Score: {total_score:.2f}")
    
    # Initialize order as None
    order = None
    
    if should_place_order:
        # Calculate risk parameters
        
        # Set the stop loss based on:
        # 1. Monte Carlo lower bound if available
        # 2. Otherwise use a fixed percentage of current price
        if mc_lower_bound:
            # Use Monte Carlo lower bound, but don't risk more than MAX_RISK_PERCENT
            potential_loss_pct = (current_price - mc_lower_bound) / current_price * 100
            stop_loss_pct = min(potential_loss_pct, MAX_RISK_PERCENT)
        else:
            stop_loss_pct = MAX_RISK_PERCENT
        
        stop_loss_price = current_price * (1 - stop_loss_pct/100)
        
        # Set take profit based on LSTM target if it's higher than current price
        if lstm_target_price > current_price:
            take_profit_price = lstm_target_price
        else:
            # Default to a 2:1 reward-to-risk ratio if LSTM target isn't favorable
            take_profit_price = current_price + (current_price - stop_loss_price) * 2
        
        # Calculate the risk amount
        risk_amount = TRADING_AMOUNT * (MAX_RISK_PERCENT / 100)
        
        # Calculate position size based on risk
        price_distance = current_price - stop_loss_price
        if price_distance > 0:
            max_coins = risk_amount / price_distance
            # Calculate position value in USD
            position_value = max_coins * current_price
            
            # If position value exceeds available funds, adjust to max available
            if position_value > TRADING_AMOUNT:
                position_size = TRADING_AMOUNT / current_price
            else:
                position_size = max_coins
        else:
            # Fallback if stop loss is invalid (shouldn't happen)
            position_size = TRADING_AMOUNT / current_price * 0.95  # 95% of available funds
        
        # Create order
        order = {
            "symbol": "ETHUSDT",  # Changed from BTCUSDT
            "side": order_type,
            "type": "LIMIT",
            "timeInForce": "GTC",
            "quantity": round(position_size, 4),  # Changed from 5 to 4 decimals for ETH
            "price": round(current_price, 2),
            "stopLoss": round(stop_loss_price, 2),
            "takeProfit": round(take_profit_price, 2),
            "risk_percentage": round(stop_loss_pct, 2),
            "risk_amount": round(risk_amount, 2),
            "position_value": round(position_size * current_price, 2),
            "decision_factors": {
                "lstm_signal": lstm_signal,
                "rsi_signal": rsi_signal,
                "ema_signal": ema_signal,
                "monte_carlo_signal": monte_carlo_signal,
                "combined_score": round(total_score, 2),
                "lstm_trend": lstm_trend,
                "lstm_trend_strength": round(lstm_trend_strength, 2),
            }
        }
        
        # Calculate risk/reward ratio
        risk = current_price - stop_loss_price
        reward = take_profit_price - current_price
        risk_reward_ratio = reward / risk if risk > 0 else 0
        
        # Print order details
        print("\n============ ORDER DETAILS ============")
        print(f"ORDER TYPE: {order['side']}")
        print(f"SYMBOL: {order['symbol']}")
        print(f"QUANTITY: {order['quantity']:.4f} ETH (${order['position_value']:.2f})")  # Changed from BTC to ETH
        print(f"ENTRY PRICE: ${order['price']:.2f}")
        print(f"STOP LOSS: ${order['stopLoss']:.2f} ({stop_loss_pct:.2f}%)")
        print(f"TAKE PROFIT: ${order['takeProfit']:.2f} ({(take_profit_price - current_price) / current_price * 100:.2f}%)")
        print(f"RISK/REWARD RATIO: 1:{risk_reward_ratio:.2f}")
        print(f"MAX RISK AMOUNT: ${risk_amount:.2f}")
        
        # Get AI-generated justification
        justification = get_justification(lstm_data, indicator_data, monte_carlo_data, order)
        print("\n============ TRADE JUSTIFICATION ============")
        print(justification)
        
        # Add justification to order data
        order["justification"] = justification
    else:
        print("Decision: NO ORDER - Combined signals are not strong enough for a buy")
        
        # Get AI-generated justification for not trading
        # justification = get_justification(lstm_data, indicator_data, monte_carlo_data, None)
        # print("\n============ NO TRADE JUSTIFICATION ============")
        # print(justification)
    
    return order
