from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
import json

from stock_analyzer import stock_analyzer
app = Flask(__name__) 
CORS(app)

@app.route('/analyze_stock', methods=['POST'])
def analyze_stock():
    try:
        stock_name = request.json['stock_name']
        result = stock_analyzer(stock_name)
        return jsonify(result)
    except Exception as e:
        print(f"Error in analyze_stock: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)