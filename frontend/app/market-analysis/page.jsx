"use client"

import { useEffect, useState, useRef } from "react"
import { 
  ArrowRight, Calendar, RefreshCw, Search, TrendingDown, TrendingUp,
  Info, ThumbsUp, ThumbsDown, BarChart, Activity, Newspaper,
  Sparkles, AlertCircle, LineChart, PieChart, Cpu, Globe,Clock ,Printer,CalendarDays,Users,BrainCircuit,ArrowDown,Minus,ArrowUp,ArrowDownTrayIcon,PrinterIcon
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/sidebar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function MarketAnalysis() {
  const [activeTab, setActiveTab] = useState("stock")
  const [ticker, setTicker] = useState("AAPL")
  const [cryptoSymbol, setCryptoSymbol] = useState("BTCUSD")
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [marketAnalysis, setMarketAnalysis] = useState(null)
  const [cryptoAnalysis, setCryptoAnalysis] = useState(null)
  const [stockData, setStockData] = useState(null)
  const [timeRange, setTimeRange] = useState("1mo") // Default to 1 month
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const tradingViewRef = useRef(null)
  
  // Current date in UTC format
  const currentDateUTC = "2025-03-22 01:02:42"
  const currentUser = "MrDurvesh11"

  const fetchTickerInfo = async (ticker) => {
    if (!ticker) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/stock?ticker=${ticker}&interval=${timeRange}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data) {
        const quotes = data.quotes
        const meta = data.meta
        
        // Format data for the chart
        const formattedData = quotes.map((quote, index) => ({
          date: new Date(quote.date).toLocaleDateString(),
          price: quote.close,
          volume: quote.volume
        })).filter(item => item.price !== null)
        
        // Get current price and change percentage
        const currentPrice = formattedData[formattedData.length - 1].price
        const previousPrice = formattedData[formattedData.length - 2].price
        const changePercent = ((currentPrice - previousPrice) / previousPrice) * 100
        
        setStockData({
          tickerInfo: {
            symbol: ticker,
            name: `${meta.longName || ticker} - ${meta.exchangeName}`,
            currentPrice: currentPrice.toFixed(2),
            changePercent: changePercent.toFixed(2)
          },
          chartData: formattedData
        })
        fetchStockAnalysis(meta.longName)
      }
    } catch (err) {
      console.error("Error fetching stock data:", err)
      setError("Failed to fetch stock data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStockAnalysis = async (stockname) => {
    setAnalysisLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:5000/analyze_stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock_name: stockname }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      setMarketAnalysis(data)
    } catch (err) {
      console.error('Error fetching stock data:', err)
    } finally {
      setAnalysisLoading(false)
    }
  }
  
  const fetchCryptoAnalysis = async (cryptoName) => {
    setAnalysisLoading(true)
    try {
      const response = await fetch('http://127.0.0.1:5000/analyze_crypto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ crypto_name: cryptoName }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      setCryptoAnalysis(data)
    } catch (err) {
      console.error('Error fetching crypto data:', err)
    } finally {
      setAnalysisLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "stock") {
      fetchTickerInfo(ticker)
    } else if (activeTab === "crypto") {
      fetchCryptoAnalysis(cryptoSymbol)
    }
  }, [ticker, timeRange, activeTab, cryptoSymbol])

  useEffect(() => {
    if (!tradingViewRef.current) return
    
    // Clean up previous chart
    tradingViewRef.current.innerHTML = ''
    
    const symbol = activeTab === 'stock' ? ticker : `BINANCE:${cryptoSymbol}`
    
    const script = document.createElement('script')
    script.innerHTML = `
      new TradingView.widget({
        "autosize": true,
        "symbol": "${symbol}",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "rgba(0, 0, 0, 0.2)",
        "enable_publishing": false,
        "withdateranges": true,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "details": true,
        "hotlist": true,
        "calendar": true,
        "container_id": "tradingview-chart-container",
        "show_popup_button": true,
        "popup_width": "1000",
        "popup_height": "650",
        "studies": [
          "MASimple@tv-basicstudies",
          "RSI@tv-basicstudies",
          "MACD@tv-basicstudies"
        ]
      });
    `
    tradingViewRef.current.appendChild(script)
    
  }, [ticker, cryptoSymbol, activeTab])

  // Update the search input handling to set the ticker
  const handleTickerSearch = (e) => {
    if (e.key === 'Enter') {
      if (activeTab === "stock") {
        setTicker(e.target.value.toUpperCase())
      } else if (activeTab === "crypto") {
        setCryptoSymbol(e.target.value.toUpperCase())
      }
    }
  }

  // Handle the time range select change
  const handleTimeRangeChange = (value) => {
    setTimeRange(value)
  }

  const analysisData = activeTab === "stock" ? marketAnalysis : cryptoAnalysis
  
  // Format number with commas
  const formatNumber = (num) => {
    if (!num) return "N/A"
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
  
  // Format market cap in billions/trillions
  const formatMarketCap = (marketCap) => {
    if (!marketCap || marketCap === "None") return "N/A"
    if (marketCap > 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
    if (marketCap > 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap > 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    return `$${marketCap.toFixed(2)}`
  }

  return (
    <>
    <Sidebar>
    <div className="flex flex-col h-full">
      <header className="border-b border-border/40 p-6 bg-gradient-to-r from-background/90 to-background/50 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              Market Analysis
            </h1>
            <p className="text-muted-foreground">AI-powered insights and predictions</p>
          </div>
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh data</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge variant="outline" className="gap-1 text-xs py-1 border border-border/40 bg-background/40">
              <Calendar className="h-3.5 w-3.5" />
              <span>{currentDateUTC.substring(0, 10)}</span>
            </Badge>
            <Badge variant="outline" className="gap-1 text-xs py-1 border border-border/40 bg-background/40">
              <span className="text-xs">{currentUser}</span>
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center bg-background/30 rounded-full h-1 w-full overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 h-full animate-pulse" style={{ width: "60%" }}></div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6 bg-gradient-to-b from-background/95 to-background/90">
        <Tabs defaultValue="stock" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-background/50 border border-border/40 rounded-xl">
              <TabsTrigger value="stock" className="rounded-lg data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-500">
                <LineChart className="h-4 w-4 mr-2" />
                Stock Analyzer
              </TabsTrigger>
              <TabsTrigger value="crypto" className="rounded-lg data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-500">
                <Cpu className="h-4 w-4 mr-2" />
                Crypto Analyzer
              </TabsTrigger>
              <TabsTrigger value="comparison" className="rounded-lg data-[state=active]:bg-green-500/10 data-[state=active]:text-green-500">
                <PieChart className="h-4 w-4 mr-2" />
                Comparison
              </TabsTrigger>
            </TabsList>
            
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                AI Powered
              </Badge>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Real-time Data
              </Badge>
            </div>
          </div>

          <TabsContent value="stock" className="mt-0 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search for a stock... (e.g. AAPL, MSFT, GOOGL)"
                  className="pl-9 bg-background/50 border-border/40 rounded-lg"
                  defaultValue={ticker}
                  onKeyDown={handleTickerSearch}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                  <SelectTrigger className="w-[120px] bg-background/50 border-border/40 rounded-lg">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">1 Day</SelectItem>
                    <SelectItem value="1w">1 Week</SelectItem>
                    <SelectItem value="1mo">1 Month</SelectItem>
                    <SelectItem value="3m">3 Months</SelectItem>
                    <SelectItem value="1y">1 Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => fetchTickerInfo(ticker)} disabled={isLoading} className="rounded-lg bg-blue-600 hover:bg-blue-700">
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Analyze
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-card border-border/40 lg:col-span-2 overflow-hidden rounded-xl shadow-glow-blue">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-300">
                          {ticker} Stock Analysis
                        </span>
                        {stockData?.tickerInfo?.changePercent && (
                          <Badge variant="outline" className={`${parseFloat(stockData?.tickerInfo?.changePercent) >= 0 ? 'bg-green-500/10 text-green-400 border-green-400/20' : 'bg-red-500/10 text-red-400 border-red-400/20'}`}>
                            {parseFloat(stockData?.tickerInfo?.changePercent) >= 0 ? '+' : ''}
                            {stockData?.tickerInfo?.changePercent}%
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {stockData?.tickerInfo?.name || "Loading..."}
                      </CardDescription>
                    </div>
                    <div className={`flex items-center gap-2 ${parseFloat(stockData?.tickerInfo?.changePercent) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stockData?.tickerInfo?.changePercent && (
                        <>
                          {parseFloat(stockData?.tickerInfo?.changePercent) >= 0 ? 
                            <TrendingUp className="h-4 w-4" /> : 
                            <TrendingDown className="h-4 w-4" />
                          }
                          <span className="font-bold">
                            ${stockData?.tickerInfo?.currentPrice}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[550px]">
                  {error ? (
                    <div className="h-full flex items-center justify-center text-red-400">
                      <AlertCircle className="h-6 w-6 mr-2" />
                      {error}
                    </div>
                  ) : isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div id="tradingview-chart-container" ref={tradingViewRef} className="h-full w-full" />
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/40 rounded-xl shadow-glow-blue overflow-hidden">
                <CardHeader className="pb-2 border-b border-border/10">
                  <CardTitle className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-300">
                    AI Market Prediction
                  </CardTitle>
                  <CardDescription>
                    LSTM and Monte Carlo simulation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {analysisLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : marketAnalysis ? (
                    <>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Current Price</div>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold">${marketAnalysis.market_data?.current_price?.toFixed(2)}</div>
                          {marketAnalysis.market_data?.price_change_24h && (
                            <div className={`text-sm flex items-center gap-1 ${marketAnalysis.market_data.price_change_24h.percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {marketAnalysis.market_data.price_change_24h.percentage >= 0 ? (
                                <TrendingUp className="h-3.5 w-3.5" />
                              ) : (
                                <TrendingDown className="h-3.5 w-3.5" />
                              )}
                              <span>
                                {marketAnalysis.market_data.price_change_24h.percentage >= 0 ? '+' : ''}
                                {marketAnalysis.market_data.price_change_24h.percentage}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Analyst Sentiment</div>
                        <div className="h-6 w-full bg-background/30 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full bg-green-400 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${marketAnalysis.buy_recommendation_percent}%` }}
                          >
                            Buy {marketAnalysis.buy_recommendation_percent}%
                          </div>
                          <div 
                            className="h-full bg-yellow-400 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${marketAnalysis.hold_recommendation_percent}%` }}
                          >
                            Hold {marketAnalysis.hold_recommendation_percent}%
                          </div>
                          <div 
                            className="h-full bg-red-400 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${marketAnalysis.sell_recommendation_percent}%` }}
                          >
                            Sell {marketAnalysis.sell_recommendation_percent}%
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="text-sm text-muted-foreground">52-Week Range</div>
                        <div className="relative pt-5">
                          <div className="h-2 w-full bg-background/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-400 to-green-400"
                              style={{ width: '100%' }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-muted-foreground">
                              ${marketAnalysis["market_data"]["52_week_low"]?.toFixed(2)}
                            </span>
                            <span className="font-medium">
                              ${marketAnalysis.market_data.current_price?.toFixed(2)}
                            </span>
                            <span className="text-muted-foreground">
                              ${marketAnalysis["market_data"]["52_week_high"]?.toFixed(2)}
                            </span>
                          </div>
                          <div 
                            className="absolute w-3 h-3 bg-blue-500 rounded-full top-4 shadow-glow-sm"
                            style={{ 
                              left: `${Math.round(((marketAnalysis.market_data.current_price - marketAnalysis["market_data"]["52_week_low"]) / (marketAnalysis["market_data"]["52_week_high"] - marketAnalysis["market_data"]["52_week_low"])) * 100)}%`,
                              transform: 'translateX(-50%)'
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="text-sm text-muted-foreground">Key Indicators</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-background/30 rounded-lg p-2">
                            <div className="text-xs text-muted-foreground">P/E Ratio</div>
                            <div className="font-medium">
                              {marketAnalysis.market_data.pe_ratio?.toFixed(2) || "N/A"}
                            </div>
                          </div>
                          <div className="bg-background/30 rounded-lg p-2">
                            <div className="text-xs text-muted-foreground">Market Cap</div>
                            <div className="font-medium">
                              {formatMarketCap(marketAnalysis.market_data.market_cap)}
                            </div>
                          </div>
                          <div className="bg-background/30 rounded-lg p-2">
                            <div className="text-xs text-muted-foreground">Volume</div>
                            <div className="font-medium">
                              {formatNumber(marketAnalysis.market_data.volume)}
                            </div>
                          </div>
                          <div className="bg-background/30 rounded-lg p-2">
                            <div className="text-xs text-muted-foreground">Dividend Yield</div>
                            <div className="font-medium">
                              {marketAnalysis.market_data.dividend_yield ? 
                                `${(marketAnalysis.market_data.dividend_yield * 100).toFixed(2)}%` : 
                                "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full gap-1 mt-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
                        <span>Detailed Analysis</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <span>Search for a stock to view analysis</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
              
            {marketAnalysis && (
              <Card className="bg-gradient-to-b from-slate-900 to-slate-800 border-border/40 rounded-xl overflow-hidden shadow-lg shadow-blue-500/20">
              <CardHeader className="pb-3 border-b border-border/20 bg-gradient-to-r from-blue-900/40 to-indigo-900/40">
                <CardTitle className="flex justify-between items-center">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300 text-xl font-bold">
                    {marketAnalysis.yfinance_symbol} Market Insights
                  </span>
                  <div className="text-sm font-normal flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-400/30 px-3 py-1">
                      Premium Analysis
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription className="flex justify-between text-blue-100/80 mt-1">
                  <span className="text-base">{marketAnalysis.companyName} | P/E: {marketAnalysis.market_data.pe_ratio?.toFixed(2)}</span>
                  <span className="text-sm">
                    Market Cap: {formatMarketCap(marketAnalysis.market_data.market_cap)}
                  </span>
                </CardDescription>
              </CardHeader>
            
              <CardContent className="space-y-6 pt-5 px-5">
                {/* Company Overview with improved styling */}
                <div className="bg-slate-800/60 p-4 rounded-lg space-y-3 border border-blue-500/20 shadow-sm shadow-blue-500/10">
                  <h3 className="font-semibold text-base flex items-center gap-2 text-blue-200">
                    <Info className="h-5 w-5 text-blue-400" />
                    Company Overview
                  </h3>
                  <p className="text-base text-slate-300 leading-relaxed">
                    {marketAnalysis.about_company}
                  </p>
                </div>
            
                {/* Strengths and Concerns with improved styling */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-slate-800/60 p-4 rounded-lg space-y-3 border border-green-500/20 shadow-sm shadow-green-500/10">
                    <h3 className="font-semibold text-base flex items-center gap-2 text-green-200">
                      <ThumbsUp className="h-5 w-5 text-green-400" />
                      Strengths
                    </h3>
                    <ul className="text-sm text-slate-300 space-y-2 list-disc pl-5">
                      {marketAnalysis.positives.map((positive, index) => (
                        <li key={index}>{positive}</li>
                      ))}
                    </ul>
                  </div>
            
                  <div className="bg-slate-800/60 p-4 rounded-lg space-y-3 border border-red-500/20 shadow-sm shadow-red-500/10">
                    <h3 className="font-semibold text-base flex items-center gap-2 text-red-200">
                      <ThumbsDown className="h-5 w-5 text-red-400" />
                      Concerns
                    </h3>
                    <ul className="text-sm text-slate-300 space-y-2 list-disc pl-5">
                      {marketAnalysis.negatives.map((negative, index) => (
                        <li key={index}>{negative}</li>
                      ))}
                    </ul>
                  </div>
                </div>
            
                {/* Price Range Analysis with improved styling */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2 text-blue-200 mb-2">
                    <BarChart className="h-5 w-5 text-blue-400" />
                    Price Range Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 24h Range */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-blue-900/20 p-4 rounded-lg border border-blue-500/30 transform transition-all duration-300 hover:scale-102 hover:shadow-md hover:shadow-blue-500/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-blue-300">24h Range</span>
                        <Badge variant="outline" className="text-xs h-5 bg-blue-900/30 border-blue-500/30">
                          Volume: {formatNumber(marketAnalysis.price_ranges["24h"].volume)}
                        </Badge>
                      </div>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">High</span>
                          <span className="font-medium text-blue-200">${marketAnalysis.price_ranges["24h"].high.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Low</span>
                          <span className="font-medium text-blue-200">${marketAnalysis.price_ranges["24h"].low.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Range %</span>
                          <span className="font-medium text-blue-200">
                            {((marketAnalysis.price_ranges["24h"].high - marketAnalysis.price_ranges["24h"].low) / 
                              marketAnalysis.price_ranges["24h"].low * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 1 Week Range */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-purple-900/20 p-4 rounded-lg border border-purple-500/30 transform transition-all duration-300 hover:scale-102 hover:shadow-md hover:shadow-purple-500/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-purple-300">1 Week Range</span>
                        <Badge variant="outline" className="text-xs h-5 bg-purple-900/30 border-purple-500/30">
                          Volume: {formatNumber(marketAnalysis.price_ranges["1week"].volume)}
                        </Badge>
                      </div>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">High</span>
                          <span className="font-medium text-purple-200">${marketAnalysis.price_ranges["1week"].high.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Low</span>
                          <span className="font-medium text-purple-200">${marketAnalysis.price_ranges["1week"].low.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Range %</span>
                          <span className="font-medium text-purple-200">
                            {((marketAnalysis.price_ranges["1week"].high - marketAnalysis.price_ranges["1week"].low) / 
                              marketAnalysis.price_ranges["1week"].low * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 4 Week Range */}
                    <div className="bg-gradient-to-br from-slate-800/80 to-green-900/20 p-4 rounded-lg border border-green-500/30 transform transition-all duration-300 hover:scale-102 hover:shadow-md hover:shadow-green-500/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-green-300">4 Week Range</span>
                        <Badge variant="outline" className="text-xs h-5 bg-green-900/30 border-green-500/30">
                          Volume: {formatNumber(marketAnalysis.price_ranges["4week"].volume)}
                        </Badge>
                      </div>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">High</span>
                          <span className="font-medium text-green-200">${marketAnalysis.price_ranges["4week"].high.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Low</span>
                          <span className="font-medium text-green-200">${marketAnalysis.price_ranges["4week"].low.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Range %</span>
                          <span className="font-medium text-green-200">
                            {((marketAnalysis.price_ranges["4week"].high - marketAnalysis.price_ranges["4week"].low) / 
                              marketAnalysis.price_ranges["4week"].low * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            
                {/* Analyst Recommendations with improved styling */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-base flex items-center gap-2 text-blue-200">
                    <Activity className="h-5 w-5 text-blue-400" />
                    Analyst Recommendations
                  </h3>
                  
                  <div className="h-8 w-full bg-slate-800/60 rounded-full overflow-hidden flex border border-blue-500/20 shadow-inner shadow-black/30">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 flex items-center justify-center text-sm text-white font-medium"
                      style={{ width: `${marketAnalysis.buy_recommendation_percent}%` }}
                    >
                      Buy {marketAnalysis.buy_recommendation_percent}%
                    </div>
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 flex items-center justify-center text-sm text-white font-medium"
                      style={{ width: `${marketAnalysis.hold_recommendation_percent}%` }}
                    >
                      Hold {marketAnalysis.hold_recommendation_percent}%
                    </div>
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-red-400 flex items-center justify-center text-sm text-white font-medium"
                      style={{ width: `${marketAnalysis.sell_recommendation_percent}%` }}
                    >
                      Sell {marketAnalysis.sell_recommendation_percent}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 shadow-sm border-l-green-500 border-l-4 transform transition-all duration-300 hover:shadow-md hover:shadow-green-500/20">
                      <div className="text-sm text-green-400 font-semibold mb-1">Buy Reason</div>
                      <div className="text-sm mt-1 text-slate-300 leading-relaxed">{marketAnalysis.buy_reason}</div>
                    </div>
                    <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 shadow-sm border-l-yellow-500 border-l-4 transform transition-all duration-300 hover:shadow-md hover:shadow-yellow-500/20">
                      <div className="text-sm text-yellow-400 font-semibold mb-1">Hold Reason</div>
                      <div className="text-sm mt-1 text-slate-300 leading-relaxed">{marketAnalysis.hold_reason}</div>
                    </div>
                    <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 shadow-sm border-l-red-500 border-l-4 transform transition-all duration-300 hover:shadow-md hover:shadow-red-500/20">
                      <div className="text-sm text-red-400 font-semibold mb-1">Sell Reason</div>
                      <div className="text-sm mt-1 text-slate-300 leading-relaxed">{marketAnalysis.sell_reason}</div>
                    </div>
                  </div>
                </div>
            
                {/* Latest News with improved styling */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-base flex items-center gap-2 text-blue-200">
                    <Newspaper className="h-5 w-5 text-blue-400" />
                    Latest News
                  </h3>
                  <ScrollArea className="h-[200px] rounded-lg bg-slate-800/40 p-1 border border-blue-500/20 shadow-inner shadow-black/40">
                    <div className="space-y-3 pr-3 p-2">
                      {marketAnalysis.latest_news.map((news, index) => (
                        <div key={index} className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 hover:border-blue-500/30 transform transition-all duration-300 hover:bg-slate-700/50">
                          <div className="text-sm font-semibold text-blue-100">{news.title}</div>
                          <div className="text-sm text-slate-400 mt-2 leading-relaxed">
                            {news.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
            
                {/* Action Buttons */}
                <div className="flex gap-4 pt-2">
                  <Button variant="outline" className="w-1/2 gap-2 py-6 bg-gradient-to-r from-blue-600/20 to-blue-700/30 hover:from-blue-600/30 hover:to-blue-700/40 border-blue-500/30 rounded-lg text-base shadow-md shadow-blue-500/10">
                    <span>Export Report</span>
                    {/*   <ArrowDownTrayIcon className="h-5 w-5" /> */}
                  </Button>
                  
                  <Button variant="outline" className="w-1/2 gap-2 py-6 bg-gradient-to-r from-indigo-600/20 to-indigo-700/30 hover:from-indigo-600/30 hover:to-indigo-700/40 border-indigo-500/30 rounded-lg text-base shadow-md shadow-indigo-500/10" onClick={() => window.print()}>
                    <span>Print Report</span>
                    <PrinterIcon className="h-5 w-5" />
                  </Button>
                </div>
            
                {/* Disclaimer */}
                <div className="text-xs text-slate-500 mt-4 italic pt-2 border-t border-slate-700/50">
                  This analysis is for informational purposes only and does not constitute investment advice. 
                  Market data as of <p suppressHydrationWarning>{new Date().toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
            )}
          </TabsContent>

          <TabsContent value="crypto" className="mt-0 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for a cryptocurrency... (e.g. BTCUSD, ETHUSD)"
                  className="pl-9 bg-background/50 border-border/40 rounded-lg"
                  defaultValue={cryptoSymbol}
                  onKeyDown={handleTickerSearch}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Select defaultValue="1d">
                  <SelectTrigger className="w-[120px] bg-background/50 border-border/40 rounded-lg">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">1 Day</SelectItem>
                    <SelectItem value="1w">1 Week</SelectItem>
                    <SelectItem value="1m">1 Month</SelectItem>
                    <SelectItem value="3m">3 Months</SelectItem>
                    <SelectItem value="1y">1 Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => fetchCryptoAnalysis(cryptoSymbol)} disabled={analysisLoading} className="rounded-lg bg-purple-600 hover:bg-purple-700">
                  {analysisLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Analyze
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-card border-border/40 lg:col-span-2 overflow-hidden rounded-xl shadow-glow-purple">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-purple-300">
                          {cryptoSymbol} Analysis
                        </span>
                        {cryptoAnalysis && (
                          <Badge variant="outline" className={`${parseFloat(cryptoAnalysis.market_data["24h_change_percent"]) >= 0 ? 'bg-green-500/10 text-green-400 border-green-400/20' : 'bg-red-500/10 text-red-400 border-red-400/20'}`}>
                            {parseFloat(cryptoAnalysis.market_data["24h_change_percent"]) >= 0 ? '+' : ''}
                            {parseFloat(cryptoAnalysis.market_data["24h_change_percent"]).toFixed(2)}%
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {cryptoAnalysis ? `${cryptoAnalysis.cryptoName} - ${cryptoAnalysis.trading_symbol}` : "Loading..."}
                      </CardDescription>
                    </div>
                    <div className={`flex items-center gap-2 ${cryptoAnalysis && parseFloat(cryptoAnalysis.market_data["24h_change_percent"]) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {cryptoAnalysis && (
                        <>
                          {parseFloat(cryptoAnalysis.market_data["24h_change_percent"]) >= 0 ? 
                            <TrendingUp className="h-4 w-4" /> : 
                            <TrendingDown className="h-4 w-4" />
                          }
                          <span className="font-bold">
                            ${parseFloat(cryptoAnalysis.market_data.current_price).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[550px]">
                  {error ? (
                    <div className="h-full flex items-center justify-center text-red-400">
                      <AlertCircle className="h-6 w-6 mr-2" />
                      {error}
                    </div>
                  ) : analysisLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div id="tradingview-chart-container" ref={tradingViewRef} className="h-full w-full" />
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/40 rounded-xl shadow-glow-purple">
                <CardHeader className="pb-2 border-b border-border/10">
                  <CardTitle className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-purple-300">
                    Crypto AI Prediction
                  </CardTitle>
                  <CardDescription>
                    AI-powered market insights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {analysisLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : cryptoAnalysis ? (
                    <>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Current Price</div>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold">${parseFloat(cryptoAnalysis.market_data.current_price).toLocaleString()}</div>
                          <div className={`text-sm flex items-center gap-1 ${parseFloat(cryptoAnalysis.market_data["24h_change_percent"]) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {parseFloat(cryptoAnalysis.market_data["24h_change_percent"]) >= 0 ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5" />
                            )}
                            <span>
                              {parseFloat(cryptoAnalysis.market_data["24h_change_percent"]) >= 0 ? '+' : ''}
                              {parseFloat(cryptoAnalysis.market_data["24h_change_percent"]).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Market Sentiment</div>
                        <div className="flex">
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            {cryptoAnalysis.market_sentiment}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Analyst Recommendations</div>
                        <div className="h-6 w-full bg-background/30 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full bg-green-400 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${parseFloat(cryptoAnalysis.buy_recommendation_percent)}%` }}
                          >
                            Buy {cryptoAnalysis.buy_recommendation_percent}
                          </div>
                          <div 
                            className="h-full bg-yellow-400 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${parseFloat(cryptoAnalysis.hold_recommendation_percent)}%` }}
                          >
                            Hold {cryptoAnalysis.hold_recommendation_percent}
                          </div>
                          <div 
                            className="h-full bg-red-400 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${parseFloat(cryptoAnalysis.sell_recommendation_percent)}%` }}
                          >
                            Sell {cryptoAnalysis.sell_recommendation_percent}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="text-sm text-muted-foreground">Key Metrics</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-background/30 rounded-lg p-2">
                            <div className="text-xs text-muted-foreground">RSI</div>
                            <div className="font-medium">
                              {parseFloat(cryptoAnalysis.market_data.rsi).toFixed(2)}
                            </div>
                          </div>
                          <div className="bg-background/30 rounded-lg p-2">
                            <div className="text-xs text-muted-foreground">24h Volume</div>
                            <div className="font-medium">
                              ${parseFloat(cryptoAnalysis.market_data["24h_volume"]).toLocaleString()}
                            </div>
                          </div>
                          <div className="bg-background/30 rounded-lg p-2">
                            <div className="text-xs text-muted-foreground">Volatility</div>
                            <div className="font-medium">
                              {cryptoAnalysis.volatility_level}
                            </div>
                          </div>
                          <div className="bg-background/30 rounded-lg p-2">
                            <div className="text-xs text-muted-foreground">Tech Score</div>
                            <div className="font-medium">
                              {cryptoAnalysis.technology_score}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full gap-1 mt-2 bg-purple-600 hover:bg-purple-700 rounded-lg">
                        <span>Detailed Analysis</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <span>Search for a cryptocurrency to view analysis</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {cryptoAnalysis && (
              <Card className="bg-gradient-to-br from-purple-950/70 to-black border-border/40 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300">
              <CardHeader className="pb-3 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/30 to-black/30 rounded-t-xl">
                <CardTitle className="flex justify-between items-center">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300 text-xl font-bold">
                    {cryptoAnalysis.cryptoName} Market Insights
                  </span>
                  <div className="text-sm font-normal flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/30 px-3 py-1 rounded-full">
                      AI Analysis
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription className="flex justify-between text-purple-300/80">
                  <span className="font-medium">{cryptoAnalysis.trading_symbol}</span>
                  <span className="text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {cryptoAnalysis.analysis_metadata.timestamp_utc}
                  </span>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6 pt-5 px-5">
                <div className="bg-purple-950/20 p-4 rounded-lg space-y-3 border border-purple-500/20 hover:border-purple-500/30 transition-all duration-200 shadow-sm">
                  <h3 className="font-medium text-sm flex items-center gap-2 text-purple-200">
                    <Info className="h-4 w-4 text-purple-400" />
                    About {cryptoAnalysis.cryptoName}
                  </h3>
                  <p className="text-sm text-purple-200/80 leading-relaxed">
                    {cryptoAnalysis.about_crypto}
                  </p>
                </div>
            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-emerald-950/30 to-purple-950/10 p-4 rounded-lg space-y-3 border border-green-500/20 hover:border-green-500/30 transition-all duration-200 shadow-sm">
                    <h3 className="font-medium text-sm flex items-center gap-2 text-green-300">
                      <ThumbsUp className="h-4 w-4 text-green-400" />
                      Strengths
                    </h3>
                    <ul className="text-xs text-green-200/80 space-y-2.5 list-disc pl-4">
                      {cryptoAnalysis.positives.map((positive, index) => (
                        <li key={index}>{positive}</li>
                      ))}
                    </ul>
                  </div>
            
                  <div className="bg-gradient-to-br from-red-950/30 to-purple-950/10 p-4 rounded-lg space-y-3 border border-red-500/20 hover:border-red-500/30 transition-all duration-200 shadow-sm">
                    <h3 className="font-medium text-sm flex items-center gap-2 text-red-300">
                      <ThumbsDown className="h-4 w-4 text-red-400" />
                      Concerns
                    </h3>
                    <ul className="text-xs text-red-200/80 space-y-2.5 list-disc pl-4">
                      {cryptoAnalysis.negatives.map((negative, index) => (
                        <li key={index}>{negative}</li>
                      ))}
                    </ul>
                  </div>
                </div>
            
                <div className="space-y-3">
                  <h3 className="font-medium text-sm flex items-center gap-2 text-purple-200">
                    <BarChart className="h-4 w-4 text-purple-400" />
                    Price Range Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-950/30 to-purple-950/10 p-4 rounded-lg border border-blue-500/20 hover:border-blue-500/30 transition-all duration-200 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-blue-300">24h Range</span>
                        <Clock className="h-3 w-3 text-blue-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-200/70">High</span>
                          <span className="font-medium text-blue-200">${cryptoAnalysis.price_ranges["24h"].high.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-200/70">Low</span>
                          <span className="font-medium text-blue-200">${cryptoAnalysis.price_ranges["24h"].low.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-200/70">Range %</span>
                          <span className="font-medium text-blue-200">
                            {((cryptoAnalysis.price_ranges["24h"].high - cryptoAnalysis.price_ranges["24h"].low) / 
                              cryptoAnalysis.price_ranges["24h"].low * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-950/30 to-purple-950/10 p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/30 transition-all duration-200 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-purple-300">1 Week Range</span>
                        <CalendarDays className="h-3 w-3 text-purple-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-purple-200/70">High</span>
                          <span className="font-medium text-purple-200">${cryptoAnalysis.price_ranges["1week"].high.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-purple-200/70">Low</span>
                          <span className="font-medium text-purple-200">${cryptoAnalysis.price_ranges["1week"].low.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-purple-200/70">Range %</span>
                          <span className="font-medium text-purple-200">
                            {((cryptoAnalysis.price_ranges["1week"].high - cryptoAnalysis.price_ranges["1week"].low) / 
                              cryptoAnalysis.price_ranges["1week"].low * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-950/30 to-purple-950/10 p-4 rounded-lg border border-green-500/20 hover:border-green-500/30 transition-all duration-200 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-green-300">4 Week Range</span>
                        <Calendar className="h-3 w-3 text-green-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-green-200/70">High</span>
                          <span className="font-medium text-green-200">${cryptoAnalysis.price_ranges["4week"].high.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-200/70">Low</span>
                          <span className="font-medium text-green-200">${cryptoAnalysis.price_ranges["4week"].low.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-200/70">Range %</span>
                          <span className="font-medium text-green-200">
                            {((cryptoAnalysis.price_ranges["4week"].high - cryptoAnalysis.price_ranges["4week"].low) / 
                              cryptoAnalysis.price_ranges["4week"].low * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm flex items-center gap-2 text-purple-200">
                      <Activity className="h-4 w-4 text-purple-400" />
                      Technical Analysis
                    </h3>
                    <div className="bg-gradient-to-br from-purple-950/30 to-indigo-950/10 p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/30 transition-all duration-200 shadow-sm">
                      <div className="grid grid-cols-3 gap-3 text-center mb-4">
                        <div className="bg-gradient-to-br from-green-950/50 to-green-900/20 rounded-md p-3 border border-green-500/20">
                          <div className="text-xs text-green-400 mb-1">Buy</div>
                          <div className="font-medium text-green-200 text-lg">
                            {cryptoAnalysis.technical_indicators.summary.BUY}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-950/50 to-yellow-900/20 rounded-md p-3 border border-yellow-500/20">
                          <div className="text-xs text-yellow-400 mb-1">Neutral</div>
                          <div className="font-medium text-yellow-200 text-lg">
                            {cryptoAnalysis.technical_indicators.summary.NEUTRAL}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-red-950/50 to-red-900/20 rounded-md p-3 border border-red-500/20">
                          <div className="text-xs text-red-400 mb-1">Sell</div>
                          <div className="font-medium text-red-200 text-lg">
                            {cryptoAnalysis.technical_indicators.summary.SELL}
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <Badge className={`
                          ${cryptoAnalysis.technical_indicators.summary.RECOMMENDATION === "BUY" ? "bg-green-500/30 text-green-300 border-green-500/40" : ""}
                          ${cryptoAnalysis.technical_indicators.summary.RECOMMENDATION === "NEUTRAL" ? "bg-yellow-500/30 text-yellow-300 border-yellow-500/40" : ""}
                          ${cryptoAnalysis.technical_indicators.summary.RECOMMENDATION === "SELL" ? "bg-red-500/30 text-red-300 border-red-500/40" : ""}
                          ${cryptoAnalysis.technical_indicators.summary.RECOMMENDATION === "STRONG_SELL" ? "bg-red-700/30 text-red-300 border-red-700/40" : ""}
                          ${cryptoAnalysis.technical_indicators.summary.RECOMMENDATION === "STRONG_BUY" ? "bg-green-700/30 text-green-300 border-green-700/40" : ""}
                          px-4 py-2 text-sm rounded-full
                        `}>
                          Overall: {cryptoAnalysis.technical_indicators.summary.RECOMMENDATION.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm flex items-center gap-2 text-purple-200">
                      <Globe className="h-4 w-4 text-purple-400" />
                      Crypto Profile
                    </h3>
                    <div className="bg-gradient-to-br from-indigo-950/30 to-purple-950/10 p-4 rounded-lg border border-indigo-500/20 hover:border-indigo-500/30 transition-all duration-200 shadow-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-indigo-900/10 p-3 rounded-lg border border-indigo-500/10">
                          <div className="text-xs text-indigo-300 mb-1">Technology Score</div>
                          <div className="font-medium text-indigo-200 flex items-center gap-1">
                            <Cpu className="h-3 w-3" />
                            {cryptoAnalysis.technology_score}
                          </div>
                        </div>
                        <div className="bg-indigo-900/10 p-3 rounded-lg border border-indigo-500/10">
                          <div className="text-xs text-indigo-300 mb-1">Adoption Rate</div>
                          <div className="font-medium text-indigo-200 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {cryptoAnalysis.adoption_rate}
                          </div>
                        </div>
                        <div className="bg-indigo-900/10 p-3 rounded-lg border border-indigo-500/10">
                          <div className="text-xs text-indigo-300 mb-1">Volatility</div>
                          <div className="font-medium text-indigo-200 flex items-center gap-1">
                            <LineChart className="h-3 w-3" />
                            {cryptoAnalysis.volatility_level}
                          </div>
                        </div>
                        <div className="bg-indigo-900/10 p-3 rounded-lg border border-indigo-500/10">
                          <div className="text-xs text-indigo-300 mb-1">Market Sentiment</div>
                          <div className="font-medium text-indigo-200 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {cryptoAnalysis.market_sentiment}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            
                <div className="space-y-3">
                  <h3 className="font-medium text-sm flex items-center gap-2 text-purple-200">
                    <BrainCircuit className="h-4 w-4 text-purple-400" />
                    Analyst Recommendations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-green-950/30 to-green-950/5 p-4 rounded-lg border border-green-500/20 hover:border-green-500/30 border-l-green-400 border-l-4 transition-all duration-200 shadow-sm">
                      <div className="text-xs text-green-400 font-medium mb-2 flex items-center gap-1">
                        <ArrowUp className="h-3 w-3" />
                        Buy Reason
                      </div>
                      <div className="text-xs text-green-200/80">{cryptoAnalysis.buy_reason}</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-950/30 to-yellow-950/5 p-4 rounded-lg border border-yellow-500/20 hover:border-yellow-500/30 border-l-yellow-400 border-l-4 transition-all duration-200 shadow-sm">
                      <div className="text-xs text-yellow-400 font-medium mb-2 flex items-center gap-1">
                        <Minus className="h-3 w-3" />
                        Hold Reason
                      </div>
                      <div className="text-xs text-yellow-200/80">{cryptoAnalysis.hold_reason}</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-950/30 to-red-950/5 p-4 rounded-lg border border-red-500/20 hover:border-red-500/30 border-l-red-400 border-l-4 transition-all duration-200 shadow-sm">
                      <div className="text-xs text-red-400 font-medium mb-2 flex items-center gap-1">
                        <ArrowDown className="h-3 w-3" />
                        Sell Reason
                      </div>
                      <div className="text-xs text-red-200/80">{cryptoAnalysis.sell_reason}</div>
                    </div>
                  </div>
                </div>
            
                <div className="space-y-3">
                  <h3 className="font-medium text-sm flex items-center gap-2 text-purple-200">
                    <Newspaper className="h-4 w-4 text-purple-400" />
                    Latest News
                  </h3>
                  <ScrollArea className="h-[180px] rounded-lg">
                    <div className="space-y-3 pr-3">
                      {cryptoAnalysis.latest_news.map((news, index) => (
                        <div key={index} className="bg-gradient-to-br from-purple-950/30 to-purple-950/5 p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/30 hover:bg-purple-900/10 transition-all duration-200 shadow-sm">
                          <div className="text-xs font-medium text-purple-200 mb-1">{news.title}</div>
                          <div className="text-xs text-purple-200/70 mt-1 leading-relaxed">
                            {news.description}
                          </div>
                          <div className="flex justify-between mt-2">
                            <span className="text-[10px] text-purple-300/50">{news.source || "Crypto News"}</span>
                            <span className="text-[10px] text-purple-300/50">{news.date || "Recent"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
            
                <div className="flex flex-col md:flex-row gap-3 pt-2">
                  <Button variant="outline" className="w-full md:w-1/2 gap-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border-purple-500/30 rounded-lg py-5 text-purple-200 transition-all duration-200">
                    <span>View Detailed Report</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                  
                  <Button variant="outline" className="w-full md:w-1/2 gap-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border-blue-500/30 rounded-lg py-5 text-blue-200 transition-all duration-200">
                    <Printer className="h-4 w-4" />
                    <span>Print Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
            )}
          </TabsContent>

          <TabsContent value="comparison" className="mt-0 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Stock symbol (e.g., AAPL)" className="pl-9 bg-background/50 border-border/40 rounded-lg" />
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Crypto symbol (e.g., BTC)" className="pl-9 bg-background/50 border-border/40 rounded-lg" />
              </div>
              <Button className="rounded-lg bg-green-600 hover:bg-green-700">
                <PieChart className="h-4 w-4 mr-2" />
                Compare
              </Button>
            </div>

            <Card className="bg-gradient-card border-border/40 rounded-xl overflow-hidden shadow-glow-green">
              <CardHeader className="pb-2 border-b border-border/10">
                <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-300">
                  AAPL vs BTC Comparison
                </CardTitle>
                <CardDescription>Performance and correlation analysis</CardDescription>
              </CardHeader>
              <CardContent className="h-[450px] grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                <div className="h-full bg-background/20 rounded-lg border border-border/10 flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="text-muted-foreground mb-4">Stock Performance Chart</p>
                    <Button variant="outline" className="bg-background/30 border-green-500/20 text-green-400">
                      <LineChart className="h-4 w-4 mr-2" />
                      Load Stock Data
                    </Button>
                  </div>
                </div>
                <div className="h-full bg-background/20 rounded-lg border border-border/10 flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="text-muted-foreground mb-4">Crypto Performance Chart</p>
                    <Button variant="outline" className="bg-background/30 border-purple-500/20 text-purple-400">
                      <LineChart className="h-4 w-4 mr-2" />
                      Load Crypto Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-card border-border/40 rounded-xl shadow-glow-green">
                <CardHeader className="pb-2 border-b border-border/10">
                  <CardTitle className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-300">
                    Correlation Analysis
                  </CardTitle>
                  <CardDescription>Statistical relationship between assets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Correlation Coefficient</div>
                    <div className="text-2xl font-bold">0.32</div>
                    <div className="text-xs text-muted-foreground">Weak positive correlation</div>
                    <div className="h-2 w-full bg-background/30 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 w-[32%]"></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-red-400">-1.0</span>
                      <span className="text-yellow-400">0.0</span>
                      <span className="text-green-400">+1.0</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Correlation Over Time</div>
                    <div className="h-32 w-full bg-background/20 rounded-lg border border-border/10 flex items-center justify-center text-xs text-muted-foreground p-4 text-center">
                      Select assets above to view correlation over time
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Correlation has increased during market volatility
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Key Insights</div>
                    <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                      <li>Both assets show sensitivity to macroeconomic factors</li>
                      <li>Bitcoin exhibits higher volatility (3.2x) compared to AAPL</li>
                      <li>Correlation increases during market stress events</li>
                      <li>Diversification benefits remain significant</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/40 rounded-xl shadow-glow-green">
                <CardHeader className="pb-2 border-b border-border/10">
                  <CardTitle className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-300">
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>Comparative analysis of key metrics</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-5">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1"></div>
                      <div className="text-center text-sm font-medium text-blue-400">AAPL</div>
                      <div className="text-center text-sm font-medium text-purple-400">BTC</div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-sm">YTD Return</div>
                        <div className="text-center text-sm text-green-400">+12.4%</div>
                        <div className="text-center text-sm text-green-400">+45.7%</div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-sm">Volatility (30d)</div>
                        <div className="text-center text-sm">18.5%</div>
                        <div className="text-center text-sm">42.3%</div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-sm">Sharpe Ratio</div>
                        <div className="text-center text-sm">1.8</div>
                        <div className="text-center text-sm">2.1</div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-sm">Max Drawdown</div>
                        <div className="text-center text-sm text-red-400">-15.2%</div>
                        <div className="text-center text-sm text-red-400">-32.7%</div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-sm">Beta (vs S&P 500)</div>
                        <div className="text-center text-sm">1.2</div>
                        <div className="text-center text-sm">2.8</div>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <h3 className="text-sm font-medium">AI Portfolio Recommendation</h3>
                      <div className="bg-background/20 p-3 rounded-lg border border-border/10">
                        <p className="text-xs text-muted-foreground">
                          Based on risk-adjusted returns and correlation analysis, a portfolio allocation of 70% AAPL and
                          30% BTC would optimize the risk-return profile while maintaining diversification benefits. This
                          allocation has historically outperformed either asset alone on a risk-adjusted basis.
                        </p>
                      </div>
                      <div className="flex justify-center mt-2">
                        <div className="w-48 h-48 rounded-full border-8 border-background/30 relative flex items-center justify-center">
                          <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}>
                            <div className="w-full h-full bg-blue-400/30 rounded-full"></div>
                          </div>
                          <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'polygon(0 0, 70% 0, 70% 100%, 0% 100%)' }}>
                            <div className="w-full h-full bg-blue-400 rounded-full"></div>
                          </div>
                          <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'polygon(70% 0, 100% 0, 100% 100%, 70% 100%)' }}>
                            <div className="w-full h-full bg-purple-400 rounded-full"></div>
                          </div>
                          <div className="z-10 text-center">
                            <div className="text-xs text-muted-foreground">Optimal Allocation</div>
                            <div className="font-bold text-sm">70/30</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-gradient-card border-border/40 rounded-xl overflow-hidden shadow-glow-green">
              <CardHeader className="pb-2 border-b border-border/10">
                <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-300">
                  Portfolio Optimization Scenarios
                </CardTitle>
                <CardDescription>AI-generated investment strategies</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background/20 p-4 rounded-lg border border-border/10">
                    <div className="text-sm font-medium mb-2 text-green-400">Growth Strategy</div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>Asset Allocation:</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-background/30 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400" style={{width: '60%'}}></div>
                        </div>
                        <span>60% AAPL</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-background/30 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-400" style={{width: '40%'}}></div>
                        </div>
                        <span>40% BTC</span>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Expected Return:</span>
                          <span className="font-medium text-green-400">+18.7%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Risk Level:</span>
                          <span className="font-medium text-amber-400">High</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Time Horizon:</span>
                          <span className="font-medium">3-5 years</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-background/20 p-4 rounded-lg border border-border/10">
                    <div className="text-sm font-medium mb-2 text-blue-400">Balanced Strategy</div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>Asset Allocation:</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-background/30 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400" style={{width: '70%'}}></div>
                        </div>
                        <span>70% AAPL</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-background/30 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-400" style={{width: '30%'}}></div>
                        </div>
                        <span>30% BTC</span>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Expected Return:</span>
                          <span className="font-medium text-green-400">+15.2%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Risk Level:</span>
                          <span className="font-medium text-yellow-400">Medium</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Time Horizon:</span>
                          <span className="font-medium">2-4 years</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-background/20 p-4 rounded-lg border border-border/10">
                    <div className="text-sm font-medium mb-2 text-amber-400">Conservative Strategy</div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <p>Asset Allocation:</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-background/30 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400" style={{width: '85%'}}></div>
                        </div>
                        <span>85% AAPL</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-background/30 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-400" style={{width: '15%'}}></div>
                        </div>
                        <span>15% BTC</span>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Expected Return:</span>
                          <span className="font-medium text-green-400">+11.8%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Risk Level:</span>
                          <span className="font-medium text-green-400">Low</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Time Horizon:</span>
                          <span className="font-medium">1-2 years</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full gap-1 mt-2 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border-green-500/30 rounded-lg">
                  <span>Generate Custom Portfolio Strategy</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <footer className="py-4 mt-6 border-t border-border/20 text-xs text-center text-muted-foreground">
          <div>
            Analysis generated on {new Date("2025-03-22 01:09:35").toLocaleString()} (UTC) for {currentUser}
          </div>
          <div className="mt-1">
            Data powered by AI analysis and market intelligence tools
          </div>
        </footer>
      </div>
    </div>
    </Sidebar>
    </>
  )
}