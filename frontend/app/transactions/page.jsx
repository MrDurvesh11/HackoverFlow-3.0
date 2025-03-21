"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  ChevronDown,
  Download,
  Filter,
  LineChart,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  TrendingUp,
  ChevronLeft ,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/components/sidebar";


// Chart.js for visualizations - FIXED: Import necessary scale elements
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
// Register all required components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Transactions() {
  // State variables
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState("30");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  // Data states
  const [balanceData, setBalanceData] = useState([]);
  const [tradesData, setTradesData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [botStatus, setBotStatus] = useState({});
  const [statsData, setStatsData] = useState({
    totalTransactions: 0,
    buyOrders: 0,
    sellOrders: 0,
    buyValue: 0,
    sellValue: 0,
    netProfit: 0,
    winRate: 0,
    totalFees: 0,
  });

  // Chart data states
  const [transactionChartData, setTransactionChartData] = useState({
    labels: ["Buy", "Sell"],
    datasets: [
      {
        data: [60, 40],
        backgroundColor: ["rgba(52, 152, 219, 0.8)", "rgba(155, 89, 182, 0.8)"],
        borderColor: ["rgba(52, 152, 219, 1)", "rgba(155, 89, 182, 1)"],
        borderWidth: 1,
      },
    ],
  });

  const [profitChartData, setProfitChartData] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Profit/Loss",
        data: [4200, -2100, 5300, 1400, 3200, -800, 4500],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  });
  
  const [formattedDate, setFormattedDate] = useState('')

useEffect(() => {
  setFormattedDate(lastUpdated.toLocaleString())
}, [lastUpdated])

  // Calculate total fees
  const calculateFees = (trades) => {
    return trades?.reduce((sum, trade) => {
      return sum + (parseFloat(trade.commission) || 0);
    }, 0) || 0;
  };

  // Format currency consistently to fix hydration issues
  const formatCurrency = (value, minimumFractionDigits = 2, maximumFractionDigits = 2) => {
    // Use a consistent format that won't vary between server and client
    return `$${Number(value).toFixed(maximumFractionDigits)}`;
  };

  // Fetch data from API
  const fetchData = async (showRefreshIndicator = true) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }
    
    try {
      // Fetch trades data
      const tradesResponse = await axios.get(`${API_BASE_URL}/trades`);
      if (tradesResponse.data.success) {
        // Safely handle the trades data
        const trades = tradesResponse.data.data.trades || [];
        setTradesData(trades);
        
        // Update stats based on trade data - with null checks
        const buyTrades = trades.filter(t => t.isBuyer) || [];
        const sellTrades = trades.filter(t => !t.isBuyer) || [];
        
        const summary = tradesResponse.data.data.summary || {};
        
        setStatsData(prev => ({
          ...prev,
          totalTransactions: trades.length,
          buyOrders: buyTrades.length,
          sellOrders: sellTrades.length,
          buyValue: buyTrades.reduce((sum, t) => sum + (parseFloat(t.price) * parseFloat(t.qty)), 0),
          sellValue: sellTrades.reduce((sum, t) => sum + (parseFloat(t.price) * parseFloat(t.qty)), 0),
          netProfit: summary.pnl || 0,
          winRate: summary.pnl_percent > 0 ? 
            Math.round((summary.pnl_percent || 0) * 0.7) : 0,
          totalFees: calculateFees(trades)
        }));
        
        // Update chart data
        setTransactionChartData({
          labels: ["Buy", "Sell"],
          datasets: [
            {
              data: [buyTrades.length, sellTrades.length],
              backgroundColor: ["rgba(52, 152, 219, 0.8)", "rgba(155, 89, 182, 0.8)"],
              borderColor: ["rgba(52, 152, 219, 1)", "rgba(155, 89, 182, 1)"],
              borderWidth: 1,
            },
          ],
        });
      }
      
      // Fetch orders
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders`);
      if (ordersResponse.data.success) {
        setOrdersData(ordersResponse.data.data || []);
      }
      
      // Fetch balance
      const balanceResponse = await axios.get(`${API_BASE_URL}/balance`);
      if (balanceResponse.data.success) {
        setBalanceData(balanceResponse.data.data || []);
      }
      
      // Fetch bot status
      const statusResponse = await axios.get(`${API_BASE_URL}/bot/status`);
      if (statusResponse.data.success) {
        setBotStatus(statusResponse.data.data || {});
      }
      
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Effect to fetch initial data - set up client-side only
  useEffect(() => {
    // Only run on client-side to prevent hydration issues
    fetchData(false);
    
    // Set up auto-refresh interval (every 30 seconds)
    const interval = setInterval(() => {
      fetchData(false);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Handler functions
  const handleRefresh = () => {
    fetchData(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (field, value) => {
    if (field === "dateRange") {
      setDateRange(value);
    } else if (field === "sortField") {
      setSortField(value);
    } else if (field === "sortDirection") {
      setSortDirection(value);
    } else if (field === "itemsPerPage") {
      setItemsPerPage(parseInt(value));
      setCurrentPage(1);
    }
  };

  // Filter and sort transactions based on current filters
  const filteredTransactions = tradesData
    ?.filter(transaction => {
      // Apply tab filter
      if (activeTab === "buy" && !transaction.isBuyer) return false;
      if (activeTab === "sell" && transaction.isBuyer) return false;
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          transaction.symbol?.toLowerCase().includes(query) ||
          transaction.orderId?.toString().includes(query)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortField === "date") {
        const dateA = new Date(a.time);
        const dateB = new Date(b.time);
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else if (sortField === "price") {
        return sortDirection === "asc" 
          ? a.price - b.price 
          : b.price - a.price;
      } else if (sortField === "quantity") {
        return sortDirection === "asc" 
          ? a.qty - b.qty 
          : b.qty - a.qty;
      }
      return 0;
    }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // SafeHydrate component to prevent hydration errors
  const SafeChart = ({ children }) => {
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
      setIsMounted(true);
    }, []);
    
    if (!isMounted) {
      return null;
    }
    
    return children;
  };

  return (
    <Sidebar>
      <div className="flex flex-col h-full">
        <header className="border-b border-border/40 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">
              View and manage your trading activity
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Last {dateRange} days</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Time Period</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleFilterChange("dateRange", "7")}>
                  Last 7 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("dateRange", "30")}>
                  Last 30 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("dateRange", "90")}>
                  Last 90 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("dateRange", "365")}>
                  Last 365 days
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh</span>
                </>
              )}
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Trade</DialogTitle>
                  <DialogDescription>
                    Enter the details of your new trade below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Select defaultValue="buy">
                      <SelectTrigger>
                        <SelectValue placeholder="Order Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input className="col-span-3" placeholder="Symbol (e.g., BTCUSDT)" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm">Quantity</label>
                    <Input className="col-span-3" placeholder="Amount to trade" type="number" step="0.001" min="0" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm">Price</label>
                    <Input className="col-span-3" placeholder="Price per unit" type="number" step="0.01" min="0" />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Execute Trade</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardDescription>Total Transactions</CardDescription>
                <CardTitle className="text-2xl">{statsData.totalTransactions}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Last {dateRange} days</span>
                  <span>+{Math.round(statsData.totalTransactions * 0.12)} new</span>
                </div>
                <div className="mt-2 h-12 w-full rounded-md overflow-hidden">
                  <div style={{ height: '100%', width: '100%', maxWidth: '100%' }}>
                    <SafeChart>
                      {!isLoading && <Doughnut 
                        data={transactionChartData} 
                        options={{ 
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } }
                        }}
                      />}
                    </SafeChart>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardDescription>Buy Orders</CardDescription>
                <CardTitle className="text-2xl">{statsData.buyOrders}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Value</span>
                  <span className="font-medium">{formatCurrency(statsData.buyValue)}</span>
                </div>
                <div className="mt-2 h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ 
                      width: `${statsData.totalTransactions > 0 ? 
                        (statsData.buyOrders / statsData.totalTransactions) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardDescription>Sell Orders</CardDescription>
                <CardTitle className="text-2xl">{statsData.sellOrders}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Value</span>
                  <span className="font-medium">{formatCurrency(statsData.sellValue)}</span>
                </div>
                <div className="mt-2 h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500" 
                    style={{ 
                      width: `${statsData.totalTransactions > 0 ? 
                        (statsData.sellOrders / statsData.totalTransactions) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardDescription>Net Profit/Loss</CardDescription>
                <CardTitle className={`text-2xl ${statsData.netProfit >= 0 ? "text-profit" : "text-loss"}`}>
                  {statsData.netProfit >= 0 ? "+" : ""}{formatCurrency(statsData.netProfit)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Win Rate</span>
                  <span className={`font-medium ${statsData.winRate >= 50 ? "text-profit" : "text-loss"}`}>
                    {statsData.winRate}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${statsData.winRate >= 50 ? 
                      "bg-gradient-to-r from-green-500 to-blue-500" : 
                      "bg-gradient-to-r from-red-500 to-amber-500"}`} 
                    style={{ width: `${statsData.winRate}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profit/Loss Chart */}
          <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Profit/Loss Trend</CardTitle>
                  <CardDescription>Daily P&L overview</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
                      <span>Options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>7 Days</DropdownMenuItem>
                    <DropdownMenuItem>30 Days</DropdownMenuItem>
                    <DropdownMenuItem>90 Days</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Download CSV</DropdownMenuItem>
                    <DropdownMenuItem>Print Report</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="h-60">
              <SafeChart>
                {!isLoading && (
                  <Bar 
                    data={profitChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        y: {
                          beginAtZero: false,
                          grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                )}
              </SafeChart>
            </CardContent>
          </Card>

          {/* Transactions Table with Filters */}
          <div className="flex flex-col gap-4">
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <TabsList className="bg-background/50 border border-border/40">
                  <TabsTrigger value="all">All Transactions</TabsTrigger>
                  <TabsTrigger value="buy">Buy Orders</TabsTrigger>
                  <TabsTrigger value="sell">Sell Orders</TabsTrigger>
                  <TabsTrigger value="fees">Fees & Charges</TabsTrigger>
                </TabsList>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full md:w-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      className="pl-8 w-full md:w-[240px]"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                  </div>


                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Filter className="h-3.5 w-3.5" />
                      <span>Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleFilterChange("sortField", "date")}>
                      Date & Time {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange("sortField", "price")}>
                      Price {sortField === "price" && (sortDirection === "asc" ? "↑" : "↓")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFilterChange("sortField", "quantity")}>
                      Quantity {sortField === "quantity" && (sortDirection === "asc" ? "↑" : "↓")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleFilterChange("sortDirection", sortDirection === "asc" ? "desc" : "asc")}>
                      {sortDirection === "asc" ? "Sort Descending" : "Sort Ascending"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </Button>
              </div>
            </div>

              
            <TabsContent value="all" className="mt-0">
              <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center items-center p-24">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : paginatedTransactions.length > 0 ? (
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
                        {paginatedTransactions.map((transaction, index) => {
                          const date = new Date(transaction.time);
                          const totalValue = transaction.price * transaction.qty;
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="font-medium">
                                  {date.toLocaleDateString()}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {date.toLocaleTimeString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className={`flex items-center gap-1 ${transaction.isBuyer ? "text-green-500" : "text-red-500"}`}>
                                  {transaction.isBuyer ? (
                                    <ArrowDown className="h-3.5 w-3.5" />
                                  ) : (
                                    <ArrowUp className="h-3.5 w-3.5" />
                                  )}
                                  <span>{transaction.isBuyer ? "Buy" : "Sell"}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{transaction.symbol}</div>
                                <div className="text-xs text-muted-foreground">
                                  {transaction.symbol && transaction.symbol.includes("BTC") ? "Crypto" : "Stock"}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{transaction.qty}</TableCell>
                              <TableCell className="text-right">{formatCurrency(transaction.price)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(totalValue)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(transaction.commission || 0)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                                  Completed
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-24 text-center">
                      <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium text-lg">No transactions found</h3>
                      <p className="text-muted-foreground mt-1">
                        {searchQuery ? "Try adjusting your search filters" : "Start trading to see your transactions here"}
                      </p>
                      {searchQuery && (
                        <Button 
                          variant="outline" 
                          className="mt-4" 
                          onClick={() => setSearchQuery("")}
                        >
                          Clear Search
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
                
                {paginatedTransactions.length > 0 && (
                  <CardFooter className="flex justify-between items-center border-t border-border/40 px-6 py-4">
                   <div className="text-sm text-muted-foreground">
  Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
</div>
<div className="flex items-center gap-2">
  <Select
    value={itemsPerPage.toString()}
    onValueChange={(value) => handleFilterChange("itemsPerPage", value)}
  >
    <SelectTrigger className="w-[100px]">
      <SelectValue placeholder="10 per page" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="10">10 per page</SelectItem>
      <SelectItem value="25">25 per page</SelectItem>
      <SelectItem value="50">50 per page</SelectItem>
      <SelectItem value="100">100 per page</SelectItem>
    </SelectContent>
  </Select>
  
  <div className="flex items-center gap-1">
    <Button
      variant="outline"
      size="icon"
      onClick={() => handlePageChange(1)}
      disabled={currentPage === 1}
    >
      <ChevronLeft className="h-4 w-4" />
      <ChevronLeft className="h-4 w-4 -ml-2" />
    </Button>
    <Button
      variant="outline"
      size="icon"
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
    
    <span className="text-sm px-2">
      Page {currentPage} of {totalPages}
    </span>
    
    <Button
      variant="outline"
      size="icon"
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="icon"
      onClick={() => handlePageChange(totalPages)}
      disabled={currentPage === totalPages}
    >
      <ChevronRight className="h-4 w-4" />
      <ChevronRight className="h-4 w-4 -ml-2" />
    </Button>
  </div>
</div>
</CardFooter>
)}
</Card>
</TabsContent>

<TabsContent value="buy" className="mt-0">
  <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
    <CardContent className="p-0">
      {isLoading ? (
        <div className="flex justify-center items-center p-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : paginatedTransactions.filter(t => t.isBuyer).length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead className="text-right">Fees</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.filter(t => t.isBuyer).map((transaction, index) => {
              const date = new Date(transaction.time);
              const totalValue = transaction.price * transaction.qty;
              return (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-medium">
                      {date.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {date.toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{transaction.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.symbol && transaction.symbol.includes("BTC") ? "Crypto" : "Stock"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{transaction.qty}</TableCell>
                  <TableCell className="text-right">{formatCurrency(transaction.price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalValue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(transaction.commission || 0)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                      Completed
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center p-24 text-center">
          <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg">No buy orders found</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery ? "Try adjusting your search filters" : "Start buying to see your orders here"}
          </p>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>

<TabsContent value="sell" className="mt-0">
  <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
    <CardContent className="p-0">
      {isLoading ? (
        <div className="flex justify-center items-center p-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : paginatedTransactions.filter(t => !t.isBuyer).length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead className="text-right">Fees</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.filter(t => !t.isBuyer).map((transaction, index) => {
              const date = new Date(transaction.time);
              const totalValue = transaction.price * transaction.qty;
              return (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-medium">
                      {date.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {date.toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{transaction.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.symbol && transaction.symbol.includes("BTC") ? "Crypto" : "Stock"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{transaction.qty}</TableCell>
                  <TableCell className="text-right">{formatCurrency(transaction.price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalValue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(transaction.commission || 0)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                      Completed
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center p-24 text-center">
          <LineChart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg">No sell orders found</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery ? "Try adjusting your search filters" : "Start selling to see your orders here"}
          </p>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>

<TabsContent value="fees" className="mt-0">
  <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
    <CardHeader>
      <CardTitle>Fees & Charges</CardTitle>
      <CardDescription>Summary of all fees paid during trading activities</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Fee Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Total Trading Fees</span>
                <span className="font-medium">{formatCurrency(statsData.totalFees)}</span>
              </div>
              <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Buy Order Fees</span>
                <span className="font-medium">
                  {formatCurrency(tradesData
                    .filter(t => t.isBuyer)
                    .reduce((sum, t) => sum + (parseFloat(t.commission) || 0), 0)
                  )}
                </span>
              </div>
              <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ 
                    width: `${statsData.totalFees > 0 ? 
                      (tradesData
                        .filter(t => t.isBuyer)
                        .reduce((sum, t) => sum + (parseFloat(t.commission) || 0), 0) / 
                        statsData.totalFees) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Sell Order Fees</span>
                <span className="font-medium">
                  {formatCurrency(tradesData
                    .filter(t => !t.isBuyer)
                    .reduce((sum, t) => sum + (parseFloat(t.commission) || 0), 0)
                  )}
                </span>
              </div>
              <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500" 
                  style={{ 
                    width: `${statsData.totalFees > 0 ? 
                      (tradesData
                        .filter(t => !t.isBuyer)
                        .reduce((sum, t) => sum + (parseFloat(t.commission) || 0), 0) / 
                        statsData.totalFees) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/40">
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Fees as % of Trading Volume</span>
                <span className="font-medium">
                  {((statsData.totalFees / (statsData.buyValue + statsData.sellValue)) * 100).toFixed(4)}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Fee Breakdown by Asset</h3>
          <div className="space-y-3">
            {Object.entries(
              tradesData.reduce((acc, trade) => {
                const symbol = trade.symbol || 'Unknown';
                if (!acc[symbol]) acc[symbol] = 0;
                acc[symbol] += parseFloat(trade.commission) || 0;
                return acc;
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([symbol, fee], index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">{symbol}</span>
                    <span className="font-medium">{formatCurrency(fee)}</span>
                  </div>
                  <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                      style={{ 
                        width: `${statsData.totalFees > 0 ? 
                          (fee / statsData.totalFees) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Fee Structure</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maker Fee</span>
                <span>0.10%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taker Fee</span>
                <span>0.15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Withdrawal Fee</span>
                <span>Varies by asset</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter className="border-t border-border/40">
      <Button variant="outline" size="sm" className="gap-1">
        <Download className="h-3.5 w-3.5" />
        <span>Download Fee Report</span>
      </Button>
    </CardFooter>
  </Card>
</TabsContent>
</Tabs>
</div>
</div>

<div className="flex items-center justify-between p-4 border-t border-border/40 bg-gradient-card">
  <div className="text-xs text-muted-foreground">
  Last updated: {formattedDate}
  </div>
  <div className="flex items-center gap-2">
    {/* <Badge 
      variant="outline" 
      className={`${botStatus.running ? 
        "bg-green-500/10 text-green-500" : 
        "bg-amber-500/10 text-amber-500"}`}
    >
      <div className={`w-2 h-2 rounded-full mr-1 ${botStatus.running ? 
        "bg-green-500" : 
        "bg-amber-500"}`} />
      {botStatus.running ? "Bot Active" : "Bot Inactive"}
    </Badge> */}
    
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {/* <Button variant="outline" size="sm" className="gap-1">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Bot Settings</span>
        </Button> */}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Trading Bot Settings</AlertDialogTitle>
          <AlertDialogDescription>
            Configure your automated trading bot parameters.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm">Status</label>
            <div className="col-span-3 flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${botStatus.running ? 
                  "bg-green-500/10 text-green-500" : 
                  "bg-amber-500/10 text-amber-500"}`}
              >
                <div className={`w-2 h-2 rounded-full mr-1 ${botStatus.running ? 
                  "bg-green-500" : 
                  "bg-amber-500"}`} />
                {botStatus.running ? "Running" : "Stopped"}
              </Badge>
              <Button variant={botStatus.running ? "destructive" : "default"} size="sm">
                {botStatus.running ? "Stop Bot" : "Start Bot"}
              </Button>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm">Strategy</label>
            <Select defaultValue="gridTrading" className="col-span-3">
              <SelectTrigger>
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gridTrading">Grid Trading</SelectItem>
                <SelectItem value="dca">Dollar Cost Averaging</SelectItem>
                <SelectItem value="macd">MACD Crossover</SelectItem>
                <SelectItem value="rsi">RSI Indicator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm">Trading Pair</label>
            <Select defaultValue="BTCUSDT" className="col-span-3">
              <SelectTrigger>
                <SelectValue placeholder="Select trading pair" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                <SelectItem value="BNBUSDT">BNB/USDT</SelectItem>
                <SelectItem value="ADAUSDT">ADA/USDT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm">Budget</label>
            <Input className="col-span-3" defaultValue="1000" type="number" min="10" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm">Risk Level</label>
            <Select defaultValue="medium" className="col-span-3">
              <SelectTrigger>
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Save Changes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</div>
</div>
</Sidebar>
);
}