"use client"

import { ArrowDown, ArrowUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface TopPerformersProps {
  type: "stocks" | "crypto"
}

export function TopPerformers({ type }: TopPerformersProps) {
  const stockData = [
    { name: "NVIDIA Corp.", symbol: "NVDA", price: 875.28, change: 5.63, volume: "32.4M" },
    { name: "Tesla Inc.", symbol: "TSLA", price: 237.49, change: 4.21, volume: "28.7M" },
    { name: "Microsoft Corp.", symbol: "MSFT", price: 403.78, change: 1.36, volume: "18.2M" },
    { name: "Apple Inc.", symbol: "AAPL", price: 187.32, change: 0.67, volume: "42.1M" },
    { name: "Amazon.com Inc.", symbol: "AMZN", price: 178.12, change: -1.3, volume: "24.5M" },
  ]

  const cryptoData = [
    { name: "Solana", symbol: "SOL", price: 143.87, change: 8.45, volume: "$2.8B" },
    { name: "Cardano", symbol: "ADA", price: 0.58, change: 3.57, volume: "$1.2B" },
    { name: "Binance Coin", symbol: "BNB", price: 567.32, change: 2.24, volume: "$1.5B" },
    { name: "Ethereum", symbol: "ETH", price: 3542.78, change: 0.63, volume: "$12.4B" },
    { name: "Bitcoin", symbol: "BTC", price: 68245.12, change: -2.15, volume: "$28.7B" },
  ]

  const data = type === "stocks" ? stockData : cryptoData

  return (
    <Card className="bg-gradient-card border-border/40 hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle>{type === "stocks" ? "Top Stock Performers" : "Top Crypto Performers"}</CardTitle>
        <CardDescription>Today's best performing assets</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead className="text-right">Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.symbol} className="hover:bg-muted/30">
                <TableCell className="font-medium">{item.symbol}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell className="text-right">
                  {type === "crypto" ? "$" : ""}
                  {item.price.toLocaleString()}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right flex items-center justify-end gap-1",
                    item.change >= 0 ? "text-profit" : "text-loss",
                  )}
                >
                  {item.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {Math.abs(item.change).toFixed(2)}%
                </TableCell>
                <TableCell className="text-right">{item.volume}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

