"use client"

import { useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  Download,
  Filter,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { StockChart } from "@/components/stock-chart"
import { CryptoChart } from "@/components/crypto-chart"

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border/40 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">Track and manage your investments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Button variant="default" size="sm" className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            <span>Add Asset</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-border/40">
            <CardHeader className="pb-2">
              <CardDescription>Total Portfolio Value</CardDescription>
              <CardTitle className="text-2xl">$124,532.89</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Daily Change</span>
                <span className="font-medium text-profit flex items-center gap-1">
                  <ArrowUp className="h-3 w-3" />
                  +$1,245.32 (1.01%)
                </span>
              </div>
              <div className="mt-2 h-10 w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-md"></div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/40">
            <CardHeader className="pb-2">
              <CardDescription>Stock Holdings</CardDescription>
              <CardTitle className="text-2xl">$74,719.73</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Allocation</span>
                <span className="font-medium">60%</span>
              </div>
              <div className="mt-2 h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[60%]"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/40">
            <CardHeader className="pb-2">
              <CardDescription>Crypto Holdings</CardDescription>
              <CardTitle className="text-2xl">$49,813.16</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Allocation</span>
                <span className="font-medium">40%</span>
              </div>
              <div className="mt-2 h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[40%]"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/40">
            <CardHeader className="pb-2">
              <CardDescription>Total Profit/Loss</CardDescription>
              <CardTitle className="text-2xl text-profit">+$15,432.67</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">All Time</span>
                <span className="font-medium text-profit">+12.4%</span>
              </div>
              <div className="mt-2 h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 w-[80%]"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="bg-background/50 border border-border/40">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-gradient-card border-border/40 lg:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>Portfolio Performance</CardTitle>
                      <CardDescription>Historical value over time</CardDescription>
                    </div>
                    <Select defaultValue="1m">
                      <SelectTrigger className="w-[100px] bg-background/50 border-border/40">
                        <SelectValue placeholder="Time Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1w">1 Week</SelectItem>
                        <SelectItem value="1m">1 Month</SelectItem>
                        <SelectItem value="3m">3 Months</SelectItem>
                        <SelectItem value="1y">1 Year</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <div className="h-full">
                    <StockChart />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/40">
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                  <CardDescription>Distribution by asset class</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-40 h-40 rounded-full border-8 border-blue-500 relative">
                      <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-purple-500 border-r-purple-500 transform rotate-[60deg]"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                        $124,532.89
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Stocks</span>
                      </div>
                      <div className="text-sm font-medium">60% ($74,719.73)</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-sm">Cryptocurrencies</span>
                      </div>
                      <div className="text-sm font-medium">40% ($49,813.16)</div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full gap-1">
                    <PieChart className="h-3.5 w-3.5" />
                    <span>Detailed Breakdown</span>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-card border-border/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Top Holdings</CardTitle>
                  <CardDescription>Your best performing assets</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filter</span>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Avg. Price</TableHead>
                      <TableHead className="text-right">Current Price</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Profit/Loss</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">AAPL</TableCell>
                      <TableCell className="text-stock">Stock</TableCell>
                      <TableCell className="text-right">125</TableCell>
                      <TableCell className="text-right">$165.45</TableCell>
                      <TableCell className="text-right">$187.32</TableCell>
                      <TableCell className="text-right">$23,415.00</TableCell>
                      <TableCell className={cn("text-right flex items-center justify-end gap-1", "text-profit")}>
                        <ArrowUp className="h-3 w-3" />
                        +13.2%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">BTC</TableCell>
                      <TableCell className="text-crypto">Crypto</TableCell>
                      <TableCell className="text-right">0.45</TableCell>
                      <TableCell className="text-right">$58,432.10</TableCell>
                      <TableCell className="text-right">$68,245.12</TableCell>
                      <TableCell className="text-right">$30,710.30</TableCell>
                      <TableCell className={cn("text-right flex items-center justify-end gap-1", "text-profit")}>
                        <ArrowUp className="h-3 w-3" />
                        +16.8%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">MSFT</TableCell>
                      <TableCell className="text-stock">Stock</TableCell>
                      <TableCell className="text-right">85</TableCell>
                      <TableCell className="text-right">$342.18</TableCell>
                      <TableCell className="text-right">$403.78</TableCell>
                      <TableCell className="text-right">$34,321.30</TableCell>
                      <TableCell className={cn("text-right flex items-center justify-end gap-1", "text-profit")}>
                        <ArrowUp className="h-3 w-3" />
                        +18.0%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">ETH</TableCell>
                      <TableCell className="text-crypto">Crypto</TableCell>
                      <TableCell className="text-right">5.4</TableCell>
                      <TableCell className="text-right">$3,245.67</TableCell>
                      <TableCell className="text-right">$3,542.78</TableCell>
                      <TableCell className="text-right">$19,131.01</TableCell>
                      <TableCell className={cn("text-right flex items-center justify-end gap-1", "text-profit")}>
                        <ArrowUp className="h-3 w-3" />
                        +9.2%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">NVDA</TableCell>
                      <TableCell className="text-stock">Stock</TableCell>
                      <TableCell className="text-right">20</TableCell>
                      <TableCell className="text-right">$745.32</TableCell>
                      <TableCell className="text-right">$875.28</TableCell>
                      <TableCell className="text-right">$17,505.60</TableCell>
                      <TableCell className={cn("text-right flex items-center justify-end gap-1", "text-profit")}>
                        <ArrowUp className="h-3 w-3" />
                        +17.4%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stocks" className="mt-4 space-y-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search stocks..." className="pl-9 bg-background/50 border-border/40" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px] bg-background/50 border-border/40">
                  <SelectValue placeholder="Filter by sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="consumer">Consumer</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-1">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Sort</span>
              </Button>
            </div>

            <Card className="bg-gradient-card border-border/40">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Stock Portfolio Performance</CardTitle>
                    <CardDescription>Historical value over time</CardDescription>
                  </div>
                  <Select defaultValue="1m">
                    <SelectTrigger className="w-[100px] bg-background/50 border-border/40">
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1w">1 Week</SelectItem>
                      <SelectItem value="1m">1 Month</SelectItem>
                      <SelectItem value="3m">3 Months</SelectItem>
                      <SelectItem value="1y">1 Year</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="h-[300px]">
                <StockChart />
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Stock Holdings</CardTitle>
                  <CardDescription>All your stock investments</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Sector</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Avg. Price</TableHead>
                      <TableHead className="text-right">Current Price</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Profit/Loss</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">AAPL</TableCell>
                      <TableCell>Apple Inc.</TableCell>
                      <TableCell>Technology</TableCell>
                      <TableCell className="text-right">125</TableCell>
                      <TableCell className="text-right">$165.45</TableCell>
                      <TableCell className="text-right">$187.32</TableCell>
                      <TableCell className="text-right">$23,415.00</TableCell>
                      <TableCell className={cn("text-right flex items-center justify-end gap-1", "text-profit")}>
                        <ArrowUp className="h-3 w-3" />
                        +13.2%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">MSFT</TableCell>
                      <TableCell>Microsoft Corp.</TableCell>
                      <TableCell>Technology</TableCell>
                      <TableCell className="text-right">85</TableCell>
                      <TableCell className="text-right">$342.18</TableCell>
                      <TableCell className="text-right">$403.78</TableCell>
                      <TableCell className="text-right">$34,321.30</TableCell>
                      <TableCell className={cn("text-right flex items-center justify-end gap-1", "text-profit")}>
                        <ArrowUp className="h-3 w-3" />
                        +18.0%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">NVDA</TableCell>
                      <TableCell>NVIDIA Corp.</TableCell>
                      <TableCell>Technology</TableCell>
                      <TableCell className="text-right">20</TableCell>
                      <TableCell className="text-right">$745.32</TableCell>
                      <TableCell className="text-right">$875.28</TableCell>
                      <TableCell className="text-right">$17,505.60</TableCell>
                      <TableCell className={cn("text-right flex items-center justify-end gap-1", "text-profit")}>
                        <ArrowUp className="h-3 w-3" />
                        +17.4%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">AMZN</TableCell>
                      <TableCell>Amazon.com Inc.</TableCell>
                      <TableCell>Consumer</TableCell>
                      <TableCell className="text-right">30</TableCell>
                      <TableCell className="text-right">$165.78</TableCell>
                      <TableCell className="text-right">$178.12</TableCell>
                      <TableCell className="text-right">$5,343.60</TableCell>
                      <TableCell className={cn("text-right flex items-center justify-end gap-1", "text-profit")}>
                        <ArrowUp className="h-3 w-3" />
                        +7.4%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">TSLA</TableCell>
                      <TableCell>Tesla Inc.</TableCell>
                      <TableCell>Consumer</TableCell>
                      <TableCell className="text-right">15</TableCell>
                      <TableCell className="text-right">$245.67</TableCell>
                      <TableCell className="text-right">$237.49</TableCell>
                      <TableCell className="text-right">$3,562.35</TableCell>
                      <TableCell className={cn("text-right flex items-center justify-end gap-1", "text-loss")}>
                        <ArrowDown className="h-3 w-3" />
                        -3.3%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crypto" className="mt-4 space-y-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search cryptocurrencies..." className="pl-9 bg-background/50 border-border/40" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px] bg-background/50 border-border/40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="layer1">Layer 1</SelectItem>
                  <SelectItem value="defi">DeFi</SelectItem>
                  <SelectItem value="nft">NFT</SelectItem>
                  <SelectItem value="meme">Meme</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-1">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Sort</span>
              </Button>
            </div>

            <Card className="bg-gradient-card border-border/40">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Crypto Portfolio Performance</CardTitle>
                    <CardDescription>Historical value over time</CardDescription>
                  </div>
                  <Select defaultValue="1m">
                    <SelectTrigger className="w-[100px] bg-background/50 border-border/40">
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1w">1 Week</SelectItem>
                      <SelectItem value="1m">1 Month</SelectItem>
                      <SelectItem value="3m">3 Months</SelectItem>
                      <SelectItem value="1y">1 Year</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="h-[300px]">
                <CryptoChart />
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Crypto Holdings</CardTitle>
                  <CardDescription>All your cryptocurrency investments</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Avg. Price</TableHead>
                      <TableHead className="text-right">Current Price</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Profit/Loss</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">BTC</TableCell>
                      <TableCell>Bitcoin</TableCell>
                      <TableCell>Layer 1</TableCell>
                      <TableCell className="text-right">0.45</TableCell>
                      <TableCell className="text-right">$58,432.10</TableCell>
                      <TableCell className="text-right">$68,245.12</TableCell>
                      <TableCell className="text-right">$30,710.30</TableCell>
                      <TableCell className={cn("text-right flex items-center justify-end gap-1", "text-profit")}>
                        <ArrowUp className="h-3 w-3" />
                        +16.8%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">ETH</TableCell>
                      <TableCell>Ethereum</TableCell>
                      <TableCell>Layer 1</TableCell>
                      <TableCell className="text-right">5.4</TableCell>
                      <TableCell className="text-right">$3,245.67</TableCell>
                      <TableCell className="text-right">$3,542.78</TableCell>
                      <TableCell className="text-right">$19,131.01</TableCell>
                      <TableCell className={cn("text-right flex items-center justify-end gap-1", "text-profit")}>
                        <ArrowUp className="h-3 w-3" />
                        +9.2%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">SOL</TableCell>
                      <TableCell>Solana</TableCell>
                      <TableCell>Layer 1</TableCell>
                      <TableCell className="text-right">25</TableCell>
                      <TableCell className="text-right">$132.45</TableCell>
                      <TableCell className="text-right">$143.87</TableCell>
                      <TableCell className="text-right">$3,596.75</TableCell>
                      <TableCell className={cn("text-right flex items-center justify-end gap-1", "text-profit")}>
                        <ArrowUp className="h-3 w-3" />
                        +8.6%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">BNB</TableCell>
                      <TableCell>Binance Coin</TableCell>
                      <TableCell>Exchange</TableCell>
                      <TableCell className="text-right">10</TableCell>
                      <TableCell className="text-right">$532.18</TableCell>
                      <TableCell className="text-right">$567.32</TableCell>
                      <TableCell className="text-right">$5,673.20</TableCell>
                      <TableCell className={cn("text-right flex items-center justify-end gap-1", "text-profit")}>
                        <ArrowUp className="h-3 w-3" />
                        +6.6%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">ADA</TableCell>
                      <TableCell>Cardano</TableCell>
                      <TableCell>Layer 1</TableCell>
                      <TableCell className="text-right">1500</TableCell>
                      <TableCell className="text-right">$0.52</TableCell>
                      <TableCell className="text-right">$0.58</TableCell>
                      <TableCell className="text-right">$870.00</TableCell>
                      <TableCell className={cn("text-right flex items-center justify-end gap-1", "text-profit")}>
                        <ArrowUp className="h-3 w-3" />
                        +11.5%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-4 space-y-4">
            <div className="flex gap-4 items-center">
              <Select defaultValue="1y">
                <SelectTrigger className="w-[150px] bg-background/50 border-border/40">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Month</SelectItem>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="6m">6 Months</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Custom Range</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-3.5 w-3.5" />
                <span>Export Report</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-card border-border/40">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key portfolio statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Total Return</div>
                      <div className="text-2xl font-bold text-profit">+12.4%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Annualized Return</div>
                      <div className="text-2xl font-bold text-profit">+15.8%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                      <div className="text-2xl font-bold">1.85</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Volatility</div>
                      <div className="text-2xl font-bold">18.4%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Max Drawdown</div>
                      <div className="text-2xl font-bold text-loss">-15.2%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Beta (vs S&P 500)</div>
                      <div className="text-2xl font-bold">1.32</div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full gap-1">
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>Advanced Metrics</span>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/40">
                <CardHeader>
                  <CardTitle>Asset Class Performance</CardTitle>
                  <CardDescription>Comparison by asset type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Stocks</span>
                        <span className="font-medium text-profit">+14.2%</span>
                      </div>
                      <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[70%]"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Cryptocurrencies</span>
                        <span className="font-medium text-profit">+22.8%</span>
                      </div>
                      <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-[85%]"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>S&P 500 (Benchmark)</span>
                        <span className="font-medium text-profit">+10.5%</span>
                      </div>
                      <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[60%]"></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="text-sm font-medium mb-2">Performance Analysis</div>
                    <p className="text-xs text-muted-foreground">
                      Your portfolio has outperformed the S&P 500 by 4.3% over the selected time period.
                      Cryptocurrencies have been the strongest performing asset class, contributing 58% of total returns
                      despite representing only 40% of your portfolio allocation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-card border-border/40">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div>
                    <CardTitle>Historical Performance</CardTitle>
                    <CardDescription>Portfolio value over time</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                      Daily
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                      Weekly
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs bg-muted">
                      Monthly
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[400px]">
                <div className="h-full">
                  <StockChart />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

