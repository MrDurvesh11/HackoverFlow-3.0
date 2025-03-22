#my order manager.py
import numpy as np
import json
from my_justification import get_justification
import math

def generate_order(lstm_data, indicator_data, monte_carlo_data):
    # Import configuration from main module
    from main import TRADING_AMOUNT, MAX_RISK_PERCENT, TRADING_SYMBOL
    
    if not all([lstm_data, indicator_data, monte_carlo_data]):
        print("\n============ ORDER MANAGER ============")
        print("Missing data from one or more analysis sources. Cannot generate order.")
        return None
    
    current_price = indicator_data.get('price')
    
    lstm_signal = lstm_data.get('signal')
    rsi_signal = indicator_data.get('rsi_signal')
    ema_signal = indicator_data.get('ema_signal')
    monte_carlo_signal = monte_carlo_data.get('signal')
    
    lstm_target_price = lstm_data.get('target_price')
    lstm_trend = lstm_data.get('trend')
    lstm_trend_strength = lstm_data.get('trend_strength')
    
    mc_lower_bound = monte_carlo_data.get('lower_bound')[-1] if monte_carlo_data.get('lower_bound') else None
    
    signal_scores = {
        'STRONG_BUY': 2,
        'BUY': 1,
        'HOLD': 0,
        'NEUTRAL': 0,
        'SELL': -1,
        'STRONG_SELL': -2,
        'OVERSOLD': 0.5,
        'OVERBOUGHT': -0.5
    }
    
    weights = {
        'lstm': 0.35,
        'rsi': 0.25,
        'ema': 0.20,
        'monte_carlo': 0.20
    }
    
    total_score = (
        weights['lstm'] * signal_scores.get(lstm_signal, 0) +
        weights['rsi'] * signal_scores.get(rsi_signal, 0) +
        weights['ema'] * signal_scores.get(ema_signal, 0) +
        weights['monte_carlo'] * signal_scores.get(monte_carlo_signal, 0)
    )
    
    should_place_order = False
    order_type = "BUY"
    
    if total_score > 0.1:
        should_place_order = True
    
    print("\n============ ORDER MANAGER ============")
    print(f"LSTM Signal: {lstm_signal} | RSI Signal: {rsi_signal}")
    print(f"EMA Signal: {ema_signal} | Monte Carlo Signal: {monte_carlo_signal}")
    print(f"Combined Signal Score: {total_score:.2f}")
    
    order = None
    
    if should_place_order:
        if mc_lower_bound:
            potential_loss_pct = (current_price - mc_lower_bound) / current_price * 100
            stop_loss_pct = min(potential_loss_pct, MAX_RISK_PERCENT)
        else:
            stop_loss_pct = MAX_RISK_PERCENT
        
        stop_loss_price = current_price * (1 - stop_loss_pct/100)
        
        if lstm_target_price > current_price:
            take_profit_price = lstm_target_price
        else:
            take_profit_price = current_price + (current_price - stop_loss_price) * 2
        
        risk_amount = TRADING_AMOUNT * (MAX_RISK_PERCENT / 100)
        
        price_distance = current_price - stop_loss_price
        if price_distance > 0:
            max_coins = risk_amount / price_distance
            position_value = max_coins * current_price
            
            if position_value > TRADING_AMOUNT:
                position_size = TRADING_AMOUNT / current_price
            else:
                position_size = max_coins
        else:
            position_size = TRADING_AMOUNT / current_price * 0.95
        
        formatted_quantity = format_quantity(position_size, TRADING_SYMBOL)
        
        order = {
            "symbol": TRADING_SYMBOL,
            "side": order_type,
            "type": "LIMIT",
            "timeInForce": "GTC",
            "quantity": formatted_quantity,
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
        
        risk = current_price - stop_loss_price
        reward = take_profit_price - current_price
        risk_reward_ratio = reward / risk if risk > 0 else 0
        
        print("\n============ ORDER DETAILS ============")
        print(f"ORDER TYPE: {order['side']}")
        print(f"SYMBOL: {order['symbol']}")
        print(f"QUANTITY: {order['quantity']} BTC (${order['position_value']:.2f})")
        print(f"ENTRY PRICE: ${order['price']:.2f}")
        print(f"STOP LOSS: ${order['stopLoss']:.2f} ({stop_loss_pct:.2f}%)")
        print(f"TAKE PROFIT: ${order['takeProfit']:.2f} ({(take_profit_price - current_price) / current_price * 100:.2f}%)")
        print(f"RISK/REWARD RATIO: 1:{risk_reward_ratio:.2f}")
        print(f"MAX RISK AMOUNT: ${risk_amount:.2f}")
        
        justification = get_justification(lstm_data, indicator_data, monte_carlo_data, order)
        print("\n============ TRADE JUSTIFICATION ============")
        print(justification)
        
        order["justification"] = justification
    else:
        print("Decision: NO ORDER - Combined signals are not strong enough for a buy")
    
    return order

def format_quantity(quantity, symbol):
    try:
        quantity = float(quantity)
    except (ValueError, TypeError):
        print(f"Invalid quantity: {quantity}. Using minimum safe quantity.")
        return 0.001 if symbol == "BTCUSDT" else 0.1
        
    if symbol == "BTCUSDT":
        min_qty = 0.001
        
        if quantity < min_qty:
            print(f"Warning: Calculated quantity {quantity} is below Binance minimum safe value. Adjusting to {min_qty}.")
            return min_qty
        
        return math.floor(quantity * 100000) / 100000
    else:
        min_qty = 0.1
        if quantity < min_qty:
            print(f"Warning: Calculated quantity {quantity} is below minimum safe value. Adjusting to {min_qty}.")
            return min_qty
            
        return math.floor(quantity * 100) / 100
