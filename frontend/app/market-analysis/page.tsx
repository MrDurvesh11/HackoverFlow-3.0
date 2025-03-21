"use client"

import { useState } from "react"
import { ArrowRight, Calendar, RefreshCw, Search, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StockChart } from "@/components/stock-chart"
import { CryptoChart } from "@/components/crypto-chart"

export default function MarketAnalysis() {
  const [activeTab, setActiveTab] = useState("stock")

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border/40 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Market Analysis</h1>
          <p className="text-muted-foreground">AI-powered insights and predictions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>Mar 20, 2025</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <Tabs defaultValue="stock" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-background/50 border border-border/40">
              <TabsTrigger value="stock">Stock Analyzer</TabsTrigger>
              <TabsTrigger value="crypto">Crypto Analyzer</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="stock" className="mt-0 space-y-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search for a stock..." className="pl-9 bg-background/50 border-border/40" />
              </div>
              <Select defaultValue="1d">
                <SelectTrigger className="w-[120px] bg-background/50 border-border/40">
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
              <Button>Analyze</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-gradient-card border-border/40 lg:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>AAPL Stock Analysis</CardTitle>
                      <CardDescription>Apple Inc. - NASDAQ</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-profit">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-bold">+1.24%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <StockChart />
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/40">
                <CardHeader>
                  <CardTitle>AI Prediction</CardTitle>
                  <CardDescription>LSTM and Monte Carlo simulation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Price Prediction (7 days)</div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">$192.45</div>
                      <div className="text-profit text-sm flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>+2.74%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 w-[65%]"></div>
                    </div>
                    <div className="text-xs text-muted-foreground">65% confidence interval</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Market Sentiment</div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/30 rounded-md p-2">
                        <div className="text-xs text-muted-foreground">Bullish</div>
                        <div className="font-bold text-profit">72%</div>
                      </div>
                      <div className="bg-muted/30 rounded-md p-2">
                        <div className="text-xs text-muted-foreground">Neutral</div>
                        <div className="font-bold">18%</div>
                      </div>
                      <div className="bg-muted/30 rounded-md p-2">
                        <div className="text-xs text-muted-foreground">Bearish</div>
                        <div className="font-bold text-loss">10%</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Key Indicators</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>RSI (14)</span>
                        <span className="font-medium">58.32</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>MACD</span>
                        <span className="font-medium text-profit">Bullish</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Moving Avg (50)</span>
                        <span className="font-medium">$183.45</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Volume</span>
                        <span className="font-medium">32.4M</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full gap-1">
                    <span>Detailed Analysis</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-card border-border/40">
              <CardHeader>
                <CardTitle>AI Market Insights</CardTitle>
                <CardDescription>Generated using advanced ML models</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Technical Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Apple (AAPL) is showing strong bullish momentum with a breakout above the 50-day moving average. The
                    RSI at 58.32 indicates moderate buying pressure without being overbought. MACD is positive and
                    trending upward, confirming the bullish signal. Volume has increased by 15% compared to the 30-day
                    average, supporting the upward movement.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Fundamental Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Apple's recent product announcements have been well-received by the market. The company's services
                    segment continues to show strong growth, contributing to improved profit margins. Forward P/E ratio
                    of 28.5 is slightly above the 5-year average but justified by growth prospects. Cash reserves remain
                    strong, supporting potential for increased dividends or share buybacks.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Risk Assessment</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-muted/30 rounded-md p-2">
                      <div className="text-xs text-muted-foreground">Short-term Risk</div>
                      <div className="font-bold text-amber-500">Medium</div>
                    </div>
                    <div className="bg-muted/30 rounded-md p-2">
                      <div className="text-xs text-muted-foreground">Medium-term Risk</div>
                      <div className="font-bold text-green-500">Low</div>
                    </div>
                    <div className="bg-muted/30 rounded-md p-2">
                      <div className="text-xs text-muted-foreground">Long-term Risk</div>
                      <div className="font-bold text-green-500">Low</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crypto" className="mt-0 space-y-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for a cryptocurrency..."
                  className="pl-9 bg-background/50 border-border/40"
                />
              </div>
              <Select defaultValue="1d">
                <SelectTrigger className="w-[120px] bg-background/50 border-border/40">
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
              <Button>Analyze</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-gradient-card border-border/40 lg:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>BTC Price Analysis</CardTitle>
                      <CardDescription>Bitcoin - BTC/USD</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-loss">
                      <TrendingDown className="h-4 w-4" />
                      <span className="font-bold">-2.15%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <CryptoChart />
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/40">
                <CardHeader>
                  <CardTitle>AI Prediction</CardTitle>
                  <CardDescription>LSTM and Monte Carlo simulation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Price Prediction (7 days)</div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">$71,245.32</div>
                      <div className="text-profit text-sm flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>+4.39%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 w-[58%]"></div>
                    </div>
                    <div className="text-xs text-muted-foreground">58% confidence interval</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Market Sentiment</div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted/30 rounded-md p-2">
                        <div className="text-xs text-muted-foreground">Bullish</div>
                        <div className="font-bold text-profit">65%</div>
                      </div>
                      <div className="bg-muted/30 rounded-md p-2">
                        <div className="text-xs text-muted-foreground">Neutral</div>
                        <div className="font-bold">20%</div>
                      </div>
                      <div className="bg-muted/30 rounded-md p-2">
                        <div className="text-xs text-muted-foreground">Bearish</div>
                        <div className="font-bold text-loss">15%</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Key Indicators</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>RSI (14)</span>
                        <span className="font-medium">42.18</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>MACD</span>
                        <span className="font-medium text-loss">Bearish</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Moving Avg (50)</span>
                        <span className="font-medium">$65,432.10</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Volume (24h)</span>
                        <span className="font-medium">$28.7B</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full gap-1">
                    <span>Detailed Analysis</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-card border-border/40">
              <CardHeader>
                <CardTitle>Crypto Market Insights</CardTitle>
                <CardDescription>Generated using advanced ML models</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Technical Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Bitcoin is currently in a short-term correction phase after reaching an all-time high of $73,750
                    last week. The RSI at 42.18 indicates a neutral to slightly oversold condition, suggesting a
                    potential bounce. However, the MACD shows a bearish crossover, indicating that the correction may
                    continue in the short term. Support levels are established at $67,500 and $65,000, with resistance
                    at $70,000 and $72,500.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">On-Chain Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    On-chain metrics show strong accumulation by long-term holders, with a decrease in exchange reserves
                    by 2.3% over the past week. The number of active addresses has increased by 5.7%, indicating growing
                    network activity. Mining difficulty has adjusted upward by 3.2%, reflecting increased network
                    security. Overall, on-chain data suggests a healthy network despite the price correction.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Risk Assessment</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-muted/30 rounded-md p-2">
                      <div className="text-xs text-muted-foreground">Short-term Risk</div>
                      <div className="font-bold text-red-500">High</div>
                    </div>
                    <div className="bg-muted/30 rounded-md p-2">
                      <div className="text-xs text-muted-foreground">Medium-term Risk</div>
                      <div className="font-bold text-amber-500">Medium</div>
                    </div>
                    <div className="bg-muted/30 rounded-md p-2">
                      <div className="text-xs text-muted-foreground">Long-term Risk</div>
                      <div className="font-bold text-green-500">Low</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="mt-0 space-y-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Stock symbol (e.g., AAPL)" className="pl-9 bg-background/50 border-border/40" />
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Crypto symbol (e.g., BTC)" className="pl-9 bg-background/50 border-border/40" />
              </div>
              <Button>Compare</Button>
            </div>

            <Card className="bg-gradient-card border-border/40">
              <CardHeader>
                <CardTitle>AAPL vs BTC Comparison</CardTitle>
                <CardDescription>Performance and correlation analysis</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="h-full">
                  <StockChart />
                </div>
                <div className="h-full">
                  <CryptoChart />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-card border-border/40">
                <CardHeader>
                  <CardTitle>Correlation Analysis</CardTitle>
                  <CardDescription>Statistical relationship between assets</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Correlation Coefficient</div>
                    <div className="text-2xl font-bold">0.32</div>
                    <div className="text-xs text-muted-foreground">Weak positive correlation</div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Correlation Over Time</div>
                    <div className="h-32 w-full bg-muted/30 rounded-md"></div>
                    <div className="text-xs text-muted-foreground">
                      Correlation has increased during market volatility
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Key Insights</div>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                      <li>Both assets show sensitivity to macroeconomic factors</li>
                      <li>Bitcoin exhibits higher volatility (3.2x) compared to AAPL</li>
                      <li>Correlation increases during market stress events</li>
                      <li>Diversification benefits remain significant</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/40">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Comparative analysis of key metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1"></div>
                      <div className="text-center text-sm font-medium text-stock">AAPL</div>
                      <div className="text-center text-sm font-medium text-crypto">BTC</div>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-sm">YTD Return</div>
                        <div className="text-center text-sm text-profit">+12.4%</div>
                        <div className="text-center text-sm text-profit">+45.7%</div>
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
                        <div className="text-center text-sm text-loss">-15.2%</div>
                        <div className="text-center text-sm text-loss">-32.7%</div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-sm">Beta (vs S&P 500)</div>
                        <div className="text-center text-sm">1.2</div>
                        <div className="text-center text-sm">2.8</div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <h3 className="text-sm font-medium mb-2">AI Recommendation</h3>
                      <p className="text-xs text-muted-foreground">
                        Based on risk-adjusted returns and correlation analysis, a portfolio allocation of 70% AAPL and
                        30% BTC would optimize the risk-return profile while maintaining diversification benefits. This
                        allocation has historically outperformed either asset alone on a risk-adjusted basis.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

