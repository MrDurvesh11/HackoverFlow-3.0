import numpy as np
import pandas as pd
from scipy.stats import norm
import matplotlib.pyplot as plt
from datetime import datetime

def calculate_returns(prices):
    """Calculate percentage returns from a list of prices"""
    prices = np.array(prices)
    returns = (prices[1:] / prices[:-1]) - 1
    return returns

def run_monte_carlo_simulation(prices, num_simulations=1000, forecast_periods=5, confidence_level=0.95):
    """
    Run Monte Carlo simulation to predict price movement risk
    
    Args:
        prices: List of historical close prices
        num_simulations: Number of simulation paths to generate
        forecast_periods: Number of future periods to forecast (30 min)
        confidence_level: Confidence level for risk metrics
        
    Returns:
        Dictionary containing risk metrics
    """
    # Calculate historical returns
    returns = calculate_returns(prices)
    
    # Calculate mean and standard deviation of returns
    mu = np.mean(returns)
    sigma = np.std(returns)
    
    # Current price (most recent)
    current_price = prices[-1]
    
    # Generate random paths
    simulation_results = np.zeros((forecast_periods, num_simulations))
    
    for sim in range(num_simulations):
        # Generate random returns
        random_returns = np.random.normal(mu, sigma, forecast_periods)
        
        # Generate price path
        price_path = [current_price]
        for ret in random_returns:
            price_path.append(price_path[-1] * (1 + ret))
        
        simulation_results[:, sim] = price_path[1:]  # Exclude the starting price
    
    # Calculate risk metrics
    final_prices = simulation_results[-1, :]
    
    # Calculate potential losses
    potential_changes = (final_prices - current_price) / current_price
    
    # Value at Risk (VaR)
    VaR = np.percentile(potential_changes, (1 - confidence_level) * 100)
    
    # Expected Shortfall (ES) / Conditional VaR
    ES = potential_changes[potential_changes <= VaR].mean()
    
    # Maximum Drawdown across all simulations
    max_drawdown = 0
    for sim in range(num_simulations):
        path = simulation_results[:, sim]
        drawdowns = np.maximum.accumulate(path) - path
        drawdown_pcts = drawdowns / np.maximum.accumulate(path)
        path_max_drawdown = np.max(drawdown_pcts)
        max_drawdown = max(max_drawdown, path_max_drawdown)
    
    # Probability of profit
    prob_profit = np.mean(final_prices > current_price)
    
    # Create visualization (optional - uncomment to save chart)
    # save_simulation_chart(simulation_results, current_price, VaR, ES)
    
    return {
        "current_price": current_price,
        "var_95": VaR * 100,  # Convert to percentage
        "expected_shortfall": ES * 100,  # Convert to percentage
        "max_drawdown": max_drawdown * 100,  # Convert to percentage
        "probability_of_profit": prob_profit * 100,  # Convert to percentage
        "forecast_periods": forecast_periods,
        "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }

def save_simulation_chart(simulation_results, current_price, VaR, ES, filename=None):
    """Generate and save a visualization of the Monte Carlo simulation"""
    plt.figure(figsize=(10, 6))
    
    # Plot simulation paths
    for i in range(min(100, simulation_results.shape[1])):  # Plot up to 100 paths
        plt.plot(simulation_results[:, i], color='blue', alpha=0.1)
    
    # Plot current price
    plt.axhline(y=current_price, color='green', linestyle='-', label=f'Current Price: {current_price:.2f}')
    
    # Plot VaR line
    var_price = current_price * (1 + VaR)
    plt.axhline(y=var_price, color='red', linestyle='--', 
                label=f'95% VaR: {VaR*100:.2f}%')
    
    plt.title('Monte Carlo Simulation of Price Movements (Next 30 Minutes)')
    plt.xlabel('Minutes')
    plt.ylabel('Price')
    plt.legend()
    
    if filename:
        plt.savefig(filename)
    else:
        plt.savefig(f'monte_carlo_simulation_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png')
    
    plt.close()

if __name__ == "__main__":
    # Example usage when running the file directly
    sample_prices = [42000.50, 42050.25, 42075.10, 42060.30, 42100.00]
    results = run_monte_carlo_simulation(sample_prices)
    print(f"Monte Carlo Simulation Results: {results}")
