import requests
import time
import hmac
import hashlib
import json
from urllib.parse import urlencode
import math

class BinanceTestnetClient:
    def __init__(self, api_key, api_secret):
        self.API_KEY = api_key
        self.API_SECRET = api_secret
        self.BASE_URL = "https://testnet.binance.vision/api"
        # Cache for exchange info to avoid repeated calls
        self.exchange_info_cache = None
        self.exchange_info_timestamp = 0
        
    def _generate_signature(self, params):
        """Generate HMAC SHA256 signature for API authentication"""
        query_string = urlencode(params)
        signature = hmac.new(
            self.API_SECRET.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    def _get_timestamp(self):
        """Get current timestamp in milliseconds"""
        return int(time.time() * 1000)
    
    def get_account_info(self):
        """Get account information including balances"""
        endpoint = "/v3/account"
        params = {
            'timestamp': self._get_timestamp()
        }
        
        params['signature'] = self._generate_signature(params)
        
        headers = {
            'X-MBX-APIKEY': self.API_KEY
        }
        
        response = requests.get(f"{self.BASE_URL}{endpoint}", params=params, headers=headers)
        return response.json()
    
    def get_balance(self, asset):
        """Get specific asset balance"""
        account_info = self.get_account_info()
        
        for balance in account_info.get('balances', []):
            if balance['asset'] == asset:
                return {
                    'free': float(balance['free']),
                    'locked': float(balance['locked'])
                }
                
        return {
            'free': 0.0,
            'locked': 0.0
        }
    
    def get_exchange_info(self, symbol=None, force_refresh=False):
        """Get exchange information including symbol filters"""
        # Refresh cache if needed or forced
        current_time = time.time()
        if force_refresh or self.exchange_info_cache is None or (current_time - self.exchange_info_timestamp > 60):
            endpoint = "/v3/exchangeInfo"
            params = {}
            
            if symbol:
                params['symbol'] = symbol
                
            response = requests.get(f"{self.BASE_URL}{endpoint}", params=params)
            self.exchange_info_cache = response.json()
            self.exchange_info_timestamp = current_time
            
        return self.exchange_info_cache
    
    def get_symbol_filters(self, symbol):
        """Get filters for a specific symbol with updated info"""
        exchange_info = self.get_exchange_info(symbol, force_refresh=True)
        
        for sym in exchange_info.get('symbols', []):
            if sym['symbol'] == symbol:
                return sym['filters']
                
        return []
    
    def format_price(self, price, symbol):
        """Format price according to symbol's price filter rules"""
        filters = self.get_symbol_filters(symbol)
        
        for filter in filters:
            if filter['filterType'] == 'PRICE_FILTER':
                min_price = float(filter['minPrice'])
                max_price = float(filter['maxPrice'])
                tick_size = float(filter['tickSize'])
                
                # Ensure price is within min/max bounds
                price = max(min_price, min(max_price, price))
                
                # Calculate decimal places based on tick size
                tick_str = str(tick_size)
                if '.' in tick_str:
                    decimal_places = len(tick_str.split('.')[1].rstrip('0'))
                    if decimal_places == 0:
                        decimal_places = len(tick_str.split('.')[1])
                else:
                    decimal_places = 0
                
                # Calculate the correct price according to tick size
                # Step 1: Divide by tick size
                quotient = price / tick_size
                # Step 2: Round to nearest integer
                rounded = round(quotient)
                # Step 3: Multiply back by tick size
                adjusted_price = rounded * tick_size
                # Format price to proper decimal places
                formatted_price = f"{adjusted_price:.{decimal_places}f}"
                
                print(f"Price formatting: Original: {price}, Tick size: {tick_size}, " +
                      f"Decimal places: {decimal_places}, Formatted: {formatted_price}")
                
                return formatted_price
                
        # Default format if no filter found
        return f"{price:.2f}"
    
    def format_quantity(self, quantity, symbol):
        """Format quantity according to symbol's LOT_SIZE and MIN_NOTIONAL filters"""
        try:
            quantity = float(quantity)
        except (ValueError, TypeError):
            print(f"ERROR: Invalid quantity value: {quantity}. Using minimum quantity.")
            return self.get_minimum_quantity(symbol)
            
        # Hard minimum check before any other processing
        if quantity <= 0:
            print(f"ERROR: Quantity {quantity} is <= 0. Using minimum quantity.")
            return self.get_minimum_quantity(symbol)
            
        filters = self.get_symbol_filters(symbol)
        lot_size_filter = None
        min_notional_filter = None
        price_info = None
        
        # First identify the filters we need
        for filter in filters:
            if filter['filterType'] == 'LOT_SIZE':
                lot_size_filter = filter
            elif filter['filterType'] == 'MIN_NOTIONAL':
                min_notional_filter = filter
            elif filter['filterType'] == 'PRICE_FILTER':
                price_info = filter
                
        if not lot_size_filter:
            print(f"WARNING: No LOT_SIZE filter found for {symbol}")
            return f"{quantity:.5f}" if symbol == 'BTCUSDT' else f"{quantity:.2f}"
        
        # Extract LOT_SIZE parameters
        min_qty = float(lot_size_filter['minQty'])
        max_qty = float(lot_size_filter['maxQty'])
        step_size = float(lot_size_filter['stepSize'])
        
        # Ensure quantity is at least the minimum quantity
        quantity = max(min_qty, quantity)
        
        # Ensure quantity is within min/max bounds
        quantity = min(max_qty, quantity)
        
        # Calculate decimal places based on step size
        decimal_places = self._get_decimal_places(step_size)
        
        # Floor to the nearest step
        quantity_scaled = quantity / step_size
        quantity_floored = math.floor(quantity_scaled)
        adjusted_qty = quantity_floored * step_size
        
        # Ensure we're not below minimum
        if adjusted_qty < min_qty:
            adjusted_qty = min_qty
        
        # Format to the correct number of decimal places
        formatted_qty = f"{adjusted_qty:.{decimal_places}f}"
        
        # Cross-check with MIN_NOTIONAL filter if available
        if min_notional_filter:
            min_notional = float(min_notional_filter.get('minNotional', 0))
            
            # Get the last price for the symbol to check notional value
            try:
                ticker_price = None
                if price_info:
                    ticker_price = float(price_info.get('avgPrice', 0)) or float(price_info.get('lastPrice', 0))
                
                if not ticker_price:
                    ticker_response = requests.get(f"{self.BASE_URL}/v3/ticker/price", params={"symbol": symbol})
                    ticker_data = ticker_response.json()
                    ticker_price = float(ticker_data.get('price', 0))
                
                if ticker_price > 0:
                    # Calculate the notional value (quantity * price)
                    notional_value = float(formatted_qty) * ticker_price
                    
                    # If notional value is too small, increase quantity
                    if notional_value < min_notional:
                        min_required_qty = min_notional / ticker_price
                        
                        # Round up to the nearest step size
                        steps_needed = math.ceil(min_required_qty / step_size)
                        min_valid_qty = steps_needed * step_size
                        
                        # Format with correct decimal places
                        formatted_qty = f"{min_valid_qty:.{decimal_places}f}"
                        print(f"Adjusted quantity to meet MIN_NOTIONAL: {formatted_qty} (value: {min_valid_qty * ticker_price:.2f} > {min_notional})")
            except Exception as e:
                print(f"Error checking MIN_NOTIONAL filter: {e}")
        
        print(f"Quantity formatting: Original: {quantity}, Min qty: {min_qty}, Step size: {step_size}, " +
              f"Decimal places: {decimal_places}, Adjusted: {adjusted_qty}, Formatted: {formatted_qty}")
        
        return formatted_qty

    def _get_decimal_places(self, value):
        """Correctly determine decimal places even for scientific notation"""
        value_str = f"{value:.10f}".rstrip('0').rstrip('.') if value < 0.1 else str(value)
        
        if '.' in value_str:
            return len(value_str.split('.')[1])
        return 0
    
    def get_minimum_quantity(self, symbol):
        """Get the minimum valid quantity that meets MIN_NOTIONAL requirements"""
        filters = self.get_symbol_filters(symbol)
        min_qty = 0.00001 if symbol == 'BTCUSDT' else 0.01
        min_notional = 10  # Default safe value
        
        # Find the minimum quantity and notional filters
        for filter in filters:
            if filter['filterType'] == 'LOT_SIZE':
                min_qty = float(filter['minQty'])
            elif filter['filterType'] == 'MIN_NOTIONAL':
                min_notional = float(filter['minNotional'])
        
        # Get current price
        try:
            ticker_response = requests.get(f"{self.BASE_URL}/v3/ticker/price", params={"symbol": symbol})
            ticker_data = ticker_response.json()
            
            if 'price' in ticker_data:
                current_price = float(ticker_data['price'])
                
                # Calculate minimum quantity to satisfy min_notional
                required_qty = min_notional / current_price
                
                # Round up to the nearest valid step
                lot_size_filter = None
                for filter in filters:
                    if filter['filterType'] == 'LOT_SIZE':
                        lot_size_filter = filter
                        break
                
                if lot_size_filter:
                    step_size = float(lot_size_filter['stepSize'])
                    decimal_places = self._get_decimal_places(step_size)
                    
                    # Round up to nearest step
                    steps = math.ceil(required_qty / step_size)
                    valid_qty = max(steps * step_size, min_qty)
                    
                    print(f"Calculated minimum valid quantity: {valid_qty:.{decimal_places}f} to meet MIN_NOTIONAL {min_notional}")
                    return f"{valid_qty:.{decimal_places}f}"
                
                # Fallback if no step size is found
                return f"{max(required_qty, min_qty):.5f}"
        except Exception as e:
            print(f"Error calculating minimum quantity: {e}")
        
        # Default safe value
        return "0.001" if symbol == 'BTCUSDT' else "0.1"

    def place_order(self, symbol, side, order_type, quantity, price=None, time_in_force="GTC"):
        """Place a new order on Binance testnet with proper handling of filters"""
        endpoint = "/v3/order"
        
        # Pre-check quantity is non-zero and positive
        try:
            float_qty = float(quantity)
            if float_qty <= 0:
                print(f"ERROR: Attempt to place order with invalid quantity: {quantity}")
                quantity = self.get_minimum_quantity(symbol)
                print(f"Setting quantity to minimum safe value: {quantity}")
        except (ValueError, TypeError):
            print(f"ERROR: Invalid quantity format: {quantity}")
            quantity = self.get_minimum_quantity(symbol)
            print(f"Setting quantity to minimum safe value: {quantity}")
        
        # Format quantity according to LOT_SIZE filter
        formatted_quantity = self.format_quantity(quantity, symbol)
        
        # Build basic parameters
        params = {
            'symbol': symbol,
            'side': side,
            'type': order_type,
            'timestamp': self._get_timestamp(),
        }
        
        # Add parameters specific to order type
        if order_type == "LIMIT":
            if not price:
                raise ValueError("Price is required for LIMIT orders")
            if not time_in_force:
                raise ValueError("timeInForce is required for LIMIT orders")
            
            # Format price according to PRICE_FILTER
            formatted_price = self.format_price(float(price), symbol)
            
            params['quantity'] = formatted_quantity
            params['price'] = formatted_price
            params['timeInForce'] = time_in_force
            
            # Pre-check MIN_NOTIONAL filter
            try:
                notional_value = float(formatted_quantity) * float(formatted_price)
                filters = self.get_symbol_filters(symbol)
                for filter in filters:
                    if filter['filterType'] == 'MIN_NOTIONAL':
                        min_notional = float(filter['minNotional'])
                        if notional_value < min_notional:
                            print(f"WARNING: Order value {notional_value} is below MIN_NOTIONAL {min_notional}")
                            # Increase quantity to meet MIN_NOTIONAL
                            required_qty = min_notional / float(formatted_price)
                            # Get the correct step size from LOT_SIZE filter
                            for f in filters:
                                if f['filterType'] == 'LOT_SIZE':
                                    step_size = float(f['stepSize'])
                                    # Round up to nearest step
                                    steps_needed = math.ceil(required_qty / step_size)
                                    min_valid_qty = steps_needed * step_size
                                    decimal_places = self._get_decimal_places(step_size)
                                    formatted_quantity = f"{min_valid_qty:.{decimal_places}f}"
                                    params['quantity'] = formatted_quantity
                                    print(f"Adjusted quantity to {formatted_quantity} to meet MIN_NOTIONAL")
                                    break
            except Exception as e:
                print(f"Error pre-checking MIN_NOTIONAL: {e}")
        elif order_type == "MARKET":
            params['quantity'] = formatted_quantity
        else:
            # For other order types like STOP_LOSS, etc.
            params['quantity'] = formatted_quantity
            if price:
                params['price'] = self.format_price(float(price), symbol)
            if time_in_force:
                params['timeInForce'] = time_in_force
        
        # Final check of parameters
        print(f"Final order params before signing: {params}")
        
        # Sign the request
        params['signature'] = self._generate_signature(params)
        
        headers = {
            'X-MBX-APIKEY': self.API_KEY
        }
        
        print(f"Placing order with params: {params}")
        
        # Make request and handle response
        response = requests.post(f"{self.BASE_URL}{endpoint}", params=params, headers=headers)
        
        if response.status_code != 200:
            print(f"Error response from Binance: Status Code {response.status_code}")
            print(f"Response text: {response.text}")
            error_data = response.json()
            
            if error_data.get('code') == -1013 and 'NOTIONAL' in error_data.get('msg', ''):
                print("MIN_NOTIONAL filter triggered. Trying again with higher quantity.")
                
                # Try to extract the minimum notional from error message or use a safe value
                min_notional = 10  # Default safe value for BTC
                
                # Update quantity and retry
                if price:
                    required_qty = min_notional / float(price)
                    # Get a valid quantity that's greater than required_qty
                    new_quantity = self.get_minimum_quantity(symbol)
                    print(f"Retrying with minimum safe quantity: {new_quantity}")
                    
                    # Recursive call with new quantity
                    return self.place_order(symbol, side, order_type, new_quantity, price, time_in_force)
        
        return response.json()
    
    def place_oco_order(self, symbol, side, quantity, price, stop_price, stop_limit_price):
        """Place OCO (One-Cancels-the-Other) order for stop loss and take profit"""
        endpoint = "/v3/order/oco"
        
        # Format parameters according to filters
        formatted_quantity = self.format_quantity(float(quantity), symbol)
        formatted_price = self.format_price(float(price), symbol)
        formatted_stop_price = self.format_price(float(stop_price), symbol)
        formatted_stop_limit_price = self.format_price(float(stop_limit_price), symbol)
        
        params = {
            'symbol': symbol,
            'side': side,
            'quantity': formatted_quantity,
            'price': formatted_price,
            'stopPrice': formatted_stop_price,
            'stopLimitPrice': formatted_stop_limit_price,
            'stopLimitTimeInForce': 'GTC',
            'timestamp': self._get_timestamp()
        }
        
        params['signature'] = self._generate_signature(params)
        
        headers = {
            'X-MBX-APIKEY': self.API_KEY
        }
        
        print(f"Placing OCO order with params: {params}")
        response = requests.post(f"{self.BASE_URL}{endpoint}", params=params, headers=headers)
        result = response.json()
        
        if 'code' in result and 'msg' in result:
            print(f"OCO Order Error: {result['msg']} (Code: {result['code']})")
        
        return result
    
    def place_stop_loss_order(self, symbol, side, quantity, stop_price, price=None):
        """Place a stop loss order with proper price formatting"""
        endpoint = "/v3/order"
        order_type = "STOP_LOSS_LIMIT" if price else "STOP_LOSS"
        
        # Format parameters according to filters
        formatted_quantity = self.format_quantity(float(quantity), symbol)
        formatted_stop_price = self.format_price(float(stop_price), symbol)
        
        params = {
            'symbol': symbol,
            'side': side,
            'type': order_type,
            'quantity': formatted_quantity,
            'stopPrice': formatted_stop_price,
            'timestamp': self._get_timestamp()
        }
        
        if price:
            formatted_price = self.format_price(float(price), symbol)
            params['price'] = formatted_price
            params['timeInForce'] = 'GTC'
        
        params['signature'] = self._generate_signature(params)
        
        headers = {
            'X-MBX-APIKEY': self.API_KEY
        }
        
        print(f"Placing stop loss order with params: {params}")
        response = requests.post(f"{self.BASE_URL}{endpoint}", params=params, headers=headers)
        result = response.json()
        
        if 'code' in result and 'msg' in result:
            print(f"Stop Loss Order Error: {result['msg']} (Code: {result['code']})")
            
        return result
    
    def place_take_profit_order(self, symbol, side, quantity, stop_price, price=None):
        """Place a take profit order with proper price formatting"""
        endpoint = "/v3/order"
        order_type = "TAKE_PROFIT_LIMIT" if price else "TAKE_PROFIT"
        
        # Format quantity and ensure it's a string (not scientific notation)
        formatted_quantity = self.format_quantity(float(quantity), symbol)
        if not isinstance(formatted_quantity, str):
            formatted_quantity = f"{float(formatted_quantity):.5f}" if symbol == 'BTCUSDT' else f"{float(formatted_quantity):.2f}"
        
        # Format stop price
        formatted_stop_price = self.format_price(float(stop_price), symbol)
        if not isinstance(formatted_stop_price, str):
            formatted_stop_price = f"{float(formatted_stop_price):.2f}"
        
        params = {
            'symbol': symbol,
            'side': side,
            'type': order_type,
            'quantity': formatted_quantity,
            'stopPrice': formatted_stop_price,
            'timestamp': self._get_timestamp()
        }
        
        if price:
            # Format limit price
            formatted_price = self.format_price(float(price), symbol)
            if not isinstance(formatted_price, str):
                formatted_price = f"{float(formatted_price):.2f}"
            params['price'] = formatted_price
            params['timeInForce'] = 'GTC'
        
        params['signature'] = self._generate_signature(params)
        
        headers = {
            'X-MBX-APIKEY': self.API_KEY
        }
        
        print(f"Placing take profit order with params: {params}")
        response = requests.post(f"{self.BASE_URL}{endpoint}", params=params, headers=headers)
        result = response.json()
        
        if 'code' in result and 'msg' in result:
            print(f"Take Profit Order Error: {result['msg']} (Code: {result['code']})")
            
        return result
    
    def get_order_status(self, symbol, order_id):
        """Get status of a specific order"""
        endpoint = "/v3/order"
        params = {
            'symbol': symbol,
            'orderId': order_id,
            'timestamp': self._get_timestamp()
        }
        
        params['signature'] = self._generate_signature(params)
        
        headers = {
            'X-MBX-APIKEY': self.API_KEY
        }
        
        response = requests.get(f"{self.BASE_URL}{endpoint}", params=params, headers=headers)
        return response.json()
    
    def get_open_orders(self, symbol=None):
        """Get all open orders for a symbol or all symbols"""
        endpoint = "/v3/openOrders"
        params = {
            'timestamp': self._get_timestamp()
        }
        
        if symbol:
            params['symbol'] = symbol
            
        params['signature'] = self._generate_signature(params)
        
        headers = {
            'X-MBX-APIKEY': self.API_KEY
        }
        
        response = requests.get(f"{self.BASE_URL}{endpoint}", params=params, headers=headers)
        return response.json()
        
    def cancel_order(self, symbol, order_id):
        """Cancel an existing order"""
        endpoint = "/v3/order"
        params = {
            'symbol': symbol,
            'orderId': order_id,
            'timestamp': self._get_timestamp()
        }
        
        params['signature'] = self._generate_signature(params)
        
        headers = {
            'X-MBX-APIKEY': self.API_KEY
        }
        
        response = requests.delete(f"{self.BASE_URL}{endpoint}", params=params, headers=headers)
        return response.json()
    
    def get_historical_candles(self, symbol, interval, limit=500):
        """Fetch historical candle data from Binance testnet"""
        endpoint = "/v3/klines"
        params = {
            'symbol': symbol.upper(),
            'interval': interval,
            'limit': limit
        }
        
        response = requests.get(f"{self.BASE_URL}{endpoint}", params=params)
        data = response.json()
        
        formatted_candles = []
        for candle in data:
            formatted_candle = {
                'open_time': candle[0],
                'open': float(candle[1]),
                'high': float(candle[2]),
                'low': float(candle[3]),
                'close': float(candle[4]),
                'volume': float(candle[5]),
                'close_time': candle[6],
                'quote_asset_volume': float(candle[7]),
                'number_of_trades': candle[8],
                'taker_buy_base_asset_volume': float(candle[9]),
                'taker_buy_quote_asset_volume': float(candle[10])
            }
            formatted_candles.append(formatted_candle)
        
        return formatted_candles

    def get_symbol_ticker(self, symbol):
        """Get latest price for a symbol"""
        endpoint = "/v3/ticker/price"
        params = {
            'symbol': symbol
        }
        
        response = requests.get(f"{self.BASE_URL}{endpoint}", params=params)
        return response.json()
    
    def place_market_sell_order(self, symbol, quantity):
        """Place a market sell order"""
        endpoint = "/v3/order"
        
        # Format quantity according to LOT_SIZE filter
        formatted_quantity = self.format_quantity(float(quantity), symbol)
        
        params = {
            'symbol': symbol,
            'side': 'SELL',
            'type': 'MARKET',
            'quantity': formatted_quantity,
            'timestamp': self._get_timestamp()
        }
        
        # Sign the request
        params['signature'] = self._generate_signature(params)
        
        headers = {
            'X-MBX-APIKEY': self.API_KEY
        }
        
        print(f"Placing market sell order with params: {params}")
        response = requests.post(f"{self.BASE_URL}{endpoint}", params=params, headers=headers)
        
        if response.status_code != 200:
            print(f"Error response from Binance: Status Code {response.status_code}")
            print(f"Response text: {response.text}")
        
        return response.json()
