"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

export function StockChart() {
  // Sample data for stock chart
  const data = [
    { name: "9:30", S_P: 4750, NASDAQ: 16700, DOW: 38200 },
    { name: "10:00", S_P: 4755, NASDAQ: 16720, DOW: 38220 },
    { name: "10:30", S_P: 4760, NASDAQ: 16710, DOW: 38230 },
    { name: "11:00", S_P: 4765, NASDAQ: 16715, DOW: 38240 },
    { name: "11:30", S_P: 4770, NASDAQ: 16725, DOW: 38250 },
    { name: "12:00", S_P: 4775, NASDAQ: 16730, DOW: 38260 },
    { name: "12:30", S_P: 4780, NASDAQ: 16735, DOW: 38270 },
    { name: "13:00", S_P: 4775, NASDAQ: 16730, DOW: 38265 },
    { name: "13:30", S_P: 4770, NASDAQ: 16725, DOW: 38260 },
    { name: "14:00", S_P: 4775, NASDAQ: 16730, DOW: 38265 },
    { name: "14:30", S_P: 4780, NASDAQ: 16735, DOW: 38270 },
    { name: "15:00", S_P: 4785, NASDAQ: 16740, DOW: 38275 },
    { name: "15:30", S_P: 4790, NASDAQ: 16745, DOW: 38280 },
    { name: "16:00", S_P: 4783, NASDAQ: 16742, DOW: 38275 },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorS_P" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0066FF" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorNASDAQ" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00AAFF" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#00AAFF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorDOW" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0044AA" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#0044AA" stopOpacity={0} />
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
        />
        <Area type="monotone" dataKey="S_P" stroke="#0066FF" fillOpacity={1} fill="url(#colorS_P)" name="S&P 500" />
        <Area
          type="monotone"
          dataKey="NASDAQ"
          stroke="#00AAFF"
          fillOpacity={1}
          fill="url(#colorNASDAQ)"
          name="NASDAQ"
        />
        <Area type="monotone" dataKey="DOW" stroke="#0044AA" fillOpacity={1} fill="url(#colorDOW)" name="DOW" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

