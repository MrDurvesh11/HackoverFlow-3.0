"use client"

import { ArrowDown, ArrowUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface MarketOverviewProps {
  activeTab: string
}

export function MarketOverview({ activeTab }: MarketOverviewProps) {
  const stockData = [
    { name: "Apple Inc.", symbol: "AAPL", price: 187.32, change: 1.24, changePercent: 0.67 },
    { name: "Microsoft Corp.", symbol: "MSFT", price: 403.78, change: 5.43, changePercent: 1.36 },
    { name: "Amazon.com Inc.", symbol: "AMZN", price: 178.12, change: -2.34, changePercent: -1.3 },
    { name: "Tesla Inc.", symbol: "TSLA", price: 237.49, change: 12.67, changePercent: 5.63 },
    { name: "NVIDIA Corp.", symbol: "NVDA", price: 875.28, change: 15.32, changePercent: 1.78 },
  ]

  const cryptoData = [
    { name: "Bitcoin", symbol: "BTC", price: 68245.12, change: -1467.23, changePercent: -2.15 },
    { name: "Ethereum", symbol: "ETH", price: 3542.78, change: 22.14, changePercent: 0.63 },
    { name: "Binance Coin", symbol: "BNB", price: 567.32, change: 12.45, changePercent: 2.24 },
    { name: "Solana", symbol: "SOL", price: 143.87, change: -5.67, changePercent: -3.94 },
    { name: "Cardano", symbol: "ADA", price: 0.58, change: 0.02, changePercent: 3.57 },
  ]

  const renderData = () => {
    if (activeTab === "stocks") return stockData
    if (activeTab === "crypto") return cryptoData
    return [...stockData.slice(0, 3), ...cryptoData.slice(0, 2)]
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Symbol</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Change</TableHead>
          <TableHead className="text-right">Change %</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {renderData().map((item) => (
          <TableRow key={item.symbol} className="hover:bg-muted/30">
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className={cn(item.symbol === "BTC" || item.symbol === "ETH" ? "text-crypto" : "text-stock")}>
              {item.symbol}
            </TableCell>
            <TableCell className="text-right">
              {item.symbol === "BTC" || item.symbol === "ETH" ? "$" : ""}
              {item.price.toLocaleString()}
            </TableCell>
            <TableCell
              className={cn(
                "text-right flex items-center justify-end gap-1",
                item.change >= 0 ? "text-profit" : "text-loss",
              )}
            >
              {item.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(item.change).toLocaleString()}
            </TableCell>
            <TableCell className={cn("text-right", item.changePercent >= 0 ? "text-profit" : "text-loss")}>
              {item.changePercent >= 0 ? "+" : ""}
              {item.changePercent.toFixed(2)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

