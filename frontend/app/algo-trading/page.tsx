"use client"

import { useState } from "react"
import { BarChart3, ChevronDown, Cog, Play, Plus, RefreshCw, Settings, StopCircle, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { StockChart } from "@/components/stock-chart"
import { CryptoChart } from "@/components/crypto-chart"
import { StrategySettingsModal } from "@/components/ai-setting-dialog"
import { Sidebar } from "@/components/sidebar"
import { TradingSignals } from "@/components/trading-signals"

export default function AlgoTrading() {
  const [activeTab, setActiveTab] = useState("strategies")

  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState(null)

  const openSettingsModal = (strategy) => {
    setSelectedStrategy(strategy)
    setSettingsModalOpen(true)
  }

  return (
    <>
    <Sidebar>
    <div className="flex flex-col h-full w-full">
      <header className="border-b border-border/40 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Algo Trading</h1>
          <p className="text-muted-foreground">Automated trading strategies</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>

        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-border/40">
            <CardHeader className="pb-2">
              <CardDescription>Active Strategies</CardDescription>
              <CardTitle className="text-2xl">4</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>2 Stock Strategies</span>
                <span>2 Crypto Strategies</span>
              </div>
              <div className="mt-2 flex gap-1">
                <div className="h-1.5 rounded-full bg-blue-500 w-1/2"></div>
                <div className="h-1.5 rounded-full bg-purple-500 w-1/2"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/40">
            <CardHeader className="pb-2">
              <CardDescription>Today's Performance</CardDescription>
              <CardTitle className="text-2xl text-profit">+$842.32</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Win Rate</span>
                <span className="font-medium">68%</span>
              </div>
              <Progress value={68} className="h-1.5 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/40">
            <CardHeader className="pb-2">
              <CardDescription>Monthly Performance</CardDescription>
              <CardTitle className="text-2xl text-profit">+$12,458.67</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">vs. Last Month</span>
                <span className="font-medium text-profit">+15.4%</span>
              </div>
              <div className="mt-2 h-10 w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-md"></div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/40">
            <CardHeader className="pb-2">
              <CardDescription>System Status</CardDescription>
              <CardTitle className="text-2xl flex items-center gap-2">
                <span className="text-green-500">●</span> Operational
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Last Check</span>
                <span className="font-medium">2 min ago</span>
              </div>
              <div className="mt-2 flex gap-1">
                <div className="h-1.5 rounded-full bg-green-500 w-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="strategies" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="bg-background/50 border border-border/40">
            <TabsTrigger value="strategies">Active Strategies</TabsTrigger>
            <TabsTrigger value="backtest">Backtesting</TabsTrigger>
            <TabsTrigger value="logs">Trade Logs</TabsTrigger>
            <TabsTrigger value="signals">Live Signals</TabsTrigger>
          </TabsList>

          <TabsContent value="strategies" className="mt-4 space-y-4">
            {/* <Card className="bg-gradient-card border-border/40">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>Momentum Trader</span>
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">Running</span>
                    </CardTitle>
                    <CardDescription>Stock strategy - AAPL, MSFT, GOOGL</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"
                    onClick={() => openSettingsModal({
                      name: "Momentum Trader",
                      type: "Stock",
                      params: {
                        timeFrame: "4h",
                        riskLevel: "medium",
                        maxPosition: 10000,
                        stopLoss: 2.5,
                        takeProfit: 5.0,
                        trailingStop: false,
                        indicators: {
                          rsi: { enabled: true, period: 14, overbought: 70, oversold: 30 },
                          macd: { enabled: true, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
                          bollingerBands: { enabled: false, period: 20, deviation: 2 }
                        }
                      }
                    })}>
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="destructive" size="sm">
                      <StopCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <div className="h-[200px]">
                      <StockChart />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Performance</div>
                      <div className="flex justify-between">
                        <div>
                          <div className="text-xl font-bold text-profit">+$458.32</div>
                          <div className="text-xs text-muted-foreground">Today</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-profit">+$5,842.67</div>
                          <div className="text-xs text-muted-foreground">All Time</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Strategy Parameters</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-muted/30 rounded-md p-2">
                          <div className="text-muted-foreground">Time Frame</div>
                          <div className="font-medium">4 Hour</div>
                        </div>
                        <div className="bg-muted/30 rounded-md p-2">
                          <div className="text-muted-foreground">Risk Level</div>
                          <div className="font-medium">Medium</div>
                        </div>
                        <div className="bg-muted/30 rounded-md p-2">
                          <div className="text-muted-foreground">Max Position</div>
                          <div className="font-medium">$10,000</div>
                        </div>
                        <div className="bg-muted/30 rounded-md p-2">
                          <div className="text-muted-foreground">Stop Loss</div>
                          <div className="font-medium">2.5%</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Last Trade</div>
                      <div className="bg-muted/30 rounded-md p-2 text-xs">
                        <div className="flex justify-between">
                          <span>AAPL</span>
                          <span className="text-profit">+$124.56</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground mt-1">
                          <span>15 min ago</span>
                          <span>Buy @ $187.32, Sell @ $189.45</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card> */}

            <Card className="bg-gradient-card border-border/40">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>Crypto Swing Trader</span>
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full">Running</span>
                    </CardTitle>
                    <CardDescription>Crypto strategy - BTC, ETH</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"
                    onClick={() => openSettingsModal({
                      name: "Crypto Swing Trader",
                      type: "Crypto",
                      params: {
                        timeFrame: "1h",
                        riskLevel: "high",
                        maxPosition: 15000,
                        stopLoss: 3.5,
                        takeProfit: 7.0,
                        trailingStop: true,
                        indicators: {
                          rsi: { enabled: true, period: 14, overbought: 75, oversold: 25 },
                          macd: { enabled: true, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
                          bollingerBands: { enabled: true, period: 20, deviation: 2 }
                        }
                      }
                    })}>
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="destructive" size="sm">
                      <StopCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <div className="h-[200px]">
                      <CryptoChart />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Performance</div>
                      <div className="flex justify-between">
                        <div>
                          <div className="text-xl font-bold text-profit">+$384.00</div>
                          <div className="text-xs text-muted-foreground">Today</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-profit">+$6,615.23</div>
                          <div className="text-xs text-muted-foreground">All Time</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Strategy Parameters</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-muted/30 rounded-md p-2">
                          <div className="text-muted-foreground">Time Frame</div>
                          <div className="font-medium">1 Hour</div>
                        </div>
                        <div className="bg-muted/30 rounded-md p-2">
                          <div className="text-muted-foreground">Risk Level</div>
                          <div className="font-medium">High</div>
                        </div>
                        <div className="bg-muted/30 rounded-md p-2">
                          <div className="text-muted-foreground">Max Position</div>
                          <div className="font-medium">$15,000</div>
                        </div>
                        <div className="bg-muted/30 rounded-md p-2">
                          <div className="text-muted-foreground">Stop Loss</div>
                          <div className="font-medium">3.5%</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Last Trade</div>
                      <div className="bg-muted/30 rounded-md p-2 text-xs">
                        <div className="flex justify-between">
                          <span>ETH</span>
                          <span className="text-profit">+$215.32</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground mt-1">
                          <span>45 min ago</span>
                          <span>Buy @ $3,510.45, Sell @ $3,542.78</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backtest" className="mt-4 space-y-4">
            <Card className="bg-gradient-card border-border/40">
              <CardHeader>
                <CardTitle>Backtest New Strategy</CardTitle>
                <CardDescription>Test your strategy against historical data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Strategy Type</label>
                    <Select defaultValue="momentum">
                      <SelectTrigger className="bg-background/50 border-border/40">
                        <SelectValue placeholder="Select strategy type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="momentum">Momentum</SelectItem>
                        <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
                        <SelectItem value="breakout">Breakout</SelectItem>
                        <SelectItem value="trend-following">Trend Following</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Asset Class</label>
                    <Select defaultValue="stocks">
                      <SelectTrigger className="bg-background/50 border-border/40">
                        <SelectValue placeholder="Select asset class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stocks">Stocks</SelectItem>
                        <SelectItem value="crypto">Cryptocurrencies</SelectItem>
                        <SelectItem value="forex">Forex</SelectItem>
                        <SelectItem value="commodities">Commodities</SelectItem>
                        <SelectItem value="mixed">Mixed Assets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time Period</label>
                    <Select defaultValue="1y">
                      <SelectTrigger className="bg-background/50 border-border/40">
                        <SelectValue placeholder="Select time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1m">1 Month</SelectItem>
                        <SelectItem value="3m">3 Months</SelectItem>
                        <SelectItem value="6m">6 Months</SelectItem>
                        <SelectItem value="1y">1 Year</SelectItem>
                        <SelectItem value="3y">3 Years</SelectItem>
                        <SelectItem value="5y">5 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Assets</label>
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      AAPL <X className="h-3 w-3 cursor-pointer" />
                    </div>
                    <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      MSFT <X className="h-3 w-3 cursor-pointer" />
                    </div>
                    <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      GOOGL <X className="h-3 w-3 cursor-pointer" />
                    </div>
                    <div className="bg-muted/30 text-muted-foreground px-3 py-1 rounded-full text-xs flex items-center gap-1 cursor-pointer">
                      <Plus className="h-3 w-3" /> Add Asset
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Initial Capital</label>
                      <span className="text-sm">$100,000</span>
                    </div>
                    <Slider defaultValue={[100000]} min={10000} max={1000000} step={10000} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Risk Per Trade</label>
                      <span className="text-sm">2.5%</span>
                    </div>
                    <Slider defaultValue={[2.5]} min={0.5} max={10} step={0.5} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Stop Loss</label>
                      <span className="text-sm">3.0%</span>
                    </div>
                    <Slider defaultValue={[3]} min={1} max={10} step={0.5} />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Take Profit</label>
                      <span className="text-sm">6.0%</span>
                    </div>
                    <Slider defaultValue={[6]} min={1} max={20} step={0.5} />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Switch id="advanced" />
                    <label htmlFor="advanced" className="text-sm cursor-pointer">
                      Advanced Parameters
                    </label>
                  </div>
                  <Button className="gap-1">
                    <Play className="h-3.5 w-3.5" />
                    <span>Run Backtest</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/40">
              <CardHeader>
                <CardTitle>Backtest Results</CardTitle>
                <CardDescription>Momentum Strategy on AAPL, MSFT, GOOGL (1 Year)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[300px]">
                  <StockChart />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Performance Metrics</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Total Return</span>
                        <span className="font-medium text-profit">+32.4%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Annualized Return</span>
                        <span className="font-medium text-profit">+32.4%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Sharpe Ratio</span>
                        <span className="font-medium">1.85</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Max Drawdown</span>
                        <span className="font-medium text-loss">-12.3%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Win Rate</span>
                        <span className="font-medium">68%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Trade Statistics</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Total Trades</span>
                        <span className="font-medium">124</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Winning Trades</span>
                        <span className="font-medium text-profit">84</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Losing Trades</span>
                        <span className="font-medium text-loss">40</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg. Profit</span>
                        <span className="font-medium text-profit">+4.2%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg. Loss</span>
                        <span className="font-medium text-loss">-2.1%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Risk Metrics</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Volatility</span>
                        <span className="font-medium">18.5%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Beta</span>
                        <span className="font-medium">1.2</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Sortino Ratio</span>
                        <span className="font-medium">2.1</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Calmar Ratio</span>
                        <span className="font-medium">2.6</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Profit Factor</span>
                        <span className="font-medium">2.0</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" className="gap-1">
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>Detailed Report</span>
                  </Button>
                  <Button className="gap-1">
                    <Cog className="h-3.5 w-3.5" />
                    <span>Deploy Strategy</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <Card className="bg-gradient-card border-border/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Trade Logs</CardTitle>
                  <CardDescription>Recent trading activity</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px] bg-background/50 border-border/40">
                      <SelectValue placeholder="Filter by strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Strategies</SelectItem>
                      <SelectItem value="momentum">Momentum Trader</SelectItem>
                      <SelectItem value="swing">Crypto Swing Trader</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-md p-3 border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">Buy Order Executed</div>
                        <div className="text-sm text-muted-foreground">Momentum Trader - AAPL</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">15 min ago</div>
                        <div className="text-sm font-medium">$187.32</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Bought 53 shares of AAPL at $187.32 for a total of $9,927.96
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-md p-3 border-l-4 border-red-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">Sell Order Executed</div>
                        <div className="text-sm text-muted-foreground">Crypto Swing Trader - ETH</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">45 min ago</div>
                        <div className="text-sm font-medium">$3,542.78</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Sold 4.2 ETH at $3,542.78 for a total of $14,879.68 (Profit: $215.32)
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-md p-3 border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">Buy Order Executed</div>
                        <div className="text-sm text-muted-foreground">Crypto Swing Trader - ETH</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">2 hours ago</div>
                        <div className="text-sm font-medium">$3,510.45</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Bought 4.2 ETH at $3,510.45 for a total of $14,743.89
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-md p-3 border-l-4 border-red-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">Sell Order Executed</div>
                        <div className="text-sm text-muted-foreground">Momentum Trader - MSFT</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">3 hours ago</div>
                        <div className="text-sm font-medium">$403.78</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Sold 25 shares of MSFT at $403.78 for a total of $10,094.50 (Profit: $132.50)
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-md p-3 border-l-4 border-amber-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">Strategy Alert</div>
                        <div className="text-sm text-muted-foreground">Momentum Trader</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">4 hours ago</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Detected potential momentum opportunity in NVDA. Monitoring for entry point.
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-border/40 pt-4">
                <Button variant="outline" className="gap-1">
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span>Load More</span>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="signals" className="mt-4">
            <TradingSignals />
          </TabsContent>
        </Tabs>
      </div>
      {selectedStrategy && (
        <StrategySettingsModal 
          open={settingsModalOpen}
          onOpenChange={setSettingsModalOpen}
          strategyName={selectedStrategy.name}
          strategyType={selectedStrategy.type}
          initialParams={selectedStrategy.params}
        />
      )}
    </div>
    </Sidebar></>
  )
}

