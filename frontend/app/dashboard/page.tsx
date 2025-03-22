"use client";

import { useState, useEffect, useRef } from "react"
import {
  ArrowDown,
  ArrowUp,
  Bitcoin,
  ChevronDown,
  DollarSign,
  LineChart,
  MoreHorizontal,
  RefreshCw,
  TrendingUp,
  Briefcase
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChatbotButton } from "@/components/chatbot-button"
import { Sidebar } from "@/components/sidebar"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState("")
  const [marketData, setMarketData] = useState({
    btcusdt: { symbol: "BTCUSDT", price: 0, change: 0, priceHistory: [] },
    ethusdt: { symbol: "ETHUSDT", price: 0, change: 0, priceHistory: [] },
    bnbusdt: { symbol: "BNBUSDT", price: 0, change: 0, priceHistory: [] },
    solusdt: { symbol: "SOLUSDT", price: 0, change: 0, priceHistory: [] },
  })
  const [stockData, setStockData] = useState({
    aapl: { symbol: "AAPL", price: 0, change: 0, priceHistory: [] },
    msft: { symbol: "MSFT", price: 0, change: 0, priceHistory: [] },
    tsla: { symbol: "TSLA", price: 0, change: 0, priceHistory: [] },
    amzn: { symbol: "AMZN", price: 0, change: 0, priceHistory: [] },
  })
  const [marketNews, setMarketNews] = useState([])
  const [topPerformers, setTopPerformers] = useState([])
  const [marketType, setMarketType] = useState("crypto") // crypto or stock
  const socketRef = useRef(null)
  const priceRefs = useRef({})
  const prevPricesRef = useRef({})
  const tradingViewContainers = useRef({})

  // Yahoo Finance API Key
  const YAHOO_FINANCE_API_KEY = "54e131c9a7mshe71317d990d78f1p1bfba3jsnbc0f7ecf9da"; // Replace with your actual API key

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  // Initialize WebSocket connection for crypto
  useEffect(() => {
    // Connect to Binance WebSocket stream for real-time crypto data
    const connectWebSocket = () => {
      // Close existing connection if any
      if (socketRef.current) {
        socketRef.current.close()
      }

      const symbols = ["btcusdt", "ethusdt", "bnbusdt", "solusdt"]
      const streams = symbols.map(s => `${s}@ticker`).join('/')
      const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`
      
      socketRef.current = new WebSocket(wsUrl)

      socketRef.current.onopen = () => {
        console.log("WebSocket connection established")
        setIsLoading(false)
      }

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.data) {
          const { s: symbol, c: price, p: priceChange, P: priceChangePercent } = data.data
          
          const symbolLower = symbol.toLowerCase()
          
          setMarketData(prev => {
            const newData = { ...prev }
            const prevPrice = prev[symbolLower]?.price || 0
            
            if (newData[symbolLower]) {
              // Store both current price and history
              newData[symbolLower] = {
                ...newData[symbolLower],
                price: parseFloat(price),
                change: parseFloat(priceChangePercent),
                priceHistory: [...(newData[symbolLower].priceHistory || []).slice(-59), parseFloat(price)]
              }
              
              // Store previous price for comparison
              prevPricesRef.current[symbolLower] = prevPrice
            }
            
            return newData
          })
        }
      }

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        setIsLoading(false)
      }

      socketRef.current.onclose = () => {
        console.log("WebSocket connection closed")
        // Attempt to reconnect after a delay
        setTimeout(connectWebSocket, 5000)
      }
    }

    connectWebSocket()

    // Fetch crypto news
    fetchCryptoNews()
    
    // Fetch stock data and set up interval for updates
    fetchStockData()
    const stockInterval = setInterval(fetchStockData, 60000) // Update stock data every minute
    
    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
      clearInterval(stockInterval)
    }
  }, [])

  // Initialize TradingView charts when active tab changes
  useEffect(() => {
    initializeTradingViewWidgets()
  }, [activeTab, marketType])

  // Function to initialize TradingView widgets
  const initializeTradingViewWidgets = () => {
    // Only initialize if TradingView script is loaded
    if (typeof TradingView !== 'undefined') {
      // Clear existing widgets first
      Object.keys(tradingViewContainers.current).forEach(container => {
        if (tradingViewContainers.current[container]) {
          tradingViewContainers.current[container].innerHTML = ''
        }
      })

      // Create crypto widgets
      if (marketType === 'crypto') {
        if (activeTab === 'all' || activeTab === 'bitcoin') {
          new TradingView.widget({
            container_id: 'tv-chart-btc',
            symbol: 'BINANCE:BTCUSDT',
            interval: '1',
            timezone: 'exchange',
            theme: 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: '#f1f3f6',
            enable_publishing: false,
            hide_top_toolbar: true,
            hide_legend: false,
            save_image: false,
            height: 300,
            width: '100%',
          });
        }

        if (activeTab === 'all') {
          new TradingView.widget({
            container_id: 'tv-chart-eth',
            symbol: 'BINANCE:ETHUSDT',
            interval: '1',
            timezone: 'exchange',
            theme: 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: '#f1f3f6',
            enable_publishing: false,
            hide_top_toolbar: true,
            hide_legend: false,
            save_image: false,
            height: 300,
            width: '100%',
          });
        }

        if (activeTab === 'altcoins') {
          new TradingView.widget({
            container_id: 'tv-chart-altcoins',
            symbol: 'BINANCE:ETHUSDT',
            interval: '1',
            timezone: 'exchange',
            theme: 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: '#f1f3f6',
            enable_publishing: false,
            hide_top_toolbar: true,
            hide_legend: false,
            save_image: false,
            studies: ['MASimple@tv-basicstudies'],
            height: 400,
            width: '100%',
          });
        }
      } 
      // Create stock widgets
      else {
        if (activeTab === 'all' || activeTab === 'major') {
          new TradingView.widget({
            container_id: 'tv-chart-aapl',
            symbol: 'NASDAQ:AAPL',
            interval: 'D',
            timezone: 'exchange',
            theme: 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: '#f1f3f6',
            enable_publishing: false,
            hide_top_toolbar: true,
            hide_legend: false,
            save_image: false,
            height: 300,
            width: '100%',
          });
        }

        if (activeTab === 'all') {
          new TradingView.widget({
            container_id: 'tv-chart-msft',
            symbol: 'NASDAQ:MSFT',
            interval: 'D',
            timezone: 'exchange',
            theme: 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: '#f1f3f6',
            enable_publishing: false,
            hide_top_toolbar: true,
            hide_legend: false,
            save_image: false,
            height: 300,
            width: '100%',
          });
        }

        if (activeTab === 'tech') {
          new TradingView.widget({
            container_id: 'tv-chart-tech',
            symbol: 'NASDAQ:QQQ',
            interval: 'D',
            timezone: 'exchange',
            theme: 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: '#f1f3f6',
            enable_publishing: false,
            hide_top_toolbar: true,
            hide_legend: false,
            save_image: false,
            studies: ['RSI@tv-basicstudies', 'MACD@tv-basicstudies'],
            height: 400,
            width: '100%',
          });
        }
      }
    } else {
      console.log('TradingView not loaded yet');
    }
  };

  // Function to fetch live stock data from Yahoo Finance API
  const fetchStockData = async () => {
    try {
      const symbols = ['AAPL', 'MSFT', 'TSLA', 'AMZN'];
      const symbolsParam = symbols.join(',');
      
      // Yahoo Finance API for stock quotes
      const response = await fetch(`https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-quotes?region=US&symbols=${symbolsParam}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
          'x-rapidapi-key': YAHOO_FINANCE_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock data from Yahoo Finance API');
      }
  
      const data = await response.json();
  
      if (data && data.quoteResponse && data.quoteResponse.result) {
        setStockData(prev => {
          const newData = { ...prev };
  
          data.quoteResponse.result.forEach(stock => {
            const symbol = stock.symbol.toLowerCase();
            const price = stock.regularMarketPrice;
            const changePercent = stock.regularMarketChangePercent;
            const prevPrice = prev[symbol]?.price || 0;
  
            if (newData[symbol]) {
              newData[symbol] = {
                ...newData[symbol],
                price: price,
                change: changePercent,
                priceHistory: [...(newData[symbol].priceHistory || []).slice(-59), price]
              };
              prevPricesRef.current[symbol] = prevPrice;
            }
          });
  
          return newData;
        });
      }
    } catch (error) {
      console.error('Error fetching stock data from Yahoo Finance:', error);
      simulateStockDataChanges(); // Fallback to simulated data
    }
  };

  // Simulate stock data changes (fallback if API fails)
  const simulateStockDataChanges = () => {
    setStockData(prev => {
      const newData = { ...prev }
      Object.keys(newData).forEach(symbol => {
        const prevPrice = newData[symbol].price || (symbol === 'aapl' ? 175.23 : 
                                               symbol === 'msft' ? 412.36 : 
                                               symbol === 'tsla' ? 184.97 : 176.85);
        
        // Random price change within 0.5% range
        const priceChange = prevPrice * (0.995 + Math.random() * 0.01)
        const changePercent = ((priceChange / prevPrice) - 1) * 100
        
        newData[symbol] = {
          ...newData[symbol],
          price: priceChange,
          change: changePercent,
          priceHistory: [...(newData[symbol].priceHistory || []).slice(-59), priceChange]
        }
        
        // Store previous price for comparison
        prevPricesRef.current[symbol] = prevPrice
      })
      return newData
    })
  }

  // Flash price changes with color
  useEffect(() => {
    const allData = { ...marketData, ...stockData }
    Object.keys(allData).forEach(symbol => {
      const el = priceRefs.current[symbol]
      const prevPrice = prevPricesRef.current[symbol]
      const currentPrice = allData[symbol].price
      
      if (el && prevPrice && currentPrice !== prevPrice) {
        // Flash green if price went up, red if down
        el.classList.add(currentPrice > prevPrice ? 'flash-green' : 'flash-red')
        
        // Remove the class after the animation completes
        setTimeout(() => {
          if (el) {
            el.classList.remove('flash-green', 'flash-red')
          }
        }, 1000)
      }
    })
  }, [marketData, stockData])

  // Fetch crypto news from a real API
  const fetchCryptoNews = async () => {
    try {
      // Using CryptoCompare News API (free tier)
      const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=BTC,ETH')
      const data = await response.json()
      if (data.Data) {
        setMarketNews(data.Data.slice(0, 5))
      }
    } catch (error) {
      console.error("Error fetching crypto news:", error)
      fetchAlternativeNews('crypto')
    }
  }
  
  // Fetch stock news from Yahoo Finance
  const fetchStockNews = async () => {
    try {
      // Using Yahoo Finance API for market news
      const response = await fetch(`https://apidojo-yahoo-finance-v1.p.rapidapi.com/news/v2/list?region=US&snippetCount=5`, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
          'x-rapidapi-key': YAHOO_FINANCE_API_KEY
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      
      if (data.items) {
        const formattedNews = data.items.slice(0, 5).map(item => ({
          title: item.title,
          body: item.summary || "Read more for details...",
          imageurl: item.thumbnail?.resolutions?.[0]?.url || "",
          url: item.link
        }));
        
        setMarketNews(formattedNews);
      }
    } catch (error) {
      console.error("Error fetching stock news:", error);
      fetchAlternativeNews('stock');
    }
  }
  
  // Fallback news function if API fails
  const fetchAlternativeNews = (type) => {
    if (type === 'crypto') {
      setMarketNews([
        { title: "Bitcoin breaks new resistance level", body: "BTC has broken through the $50k resistance level...", imageurl: "", url: "#" },
        { title: "Ethereum 2.0 upgrade progress", body: "The latest progress report on the ETH 2.0 rollout...", imageurl: "", url: "#" },
        { title: "Crypto market analysis for Q1", body: "A comprehensive look at the crypto market in Q1...", imageurl: "", url: "#" },
        { title: "New regulations proposed for crypto exchanges", body: "Regulatory bodies are considering new guidelines for cryptocurrency exchanges...", imageurl: "", url: "#" },
        { title: "DeFi platforms show strong growth", body: "Decentralized Finance continues to attract significant capital...", imageurl: "", url: "#" }
      ]);
    } else {
      setMarketNews([
        { title: "AAPL shares hit all-time high", body: "Apple stock has reached a new all-time high after strong earnings report", imageurl: "", url: "#" },
        { title: "Tesla announces new factory location", body: "TSLA stock fluctuates as company reveals plans for new manufacturing site", imageurl: "", url: "#" },
        { title: "Market reacts to Fed decision", body: "Stocks show varied reaction to the latest Federal Reserve interest rate decision", imageurl: "", url: "#" },
        { title: "Tech sector leads market gains", body: "Technology companies outperform broader market indexes this week", imageurl: "", url: "#" },
        { title: "Amazon's new AI initiative", body: "AMZN announces major investment in artificial intelligence research", imageurl: "", url: "#" }
      ]);
    }
  }

  // Function to fetch top performers using Yahoo Finance
  const fetchTopPerformers = async () => {
    try {
      if (marketType === 'crypto') {
        // Using CoinGecko API for top crypto performers
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h');
        
        if (!response.ok) {
          throw new Error('Failed to fetch top crypto performers');
        }
        
        const data = await response.json();
        
        const performers = data.map(coin => ({
          symbol: coin.symbol.toUpperCase(),
          price: coin.current_price,
          change: coin.price_change_percentage_24h
        })).sort((a, b) => b.change - a.change);
        
        setTopPerformers(performers);
      } else {
        // Using Yahoo Finance API for top stock performers
        const response = await fetch(`https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/v2/get-movers?region=US&lang=en-US&count=5&start=0`, {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
            'x-rapidapi-key': YAHOO_FINANCE_API_KEY
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch top stock performers');
        }
        
        const data = await response.json();
        
        if (data.finance && data.finance.result) {
          const gainers = data.finance.result.find(r => r.id === 'gainers');
          
          if (gainers && gainers.quotes) {
            const performers = gainers.quotes.map(stock => ({
              symbol: stock.symbol,
              price: stock.regularMarketPrice,
              change: stock.regularMarketChangePercent
            }));
            
            setTopPerformers(performers);
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching top ${marketType} performers:`, error);
      calculateFallbackTopPerformers();
    }
  }
  
  // Calculate top performers from existing data if API fails
  const calculateFallbackTopPerformers = () => {
    let performers = [];
    if (marketType === 'crypto') {
      performers = Object.values(marketData);
    } else {
      performers = Object.values(stockData);
    }
    
    performers = performers
      .sort((a, b) => b.change - a.change)
      .map(asset => ({
        symbol: asset.symbol,
        price: asset.price,
        change: asset.change
      }));
    
    setTopPerformers(performers);
  }

  // Function to manually refresh data
  const refreshData = () => {
    setIsLoading(true)
    setCurrentTime(new Date().toLocaleTimeString())
    
    // Reconnect WebSocket for crypto
    if (socketRef.current) {
      socketRef.current.close()
      // The onclose handler will attempt to reconnect
    }
    
    // Refresh news and top performers
    if (marketType === 'crypto') {
      fetchCryptoNews();
    } else {
      fetchStockNews();
    }
    
    fetchTopPerformers();
    fetchStockData();
    
    // Simulate a short loading state
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }
  
  // Update data when market type changes
  useEffect(() => {
    if (marketType === 'crypto') {
      fetchCryptoNews();
    } else {
      fetchStockNews();
    }
    
    fetchTopPerformers();
  }, [marketType]);

  // Format currency with appropriate symbol and commas
  const formatCurrency = (value, prefix = "$") => {
    return `${prefix}${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <>
      <Sidebar>
        <div className="flex flex-col h-full">
          <header className="border-b border-border/40 p-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Financial Dashboard</h1>
              <p className="text-muted-foreground">Live market data</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={marketType === 'crypto' ? "default" : "outline"} 
                size="sm" 
                className="gap-1" 
                onClick={() => setMarketType('crypto')}
              >
                <Bitcoin className="h-3.5 w-3.5" />
                <span>Crypto</span>
              </Button>
              <Button 
                variant={marketType === 'stock' ? "default" : "outline"} 
                size="sm" 
                className="gap-1" 
                onClick={() => setMarketType('stock')}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Stocks</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={refreshData} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Refresh</span>
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <span>Last updated: {currentTime}</span>
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* Market Summary Cards - Crypto */}
            {marketType === 'crypto' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <CardDescription>Crypto Market</CardDescription>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Bitcoin</CardTitle>
                      <Bitcoin className="h-4 w-4 text-crypto" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div 
                        className="text-2xl font-bold" 
                        ref={el => priceRefs.current.btcusdt = el}
                      >
                        {formatCurrency(marketData.btcusdt.price)}
                      </div>
                      <div
                        className={`flex items-center gap-1 ${marketData.btcusdt.change >= 0 ? "text-profit" : "text-loss"}`}
                      >
                        {marketData.btcusdt.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        <span>{Math.abs(marketData.btcusdt.change).toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="mt-2 h-10 w-full">
                      <div className="h-full w-full bg-gradient-crypto rounded-md"></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <CardDescription>Crypto Market</CardDescription>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Ethereum</CardTitle>
                      <Bitcoin className="h-4 w-4 text-crypto" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div 
                        className="text-2xl font-bold"
                        ref={el => priceRefs.current.ethusdt = el}
                      >
                        {formatCurrency(marketData.ethusdt.price)}
                      </div>
                      <div
                        className={`flex items-center gap-1 ${marketData.ethusdt.change >= 0 ? "text-profit" : "text-loss"}`}
                      >
                        {marketData.ethusdt.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        <span>{Math.abs(marketData.ethusdt.change).toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="mt-2 h-10 w-full">
                      <div className="h-full w-full bg-gradient-crypto rounded-md"></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <CardDescription>Crypto Market</CardDescription>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Binance Coin</CardTitle>
                      <Bitcoin className="h-4 w-4 text-crypto" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div 
                        className="text-2xl font-bold"
                        ref={el => priceRefs.current.bnbusdt = el}
                      >
                        {formatCurrency(marketData.bnbusdt.price)}
                      </div>
                      <div
                        className={`flex items-center gap-1 ${marketData.bnbusdt.change >= 0 ? "text-profit" : "text-loss"}`}
                      >
                        {marketData.bnbusdt.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        <span>{Math.abs(marketData.bnbusdt.change).toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="mt-2 h-10 w-full">
                      <div className="h-full w-full bg-gradient-crypto rounded-md"></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <CardDescription>Crypto Market</CardDescription>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Solana</CardTitle>
                      <Bitcoin className="h-4 w-4 text-crypto" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div 
                        className="text-2xl font-bold"
                        ref={el => priceRefs.current.solusdt = el}
                      >
                        {formatCurrency(marketData.solusdt.price)}
                      </div>
                      <div
                        className={`flex items-center gap-1 ${marketData.solusdt.change >= 0 ? "text-profit" : "text-loss"}`}
                      >
                        {marketData.solusdt.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        <span>{Math.abs(marketData.solusdt.change).toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="mt-2 h-10 w-full">
                      <div className="h-full w-full bg-gradient-crypto rounded-md"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Market Summary Cards - Stocks */}
            {marketType === 'stock' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <CardDescription>Stock Market</CardDescription>
                    <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Apple Inc.</CardTitle>
                      <DollarSign className="h-4 w-4 text-stock" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div 
                        className="text-2xl font-bold" 
                        ref={el => priceRefs.current.aapl = el}
                      >
                        {formatCurrency(stockData.aapl.price)}
                      </div>
                      <div
                        className={`flex items-center gap-1 ${stockData.aapl.change >= 0 ? "text-profit" : "text-loss"}`}
                      >
                        {stockData.aapl.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        <span>{Math.abs(stockData.aapl.change).toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="mt-2 h-10 w-full">
                      <div className="h-full w-full bg-gradient-stock rounded-md"></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <CardDescription>Stock Market</CardDescription>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Microsoft</CardTitle>
                      <DollarSign className="h-4 w-4 text-stock" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div 
                        className="text-2xl font-bold"
                        ref={el => priceRefs.current.msft = el}
                      >
                        {formatCurrency(stockData.msft.price)}
                      </div>
                      <div
                        className={`flex items-center gap-1 ${stockData.msft.change >= 0 ? "text-profit" : "text-loss"}`}
                      >
                        {stockData.msft.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        <span>{Math.abs(stockData.msft.change).toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="mt-2 h-10 w-full">
                      <div className="h-full w-full bg-gradient-stock rounded-md"></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <CardDescription>Stock Market</CardDescription>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Tesla</CardTitle>
                      <DollarSign className="h-4 w-4 text-stock" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div 
                        className="text-2xl font-bold"
                        ref={el => priceRefs.current.tsla = el}
                      >
                        {formatCurrency(stockData.tsla.price)}
                      </div>
                      <div
                        className={`flex items-center gap-1 ${stockData.tsla.change >= 0 ? "text-profit" : "text-loss"}`}
                      >
                        {stockData.tsla.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        <span>{Math.abs(stockData.tsla.change).toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="mt-2 h-10 w-full">
                      <div className="h-full w-full bg-gradient-stock rounded-md"></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <CardDescription>Stock Market</CardDescription>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Amazon</CardTitle>
                      <DollarSign className="h-4 w-4 text-stock" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div 
                        className="text-2xl font-bold"
                        ref={el => priceRefs.current.amzn = el}
                      >
                        {formatCurrency(stockData.amzn.price)}
                      </div>
                      <div
                        className={`flex items-center gap-1 ${stockData.amzn.change >= 0 ? "text-profit" : "text-loss"}`}
                      >
                        {stockData.amzn.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                        <span>{Math.abs(stockData.amzn.change).toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="mt-2 h-10 w-full">
                      <div className="h-full w-full bg-gradient-stock rounded-md"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Chart Tabs */}
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Markets</TabsTrigger>
                  <TabsTrigger value={marketType === 'crypto' ? 'bitcoin' : 'major'}>
                    {marketType === 'crypto' ? 'Bitcoin Analysis' : 'Major Stocks'}
                  </TabsTrigger>
                  <TabsTrigger value={marketType === 'crypto' ? 'altcoins' : 'tech'}>
                    {marketType === 'crypto' ? 'Altcoins' : 'Tech Sector'}
                  </TabsTrigger>
                </TabsList>
                <Button variant="ghost" size="sm" className="gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Technical Indicators</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              <TabsContent value="all" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="border-border/40">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {marketType === 'crypto' ? 'BTC/USDT' : 'AAPL'}
                      </CardTitle>
                      <CardDescription>
                        {marketType === 'crypto' ? 'Bitcoin Live Chart' : 'Apple Inc. Stock Chart'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div 
                        id="tv-chart-btc" 
                        className="h-72 w-full"
                        ref={el => tradingViewContainers.current['tv-chart-btc'] = el}
                      ></div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/40">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {marketType === 'crypto' ? 'ETH/USDT' : 'MSFT'}
                      </CardTitle>
                      <CardDescription>
                        {marketType === 'crypto' ? 'Ethereum Live Chart' : 'Microsoft Stock Chart'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div 
                        id="tv-chart-eth" 
                        className="h-72 w-full"
                        ref={el => tradingViewContainers.current['tv-chart-eth'] = el}
                      ></div>
                    </CardContent>
                  </Card>
                </div>

                {/* Market News */}
                <Card className="border-border/40">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Market News</CardTitle>
                      <Button variant="outline" size="sm" className="gap-1">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {marketNews.map((news, index) => (
                        <div key={index} className="flex items-start space-x-4 pb-4 border-b border-border/40 last:border-0 last:pb-0">
                          <div className="flex-1">
                            <h3 className="font-medium">{news.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{news.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value={marketType === 'crypto' ? 'bitcoin' : 'major'} className="space-y-4">
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {marketType === 'crypto' ? 'BTC/USDT Advanced Analysis' : 'Major Stock Indexes'}
                    </CardTitle>
                    <CardDescription>
                      {marketType === 'crypto' ? 'Live Bitcoin Trading Chart' : 'Key Stock Market Indexes'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      id="tv-chart-btc" 
                      className="h-96 w-full"
                      ref={el => tradingViewContainers.current['tv-chart-btc'] = el}
                    ></div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value={marketType === 'crypto' ? 'altcoins' : 'tech'} className="space-y-4">
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {marketType === 'crypto' ? 'Altcoin Analysis' : 'Tech Sector Analysis'}
                    </CardTitle>
                    <CardDescription>
                      {marketType === 'crypto' ? 'Top Altcoins Performance' : 'NASDAQ Tech Stocks Overview'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      id={marketType === 'crypto' ? 'tv-chart-altcoins' : 'tv-chart-tech'} 
                      className="h-96 w-full"
                      ref={el => tradingViewContainers.current[marketType === 'crypto' ? 'tv-chart-altcoins' : 'tv-chart-tech'] = el}
                    ></div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Top Performers & Chatbot */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="border-border/40 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Top Performers</CardTitle>
                  <CardDescription>
                    Best performing {marketType === 'crypto' ? 'cryptocurrencies' : 'stocks'} today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topPerformers.slice(0, 5).map((asset, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/20 p-1.5 rounded-md">
                            {marketType === 'crypto' ? 
                              <Bitcoin className="h-4 w-4 text-crypto" /> : 
                              <DollarSign className="h-4 w-4 text-stock" />
                            }
                          </div>
                          <div>
                            <div className="font-medium">{asset.symbol}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(asset.price)}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`flex items-center gap-1 ${asset.change >= 0 ? "text-profit" : "text-loss"}`}
                        >
                          {asset.change >= 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                          <span>{Math.abs(asset.change).toFixed(2)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg">Market Assistant</CardTitle>
                  <CardDescription>Ask questions about the markets</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                  <ChatbotButton />
                  <p className="text-center text-sm text-muted-foreground">
                    Get market analysis, price predictions, and investment advice
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Sidebar>

      <style jsx global>{`
        .flash-green {
          animation: flashGreen 1s ease;
        }
        
        .flash-red {
          animation: flashRed 1s ease;
        }
        
        @keyframes flashGreen {
          0%, 100% { background-color: transparent; }
          50% { background-color: rgba(16, 185, 129, 0.2); }
        }
        
        @keyframes flashRed {
          0%, 100% { background-color: transparent; }
          50% { background-color: rgba(239, 68, 68, 0.2); }
        }
        
        .bg-gradient-card {
          background: linear-gradient(to bottom right, rgba(31, 41, 55, 0.2), rgba(17, 24, 39, 0.4));
        }
        
        .bg-gradient-crypto {
          background: linear-gradient(to right, rgba(30, 58, 138, 0.1), rgba(30, 58, 138, 0.4));
        }
        
        .bg-gradient-stock {
          background: linear-gradient(to right, rgba(5, 150, 105, 0.1), rgba(5, 150, 105, 0.4));
        }
        
        .text-profit {
          color: #10B981;
        }
        
        .text-loss {
          color: #EF4444;
        }
        
        .text-crypto {
          color: #3B82F6;
        }
        
        .text-stock {
          color: #10B981;
        }
      `}</style>
    </>
  )
}