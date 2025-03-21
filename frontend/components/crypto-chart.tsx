"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

export function CryptoChart() {
  // Sample data for crypto chart
  const data = [
    { name: "00:00", BTC: 69500, ETH: 3520, BNB: 560 },
    { name: "02:00", BTC: 69300, ETH: 3510, BNB: 558 },
    { name: "04:00", BTC: 69100, ETH: 3505, BNB: 555 },
    { name: "06:00", BTC: 68900, ETH: 3500, BNB: 553 },
    { name: "08:00", BTC: 68700, ETH: 3510, BNB: 555 },
    { name: "10:00", BTC: 68500, ETH: 3520, BNB: 558 },
    { name: "12:00", BTC: 68300, ETH: 3530, BNB: 560 },
    { name: "14:00", BTC: 68100, ETH: 3535, BNB: 562 },
    { name: "16:00", BTC: 68000, ETH: 3540, BNB: 565 },
    { name: "18:00", BTC: 68200, ETH: 3545, BNB: 567 },
    { name: "20:00", BTC: 68300, ETH: 3543, BNB: 566 },
    { name: "22:00", BTC: 68245, ETH: 3542, BNB: 567 },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBTC" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8A2BE2" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8A2BE2" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorETH" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9370DB" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#9370DB" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorBNB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6A5ACD" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#6A5ACD" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
        />
        <YAxis
          tick={{ fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(20, 20, 25, 0.9)",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
          }}
          itemStyle={{ color: "#fff" }}
          labelStyle={{ color: "rgba(255, 255, 255, 0.7)" }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
        />
        <Area type="monotone" dataKey="BTC" stroke="#8A2BE2" fillOpacity={1} fill="url(#colorBTC)" name="Bitcoin" />
        <Area type="monotone" dataKey="ETH" stroke="#9370DB" fillOpacity={1} fill="url(#colorETH)" name="Ethereum" />
        <Area
          type="monotone"
          dataKey="BNB"
          stroke="#6A5ACD"
          fillOpacity={1}
          fill="url(#colorBNB)"
          name="Binance Coin"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

