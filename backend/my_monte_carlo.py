import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from scipy.stats import norm
import time

def get_monte_carlo_data(candles):
    """
    Perform Monte Carlo simulation for price prediction based on candle data
    Returns probabilities, confidence intervals, and forecast paths
    """
    print("\n============ MONTE CARLO SIMULATION ============\n")
    
    # Check if we have enough candles for analysis
    if not candles or len(candles) < 30:
        print("Not enough candles for Monte Carlo simulation (need at least 30)")
        return None
    
    # Extract close prices and convert to numpy array
    df = pd.DataFrame(candles)
    close_prices = np.array(df['close'])
    
    # Calculate daily returns (percentage change)
    returns = np.diff(close_prices) / close_prices[:-1]
    
    # Calculate statistics from historical data
    mean_return = np.mean(returns)
    std_return = np.std(returns)
    last_price = close_prices[-1]
    
    print(f"Historical Statistics:")
    print(f"- Mean return: {mean_return:.6f}")
    print(f"- Volatility (std): {std_return:.6f}")
    print(f"- Current price: ${last_price:.2f}")
    
    # Simulation parameters
    num_simulations = 1000
    forecast_horizon = 10  # Match LSTM's 10-candle forecast
    
    # Initialize simulation array
    simulation_results = np.zeros((num_simulations, forecast_horizon))
    
    # Run Monte Carlo simulations
    print(f"Running {num_simulations} simulations for {forecast_horizon} periods...")
    start_time = time.time()
    
    for sim in range(num_simulations):
        # Start with the last known price
        price = last_price
        
        # Store the price path for this simulation
        prices = np.zeros(forecast_horizon)
        
        # Simulate price path
        for t in range(forecast_horizon):
            # Generate random return using historical mean and std
            random_return = np.random.normal(mean_return, std_return)
            
            # Update price based on the generated return
            price = price * (1 + random_return)
            
            # Store the simulated price
            prices[t] = price
        
        # Store this simulation path
        simulation_results[sim] = prices
    
    end_time = time.time()
    print(f"Simulation completed in {end_time - start_time:.2f} seconds")
    
    # Calculate statistics from the simulations
    
    # Mean path (average of all simulations at each time step)
    mean_path = np.mean(simulation_results, axis=0)
    
    # Confidence intervals (5th and 95th percentiles for 90% CI)
    lower_bound = np.percentile(simulation_results, 5, axis=0)
    upper_bound = np.percentile(simulation_results, 95, axis=0)
    
    # Calculate median path
    median_path = np.median(simulation_results, axis=0)
    
    # Calculate probabilities
    final_prices = simulation_results[:, -1]  # All final prices
    
    # Probability of price increase
    prob_increase = np.mean(final_prices > last_price)
    
    # Calculate expected price movement
    expected_price = np.mean(final_prices)
    expected_change = expected_price - last_price
    expected_change_pct = (expected_change / last_price) * 100
    
    # Generate trading signal based on probabilities
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
    
    # Print results
    print("\nMonte Carlo Simulation Results:")
    print(f"Current price: ${last_price:.2f}")
    print(f"Expected price (10 periods): ${expected_price:.2f}")
    print(f"Expected change: ${expected_change:.2f} ({expected_change_pct:.2f}%)")
    print(f"90% Confidence Interval (period 10): ${lower_bound[-1]:.2f} to ${upper_bound[-1]:.2f}")
    print(f"\nProbability of price increase: {prob_increase:.2%}")
    print(f"\nTrading signal: {signal}")
    
    # Sample of simulated paths (first 5 and last 5)
    print("\nSample of simulated price paths:")
    for i in range(5):
        print(f"Simulation {i+1}: {[f'${price:.2f}' for price in simulation_results[i]]}")
    
    # Return the results in a dictionary format similar to LSTM and indicator functions
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
        # Include a few sample paths for visualization
        "sample_paths": simulation_results[:10].tolist()
    }