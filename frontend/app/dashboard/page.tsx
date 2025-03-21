"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { MarketOverview } from "@/components/market-overview"
import { StockChart } from "@/components/stock-chart"
import { CryptoChart } from "@/components/crypto-chart"
import { MarketNews } from "@/components/market-news"
import { ChatbotButton } from "@/components/chatbot-button"
import { RecentTransactions } from "@/components/recent-transactions"
import { Sidebar } from "@/components/sidebar"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState("")
  const [marketData, setMarketData] = useState({
    sp500: { value: 4783.45, change: 1.23 },
    nasdaq: { value: 16742.39, change: 0.87 },
    bitcoin: { value: 68245.12, change: -2.15 },
    ethereum: { value: 3542.78, change: 0.63 },
  })

  // Only update the time on the client side
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString())
  }, [])

  const refreshData = () => {
    setIsLoading(true)
    setCurrentTime(new Date().toLocaleTimeString())

    // Simulate API call to refresh market data
    setTimeout(() => {
      // Update with slightly different values to simulate real-time changes
      setMarketData({
        sp500: {
          value: +(marketData.sp500.value + (Math.random() * 2 - 1)).toFixed(2),
          change: +(marketData.sp500.change + (Math.random() * 0.2 - 0.1)).toFixed(2),
        },
        nasdaq: {
          value: +(marketData.nasdaq.value + (Math.random() * 5 - 2.5)).toFixed(2),
          change: +(marketData.nasdaq.change + (Math.random() * 0.3 - 0.15)).toFixed(2),
        },
        bitcoin: {
          value: +(marketData.bitcoin.value + (Math.random() * 200 - 100)).toFixed(2),
          change: +(marketData.bitcoin.change + (Math.random() * 0.5 - 0.25)).toFixed(2),
        },
        ethereum: {
          value: +(marketData.ethereum.value + (Math.random() * 20 - 10)).toFixed(2),
          change: +(marketData.ethereum.change + (Math.random() * 0.4 - 0.2)).toFixed(2),
        },
      })

      setIsLoading(false)
    }, 1000)
  }


  return (<>
    <Sidebar>
    <div className="flex flex-col h-full">
       <header className="border-b border-border/40 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, John Doe</p>
        </div>
        <div className="flex items-center gap-2">
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
        {/* Market Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardDescription>Stock Market</CardDescription>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">S&P 500</CardTitle>
                <DollarSign className="h-4 w-4 text-stock" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{marketData.sp500.value.toLocaleString()}</div>
                <div
                  className={`flex items-center gap-1 ${marketData.sp500.change >= 0 ? "text-profit" : "text-loss"}`}
                >
                  {marketData.sp500.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  <span>{Math.abs(marketData.sp500.change).toFixed(2)}%</span>
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
                <CardTitle className="text-lg">NASDAQ</CardTitle>
                <DollarSign className="h-4 w-4 text-stock" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{marketData.nasdaq.value.toLocaleString()}</div>
                <div
                  className={`flex items-center gap-1 ${marketData.nasdaq.change >= 0 ? "text-profit" : "text-loss"}`}
                >
                  {marketData.nasdaq.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  <span>{Math.abs(marketData.nasdaq.change).toFixed(2)}%</span>
                </div>
              </div>
              <div className="mt-2 h-10 w-full">
                <div className="h-full w-full bg-gradient-stock rounded-md"></div>
              </div>
            </CardContent>
          </Card>

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
                <div className="text-2xl font-bold">${marketData.bitcoin.value.toLocaleString()}</div>
                <div
                  className={`flex items-center gap-1 ${marketData.bitcoin.change >= 0 ? "text-profit" : "text-loss"}`}
                >
                  {marketData.bitcoin.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  <span>{Math.abs(marketData.bitcoin.change).toFixed(2)}%</span>
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
                <div className="text-2xl font-bold">${marketData.ethereum.value.toLocaleString()}</div>
                <div
                  className={`flex items-center gap-1 ${marketData.ethereum.change >= 0 ? "text-profit" : "text-loss"}`}
                >
                  {marketData.ethereum.change >= 0 ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(marketData.ethereum.change).toFixed(2)}%</span>
                </div>
              </div>
              <div className="mt-2 h-10 w-full">
                <div className="h-full w-full bg-gradient-crypto rounded-md"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Summary */}
        <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Portfolio Summary</CardTitle>
              <CardDescription>Your investment overview</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1" asChild>
              <a href="/portfolio">
                <span>View Details</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-2xl font-bold">$124,532.89</div>
                <div className="flex items-center text-profit gap-1 text-sm">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+12.4% all time</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Today's Change</div>
                <div className="text-2xl font-bold">+$1,245.32</div>
                <div className="flex items-center text-profit gap-1 text-sm">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+1.01% today</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Asset Distribution</div>
                <div className="flex gap-2">
                  <div className="h-6 rounded-sm bg-blue-500 w-[60%]"></div>
                  <div className="h-6 rounded-sm bg-purple-500 w-[40%]"></div>
                </div>
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Stocks (60%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span>Crypto (40%)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Charts */}
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-background/50 border border-border/40">
              <TabsTrigger value="all">All Markets</TabsTrigger>
              <TabsTrigger value="stocks">Stocks</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <LineChart className="h-3.5 w-3.5 mr-1" />
                <span>Line</span>
              </Button>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>Stock Market Trends</CardTitle>
                      <CardDescription>Major indices performance</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 px-2 text-xs bg-muted">
                        1D
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                        1W
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                        1M
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <StockChart />
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>Crypto Market Trends</CardTitle>
                      <CardDescription>Top cryptocurrencies</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 px-2 text-xs bg-muted">
                        1D
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                        1W
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                        1M
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <CryptoChart />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stocks" className="mt-0">
            <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Stock Market Detailed View</CardTitle>
                    <CardDescription>Major indices and top performers</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs bg-muted">
                      1D
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                      1W
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                      1M
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[400px]">
                <StockChart />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crypto" className="mt-0">
            <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Crypto Market Detailed View</CardTitle>
                    <CardDescription>Top cryptocurrencies and trends</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs bg-muted">
                      1D
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                      1W
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                      1M
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[400px]">
                <CryptoChart />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Market Overview and News */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-card border-border/40 lg:col-span-2 hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Market Overview</CardTitle>
              <CardDescription>Top performers and market movers</CardDescription>
            </CardHeader>
            <CardContent>
              <MarketOverview activeTab={activeTab} />
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Market News</CardTitle>
              <CardDescription>Latest financial updates</CardDescription>
            </CardHeader>
            <CardContent>
              <MarketNews />
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest trading activity</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/transactions">View All</a>
            </Button>
          </CardHeader>
          <CardContent>
            <RecentTransactions />
          </CardContent>
        </Card>
      </div>

      <ChatbotButton />
    </div>
    </Sidebar></>
  )
}

