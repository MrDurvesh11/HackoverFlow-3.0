import numpy as np
import pandas as pd
import time

def get_monte_carlo_data(candles):
    from main import MC_SIMULATIONS, MC_FORECAST_PERIODS, MC_CONFIDENCE_LEVEL
    
    print("\n============ MONTE CARLO SIMULATION ============\n")
    
    if not candles or len(candles) < 30:
        print("Not enough candles for Monte Carlo simulation (need at least 30)")
        return None
    
    df = pd.DataFrame(candles)
    close_prices = np.array(df['close'])
    
    returns = np.diff(close_prices) / close_prices[:-1]
    
    mean_return = np.mean(returns)
    std_return = np.std(returns)
    last_price = close_prices[-1]
    
    print(f"Historical Statistics:")
    print(f"- Mean return: {mean_return:.6f}")
    print(f"- Volatility (std): {std_return:.6f}")
    print(f"- Current price: ${last_price:.2f}")
    
    num_simulations = MC_SIMULATIONS
    forecast_horizon = MC_FORECAST_PERIODS
    
    simulation_results = np.zeros((num_simulations, forecast_horizon))
    
    print(f"Running {num_simulations} simulations for {forecast_horizon} periods...")
    start_time = time.time()
    
    for sim in range(num_simulations):
        price = last_price
        prices = np.zeros(forecast_horizon)
        
        for t in range(forecast_horizon):
            random_return = np.random.normal(mean_return, std_return)
            price = price * (1 + random_return)
            prices[t] = price
        
        simulation_results[sim] = prices
    
    end_time = time.time()
    print(f"Simulation completed in {end_time - start_time:.2f} seconds")
    
    mean_path = np.mean(simulation_results, axis=0)
    
    lower_percentile = (100 - MC_CONFIDENCE_LEVEL) / 2
    upper_percentile = 100 - lower_percentile
    
    lower_bound = np.percentile(simulation_results, lower_percentile, axis=0)
    upper_bound = np.percentile(simulation_results, upper_percentile, axis=0)
    
    median_path = np.median(simulation_results, axis=0)
    
    final_prices = simulation_results[:, -1]
    
    prob_increase = np.mean(final_prices > last_price)
    
    expected_price = np.mean(final_prices)
    expected_change = expected_price - last_price
    expected_change_pct = (expected_change / last_price) * 100
    
    if prob_increase > 0.7:
        signal = "STRONG_BUY"
    elif prob_increase > 0.6:
        signal = "BUY"
    elif prob_increase < 0.3:
        signal = "STRONG_SELL"
    elif prob_increase < 0.4:
        signal = "SELL"
    else:
        signal = "NEUTRAL"
    
    print("\nMonte Carlo Simulation Results:")
    print(f"Current price: ${last_price:.2f}")
    print(f"Expected price ({forecast_horizon} periods): ${expected_price:.2f}")
    print(f"Expected change: ${expected_change:.2f} ({expected_change_pct:.2f}%)")
    print(f"{MC_CONFIDENCE_LEVEL}% Confidence Interval (period {forecast_horizon}): ${lower_bound[-1]:.2f} to ${upper_bound[-1]:.2f}")
    print(f"\nProbability of price increase: {prob_increase:.2%}")
    print(f"\nTrading signal: {signal}")
    
    print("\nSample of simulated price paths:")
    for i in range(5):
        print(f"Simulation {i+1}: {[f'${price:.2f}' for price in simulation_results[i]]}")
    
    return {
        "signal": signal,
        "current_price": float(last_price),
        "expected_price": float(expected_price),
        "expected_change": float(expected_change),
        "expected_change_pct": float(expected_change_pct),
        "lower_bound": lower_bound.tolist(),
        "upper_bound": upper_bound.tolist(),
        "mean_path": mean_path.tolist(),
        "median_path": median_path.tolist(),
        "prob_increase": float(prob_increase),
        "forecast_horizon": forecast_horizon,
        "sample_paths": simulation_results[:10].tolist(),
        "confidence_level": MC_CONFIDENCE_LEVEL
    }