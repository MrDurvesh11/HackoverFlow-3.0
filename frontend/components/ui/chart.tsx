"use client"

import type React from "react"
import {
  Area as RechartsArea,
  AreaChart as RechartsAreaChart,
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  CartesianGrid as RechartsCartesianGrid,
  Cell as RechartsCell,
  ComposedChart as RechartsComposedChart,
  Legend as RechartsLegend,
  Line as RechartsLine,
  LineChart as RechartsLineChart,
  Pie as RechartsPie,
  PieChart as RechartsPieChart,
  PolarAngleAxis as RechartsPolarAngleAxis,
  PolarGrid as RechartsPolarGrid,
  PolarRadiusAxis as RechartsPolarRadiusAxis,
  RadarChart as RechartsRadarChart,
  RadialBar as RechartsRadialBar,
  RadialBarChart as RechartsRadialBarChart,
  Rectangle as RechartsRectangle,
  ReferenceLine as RechartsReferenceLine,
  ResponsiveContainer as RechartsResponsiveContainer,
  Scatter as RechartsScatter,
  ScatterChart as RechartsScatterChart,
  Sector as RechartsSector,
  Tooltip as RechartsTooltip,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from "recharts"

// Wrapper components with proper types
export const Area = RechartsArea
export const AreaChart = RechartsAreaChart
export const Bar = RechartsBar
export const BarChart = RechartsBarChart
export const CartesianGrid = RechartsCartesianGrid
export const Cell = RechartsCell
export const ComposedChart = RechartsComposedChart
export const Legend = RechartsLegend
export const Line = RechartsLine
export const LineChart = RechartsLineChart
export const Pie = RechartsPie
export const PieChart = RechartsPieChart
export const PolarAngleAxis = RechartsPolarAngleAxis
export const PolarGrid = RechartsPolarGrid
export const PolarRadiusAxis = RechartsPolarRadiusAxis
export const RadarChart = RechartsRadarChart
export const RadialBar = RechartsRadialBar
export const RadialBarChart = RechartsRadialBarChart
export const Rectangle = RechartsRectangle
export const ReferenceLine = RechartsReferenceLine
export const ResponsiveContainer = RechartsResponsiveContainer
export const Scatter = RechartsScatter
export const ScatterChart = RechartsScatterChart
export const Sector = RechartsSector
export const Tooltip = RechartsTooltip
export const XAxis = RechartsXAxis
export const YAxis = RechartsYAxis

// Custom tooltip component
export const ChartTooltip = ({
  active,
  payload,
  label,
  className,
  formatter,
  labelFormatter,
  contentStyle,
  itemStyle,
  labelStyle,
  wrapperStyle,
  cursor = true,
}: {
  active?: boolean
  payload?: any[]
  label?: string
  className?: string
  formatter?: (value: number, name: string, props: any) => React.ReactNode
  labelFormatter?: (label: string) => React.ReactNode
  contentStyle?: React.CSSProperties
  itemStyle?: React.CSSProperties
  labelStyle?: React.CSSProperties
  wrapperStyle?: React.CSSProperties
  cursor?: boolean | React.ReactNode
}) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className={`rounded-lg border bg-background p-2 shadow-md ${className}`} style={wrapperStyle}>
      <div className="text-xs font-medium" style={labelStyle}>
        {labelFormatter ? labelFormatter(label || "") : label}
      </div>
      <div className="mt-1 space-y-0.5" style={contentStyle}>
        {payload.map((item, index) => (
          <div
            key={`item-${index}`}
            className="flex items-center text-xs"
            style={{
              color: item.color,
              ...itemStyle,
            }}
          >
            <div className="mr-1 h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{item.name}: </span>
            <span className="ml-1 font-medium">{formatter ? formatter(item.value, item.name, item) : item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

