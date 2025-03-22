// components/trading-signals.jsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ArrowDown, ArrowUp, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Sample fallback data to use when WebSocket isn't connected
const SAMPLE_DATA = {
  timestamp: 1742605261185,
  lstm: {
    predicted_prices: [84244.96875, 84252.0, 84239.421875, 84246.2890625, 84263.4609375],
    immediate_price_change: 35.288750000006985,
    immediate_percentage_change: 0.04190581177841667,
    average_predicted_price: 84255.15859375,
    overall_change: 45.478593750012806,
    overall_percentage_change: 0.054006372842187275,
    endpoint_change: 10.7578125,
    endpoint_percentage_change: 0.012769679494955003,
    trend: "WEAK_UPTREND",
    trend_strength: 0.510546515166771,
    signal: "BUY",
    target_price: 84264.02196240296,
    target_candle: 9,
    target_change: 54.34196240296296,
    target_percentage: 0.06453172889739395,
    target_confidence: 0.6084372121334167
  },
  indicators: {
    rsi_signal: "NEUTRAL",
    ema_signal: "STRONG_BUY",
    rsi: 54.54429754989456,
    price: 84209.68,
    ema9: 84205.87995070954,
    ema20: 84198.64825877006,
    ema50: 84172.83713010073
  },
  monte_carlo: {
    signal: "BUY",
    current_price: 84209.68,
    expected_price: 84231.8182817247,
    expected_change: 22.138281724706758,
    expected_change_pct: 0.02628947375730054,
    prob_increase: 0.62,
    forecast_horizon: 10
  },
  order: {
    symbol: "BTCUSDT",
    side: "BUY",
    type: "LIMIT",
    timeInForce: "GTC",
    quantity: 0.01187,
    price: 84209.68,
    stopLoss: 84099.44,
    takeProfit: 84264.02,
    risk_percentage: 0.13,
    risk_amount: 10.0,
    position_value: 1000.0,
    decision_factors: {
      lstm_signal: "BUY",
      rsi_signal: "NEUTRAL",
      ema_signal: "STRONG_BUY",
      monte_carlo_signal: "BUY",
      combined_score: 0.95,
      lstm_trend: "WEAK_UPTREND",
      lstm_trend_strength: 0.51
    }
  }
};

export function TradingSignals() {
  const [signalData, setSignalData] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState("connecting")
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [useDemoData, setUseDemoData] = useState(false)

  useEffect(() => {
    let ws
    let reconnectTimer
    
    const connectWebSocket = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      
      setConnectionStatus("connecting")
      
      try {
        ws = new WebSocket("ws://localhost:8765")
        
        ws.onopen = () => {
          console.log("WebSocket connection established")
          setConnectionStatus("connected")
          setError(null)
        }
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setSignalData(data)
            setLastUpdated(new Date())
            setUseDemoData(false)
          } catch (err) {
            console.error("Error parsing WebSocket data:", err)
            setError("Failed to parse data from server")
          }
        }
        
        ws.onerror = (event) => {
          console.error("WebSocket error:", event)
          setConnectionStatus("error")
          setError("Connection error occurred")
          
          // Enable demo mode after error
          if (!signalData) {
            setSignalData(SAMPLE_DATA)
            setUseDemoData(true)
            setLastUpdated(new Date())
          }
        }
        
        ws.onclose = () => {
          console.log("WebSocket connection closed")
          setConnectionStatus("disconnected")
          
          // Enable demo mode
          if (!useDemoData) {
            setSignalData(SAMPLE_DATA)
            setUseDemoData(true)
            setLastUpdated(new Date())
          }
          
          // Attempt to reconnect after 5 seconds
          reconnectTimer = setTimeout(() => {
            connectWebSocket()
          }, 5000)
        }
      } catch (err) {
        console.error("Error creating WebSocket:", err)
        setConnectionStatus("error")
        setError("Failed to create WebSocket connection")
        
        // Enable demo mode
        if (!signalData) {
          setSignalData(SAMPLE_DATA)
          setUseDemoData(true)
          setLastUpdated(new Date())
        }
        
        // Attempt to reconnect after 5 seconds
        reconnectTimer = setTimeout(() => {
          connectWebSocket()
        }, 5000)
      }
    }
    
    connectWebSocket()
    
    // If no data received in 3 seconds, use demo data
    const demoDataTimer = setTimeout(() => {
      if (!signalData) {
        setSignalData(SAMPLE_DATA)
        setUseDemoData(true)
        setLastUpdated(new Date())
      }
    }, 3000)
    
    // Clean up function to close WebSocket when component unmounts
    return () => {
      clearTimeout(demoDataTimer)
      clearTimeout(reconnectTimer)
      
      if (ws) {
        // Remove event handlers to prevent errors during unmount
        ws.onclose = null
        ws.onerror = null
        ws.onmessage = null
        ws.onopen = null
        
        // Only close if the socket is actually open
        if (ws.readyState === WebSocket.OPEN) {
          ws.close()
        }
      }
    }
  }, [])

  const getSignalColor = (signal) => {
    if (!signal) return "text-yellow-500";
    
    switch (signal) {
      case "BUY":
      case "STRONG_BUY":
        return "text-green-500"
      case "SELL":
      case "STRONG_SELL":
        return "text-red-500"
      default:
        return "text-yellow-500"
    }
  }
  
  const getStatusIcon = (status) => {
    switch (status) {
      case "connected":
        return <span className="h-2 w-2 rounded-full bg-green-500"></span>
      case "connecting":
        return <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
      case "disconnected":
      case "error":
        return <span className="h-2 w-2 rounded-full bg-red-500"></span>
      default:
        return null
    }
  }

  const getTrendArrow = (trend) => {
    if (!trend) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    
    if (trend.includes("UPTREND")) {
      return <ArrowUp className="h-4 w-4 text-green-500" />
    } else if (trend.includes("DOWNTREND")) {
      return <ArrowDown className="h-4 w-4 text-red-500" />
    } else {
      return <TrendingUp className="h-4 w-4 text-yellow-500" />
    }
  }
  
  const formatPercentage = (value) => {
    if (value === undefined || value === null) return "N/A"
    const percentage = (value * 100).toFixed(2)
    return `${percentage}%`
  }

  return (
    <Card className="bg-gradient-card border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Live Trading Signals
              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted/30">
                {getStatusIcon(connectionStatus)}
                <span className="capitalize">{connectionStatus}</span>
              </div>
              {useDemoData && (
                <div className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500">
                  Demo Mode
                </div>
              )}
            </CardTitle>
            <CardDescription>
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : "Waiting for data..."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="bg-red-500/20 text-red-500 p-3 rounded-md mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {!signalData ? (
          <div className="text-center py-6 text-muted-foreground">
            Waiting for signals...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-muted/30 rounded-md p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Current Order</span>
                {signalData.order && (
                  <Badge 
                    variant={signalData.order.side === "BUY" ? "success" : "destructive"} 
                    className="text-xs"
                  >
                    {signalData.order.side}
                  </Badge>
                )}
              </div>
              
              {signalData.order && (
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Symbol:</span>
                    <span className="font-medium ml-2">{signalData.order.symbol}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium ml-2">${signalData.order.price.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stop Loss:</span>
                    <span className="font-medium ml-2">${signalData.order.stopLoss.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Take Profit:</span>
                    <span className="font-medium ml-2">${signalData.order.takeProfit.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Position Value:</span>
                    <span className="font-medium ml-2">${signalData.order.position_value.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk Amount:</span>
                    <span className="font-medium ml-2">${signalData.order.risk_amount.toFixed(2)} ({signalData.order.risk_percentage}%)</span>
                  </div>
                </div>
              )}
            </div>

            {/* LSTM Predictions */}
            {signalData.lstm && (
              <div className="bg-muted/30 rounded-md p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">LSTM Predictions</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-medium ${getSignalColor(signalData.lstm.signal)}`}>
                      {signalData.lstm.signal}
                    </span>
                    {getTrendArrow(signalData.lstm.trend)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mb-3">
                  <div>
                    <span className="text-muted-foreground">Trend:</span>
                    <span className="font-medium ml-2">{signalData.lstm.trend}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Strength:</span>
                    <span className="font-medium ml-2">{(signalData.lstm.trend_strength * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target Price:</span>
                    <span className="font-medium ml-2">${signalData.lstm.target_price.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target Change:</span>
                    <span className="font-medium ml-2">{formatPercentage(signalData.lstm.target_percentage)}</span>
                  </div>
                </div>

                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Confidence</span>
                    <span>{(signalData.lstm.target_confidence * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={signalData.lstm.target_confidence * 100} className="h-1" />
                </div>
              </div>
            )}

            {/* Technical Indicators */}
            {signalData.indicators && (
              <div className="bg-muted/30 rounded-md p-4">
                <div className="text-sm font-medium mb-3">Technical Indicators</div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted/50 p-2 rounded-md">
                    <div className="text-xs text-muted-foreground">RSI</div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{signalData.indicators.rsi.toFixed(2)}</span>
                      <span className={`text-xs ${getSignalColor(signalData.indicators.rsi_signal)}`}>
                        {signalData.indicators.rsi_signal}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-2 rounded-md">
                    <div className="text-xs text-muted-foreground">EMA</div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{signalData.indicators.ema9.toFixed(2)}</span>
                      <span className={`text-xs ${getSignalColor(signalData.indicators.ema_signal)}`}>
                        {signalData.indicators.ema_signal}
                      </span>
                    </div>
                  </div>
                  
                  {signalData.monte_carlo && (
                    <div className="bg-muted/50 p-2 rounded-md">
                      <div className="text-xs text-muted-foreground">Monte Carlo</div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{formatPercentage(signalData.monte_carlo.prob_increase)}</span>
                        <span className={`text-xs ${getSignalColor(signalData.monte_carlo.signal)}`}>
                          {signalData.monte_carlo.signal}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Decision Factors */}
            {signalData.order && signalData.order.decision_factors && (
              <div className="bg-muted/30 rounded-md p-4">
                <div className="text-sm font-medium mb-2">Decision Factors</div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Combined Score</span>
                    <span className="font-medium">{(signalData.order.decision_factors.combined_score * 100).toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={signalData.order.decision_factors.combined_score * 100} 
                    className="h-1.5"
                  />
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                    {Object.entries(signalData.order.decision_factors)
                      .filter(([key]) => key !== "combined_score" && key !== "lstm_trend" && key !== "lstm_trend_strength")
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key.replace(/_/g, ' ').replace('signal', '')}</span>
                          <span className={`${getSignalColor(value)}`}>{value}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}