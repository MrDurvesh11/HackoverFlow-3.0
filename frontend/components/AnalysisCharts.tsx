"use client"

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, LineChart, PieChart } from 'recharts' // Install recharts package

export function RecommendationDonut({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyst Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <PieChart 
          data={[
            { name: 'Buy', value: data.buy_recommendation_percent },
            { name: 'Hold', value: data.hold_recommendation_percent },
            { name: 'Sell', value: data.sell_recommendation_percent }
          ]}
        />
      </CardContent>
    </Card>
  )
}

export function PriceRangeChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Ranges</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart
          data={[
            { 
              timeframe: '24h',
              high: data.price_ranges['24h'].high,
              low: data.price_ranges['24h'].low
            },
            {
              timeframe: '1 Week',
              high: data.price_ranges['1week'].high,
              low: data.price_ranges['1week'].low
            },
            {
              timeframe: '4 Week',
              high: data.price_ranges['4week'].high,
              low: data.price_ranges['4week'].low
            }
          ]}
        />
      </CardContent>
    </Card>
  )
}

export function VolumeChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Volume Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart
          data={data.chartData.map(item => ({
            date: item.date,
            volume: item.volume
          }))}
        />
      </CardContent>
    </Card>
  )
}