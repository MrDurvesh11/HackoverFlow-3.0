"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, Calendar, ChevronDown, Download, Filter, Plus, RefreshCw, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function Transactions() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <div className="flex flex-col h-full">
      <header className="border-b border-border/40 p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View and manage your trading activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
          <Button variant="default" size="sm" className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            <span>New Trade</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-border/40">
            <CardHeader className="pb-2">
              <CardDescription>Total Transactions</CardDescription>
              <CardTitle className="text-2xl">248</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Last 30 days</span>
                <span>+32 new transactions</span>
              </div>
              <div className="mt-2 h-10 w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-md"></div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/40">
            <CardHeader className="pb-2">
              <CardDescription>Buy Orders</CardDescription>
              <CardTitle className="text-2xl">142</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-medium">$87,432.56</span>
              </div>
              <div className="mt-2 h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[57%]"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/40">
            <CardHeader className="pb-2">
              <CardDescription>Sell Orders</CardDescription>
              <CardTitle className="text-2xl">106</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-medium">$102,865.23</span>
              </div>
              <div className="mt-2 h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[43%]"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/40">
            <CardHeader className="pb-2">
              <CardDescription>Net Profit/Loss</CardDescription>
              <CardTitle className="text-2xl text-profit">+$15,432.67</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Win Rate</span>
                <span className="font-medium text-profit">68%</span>
              </div>
              <div className="mt-2 h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 w-[68%]"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
            <TabsList className="bg-background/50 border border-border/40">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="buy">Buy Orders</TabsTrigger>
              <TabsTrigger value="sell">Sell Orders</TabsTrigger>
              <TabsTrigger value="fees">Fees & Charges</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-[250px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search transactions..." className="pl-9 bg-background/50 border-border/40" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Date Range</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>Filter</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </Button>
            </div>
          </div>
        </div>

        <Card className="bg-gradient-card border-border/40">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead className="text-right">Fees</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">Mar 20, 2025</div>
                    <div className="text-xs text-muted-foreground">10:45 AM</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-green-500">
                      <ArrowDown className="h-3.5 w-3.5" />
                      <span>Buy</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">AAPL</div>
                    <div className="text-xs text-muted-foreground">Stock</div>
                  </TableCell>
                  <TableCell className="text-right">53</TableCell>
                  <TableCell className="text-right">$187.32</TableCell>
                  <TableCell className="text-right">$9,927.96</TableCell>
                  <TableCell className="text-right">$9.95</TableCell>
                  <TableCell>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/10 text-green-500">
                      Completed
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="font-medium">Mar 20, 2025</div>
                    <div className="text-xs text-muted-foreground">09:32 AM</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-red-500">
                      <ArrowUp className="h-3.5 w-3.5" />
                      <span>Sell</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">ETH</div>
                    <div className="text-xs text-muted-foreground">Crypto</div>
                  </TableCell>
                  <TableCell className="text-right">4.2</TableCell>
                  <TableCell className="text-right">$3,542.78</TableCell>
                  <TableCell className="text-right">$14,879.68</TableCell>
                  <TableCell className="text-right">$14.88</TableCell>
                  <TableCell>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/10 text-green-500">
                      Completed
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="font-medium">Mar 19, 2025</div>
                    <div className="text-xs text-muted-foreground">03:15 PM</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-green-500">
                      <ArrowDown className="h-3.5 w-3.5" />
                      <span>Buy</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">ETH</div>
                    <div className="text-xs text-muted-foreground">Crypto</div>
                  </TableCell>
                  <TableCell className="text-right">4.2</TableCell>
                  <TableCell className="text-right">$3,510.45</TableCell>
                  <TableCell className="text-right">$14,743.89</TableCell>
                  <TableCell className="text-right">$14.74</TableCell>
                  <TableCell>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/10 text-green-500">
                      Completed
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="font-medium">Mar 19, 2025</div>
                    <div className="text-xs text-muted-foreground">01:45 PM</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-red-500">
                      <ArrowUp className="h-3.5 w-3.5" />
                      <span>Sell</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">MSFT</div>
                    <div className="text-xs text-muted-foreground">Stock</div>
                  </TableCell>
                  <TableCell className="text-right">25</TableCell>
                  <TableCell className="text-right">$403.78</TableCell>
                  <TableCell className="text-right">$10,094.50</TableCell>
                  <TableCell className="text-right">$9.99</TableCell>
                  <TableCell>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/10 text-green-500">
                      Completed
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="font-medium">Mar 19, 2025</div>
                    <div className="text-xs text-muted-foreground">11:20 AM</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-green-500">
                      <ArrowDown className="h-3.5 w-3.5" />
                      <span>Buy</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">MSFT</div>
                    <div className="text-xs text-muted-foreground">Stock</div>
                  </TableCell>
                  <TableCell className="text-right">25</TableCell>
                  <TableCell className="text-right">$398.48</TableCell>
                  <TableCell className="text-right">$9,962.00</TableCell>
                  <TableCell className="text-right">$9.95</TableCell>
                  <TableCell>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/10 text-green-500">
                      Completed
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="font-medium">Mar 18, 2025</div>
                    <div className="text-xs text-muted-foreground">03:45 PM</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-amber-500">
                      <span>Fee</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">Platform Fee</div>
                    <div className="text-xs text-muted-foreground">Monthly</div>
                  </TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">$29.99</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell>
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/10 text-green-500">
                      Processed
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/40 pt-4">
            <Button variant="outline" className="gap-1">
              <ChevronDown className="h-3.5 w-3.5" />
              <span>Load More</span>
            </Button>
          </CardFooter>
        </Card>

        <TabsContent value="fees" className="mt-0">
          <Card className="bg-gradient-card border-border/40">
            <CardHeader>
              <CardTitle>Fee Summary</CardTitle>
              <CardDescription>Overview of all fees and charges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 rounded-md p-4">
                    <div className="text-sm text-muted-foreground">Trading Fees (30 days)</div>
                    <div className="text-2xl font-bold mt-1">$245.32</div>
                    <div className="text-xs text-muted-foreground mt-1">Average 0.1% per trade</div>
                  </div>

                  <div className="bg-muted/30 rounded-md p-4">
                    <div className="text-sm text-muted-foreground">Platform Fees (30 days)</div>
                    <div className="text-2xl font-bold mt-1">$29.99</div>
                    <div className="text-xs text-muted-foreground mt-1">Monthly subscription</div>
                  </div>

                  <div className="bg-muted/30 rounded-md p-4">
                    <div className="text-sm text-muted-foreground">Algo Trading Fees (30 days)</div>
                    <div className="text-2xl font-bold mt-1">$124.50</div>
                    <div className="text-xs text-muted-foreground mt-1">Based on performance</div>
                  </div>
                </div>

                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-2">Fee Breakdown</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Amount (30 days)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Stock Trading</TableCell>
                        <TableCell>Commission on stock trades</TableCell>
                        <TableCell className="text-right">$9.95 per trade</TableCell>
                        <TableCell className="text-right">$149.25</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Crypto Trading</TableCell>
                        <TableCell>Commission on crypto trades</TableCell>
                        <TableCell className="text-right">0.1% of trade value</TableCell>
                        <TableCell className="text-right">$96.07</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Platform Subscription</TableCell>
                        <TableCell>Monthly access fee</TableCell>
                        <TableCell className="text-right">$29.99 per month</TableCell>
                        <TableCell className="text-right">$29.99</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Algo Trading Service</TableCell>
                        <TableCell>Performance-based fee</TableCell>
                        <TableCell className="text-right">10% of profits</TableCell>
                        <TableCell className="text-right">$124.50</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Data Feeds</TableCell>
                        <TableCell>Real-time market data</TableCell>
                        <TableCell className="text-right">Included</TableCell>
                        <TableCell className="text-right">$0.00</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </div>
  )
}

