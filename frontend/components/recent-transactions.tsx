"use client"

import { ArrowDown, ArrowUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function RecentTransactions() {
  const transactions = [
    {
      date: "Mar 20, 2025",
      time: "10:45 AM",
      type: "buy",
      asset: "AAPL",
      assetType: "Stock",
      quantity: 53,
      price: 187.32,
      total: 9927.96,
    },
    {
      date: "Mar 20, 2025",
      time: "09:32 AM",
      type: "sell",
      asset: "ETH",
      assetType: "Crypto",
      quantity: 4.2,
      price: 3542.78,
      total: 14879.68,
    },
    {
      date: "Mar 19, 2025",
      time: "03:15 PM",
      type: "buy",
      asset: "ETH",
      assetType: "Crypto",
      quantity: 4.2,
      price: 3510.45,
      total: 14743.89,
    },
    {
      date: "Mar 19, 2025",
      time: "01:45 PM",
      type: "sell",
      asset: "MSFT",
      assetType: "Stock",
      quantity: 25,
      price: 403.78,
      total: 10094.5,
    },
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date & Time</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Asset</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Total Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction, index) => (
          <TableRow key={index} className="hover:bg-muted/30">
            <TableCell>
              <div className="font-medium">{transaction.date}</div>
              <div className="text-xs text-muted-foreground">{transaction.time}</div>
            </TableCell>
            <TableCell>
              <div
                className={`flex items-center gap-1 ${transaction.type === "buy" ? "text-green-500" : "text-red-500"}`}
              >
                {transaction.type === "buy" ? (
                  <ArrowDown className="h-3.5 w-3.5" />
                ) : (
                  <ArrowUp className="h-3.5 w-3.5" />
                )}
                <span>{transaction.type === "buy" ? "Buy" : "Sell"}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="font-medium">{transaction.asset}</div>
              <div className="text-xs text-muted-foreground">{transaction.assetType}</div>
            </TableCell>
            <TableCell className="text-right">
              {transaction.assetType === "Crypto" ? transaction.quantity : transaction.quantity.toLocaleString()}
            </TableCell>
            <TableCell className="text-right">${transaction.price.toLocaleString()}</TableCell>
            <TableCell className="text-right">${transaction.total.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

