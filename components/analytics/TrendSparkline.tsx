/**
 * Trend Sparkline Component
 * 
 * Small inline chart showing performance trends over time.
 * 
 * @module components/analytics/TrendSparkline
 */
"use client"

import { cn } from "@/lib/utils"

interface TrendSparklineProps {
  data: number[]
  className?: string
  height?: number
  width?: number
  strokeColor?: string
  fillColor?: string
  showDots?: boolean
}

/**
 * Trend Sparkline
 * 
 * Mini line chart for showing trends inline.
 * Shows the last N data points as a simple line graph.
 * 
 * @param data - Array of numerical values
 * @param height - Chart height in pixels
 * @param width - Chart width in pixels
 * @param strokeColor - Line color
 * @param fillColor - Optional fill under line
 * @param showDots - Whether to show data point dots
 */
export function TrendSparkline({
  data,
  className,
  height = 24,
  width = 80,
  strokeColor = 'stroke-blue-500',
  fillColor,
  showDots = false
}: TrendSparklineProps) {
  if (!data || data.length < 2) {
    return (
      <div 
        className={cn("bg-slate-100 rounded", className)}
        style={{ width, height }}
      />
    )
  }

  // Calculate min/max with padding
  const minValue = Math.min(...data)
  const maxValue = Math.max(...data)
  const range = maxValue - minValue || 1
  const padding = range * 0.1

  // Generate path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - minValue + padding) / (range + padding * 2)) * height
    return { x, y, value }
  })

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  // Area path for fill
  const areaPath = fillColor
    ? `${linePath} L ${width} ${height} L 0 ${height} Z`
    : ''

  // Determine trend color
  const trend = data[data.length - 1] - data[0]
  const trendColor = trend > 0 ? 'stroke-green-500' : trend < 0 ? 'stroke-red-500' : strokeColor

  return (
    <svg
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Fill area */}
      {fillColor && (
        <path
          d={areaPath}
          className={fillColor}
          fillOpacity={0.1}
        />
      )}

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        className={trendColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data point dots */}
      {showDots && points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={2}
          className={cn(trendColor.replace('stroke-', 'fill-'))}
        />
      ))}

      {/* End point highlight */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={3}
        className={cn(trendColor.replace('stroke-', 'fill-'))}
      />
    </svg>
  )
}

/**
 * Sparkline with label
 */
export function TrendSparklineWithLabel({
  data,
  label,
  className
}: {
  data: number[]
  label: string
  className?: string
}) {
  const trend = data.length >= 2 ? data[data.length - 1] - data[0] : 0
  const trendPercent = data[0] > 0 ? (trend / data[0]) * 100 : 0

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <TrendSparkline data={data} />
      <div className="text-xs">
        <div className="text-slate-500">{label}</div>
        <div className={cn(
          "font-medium",
          trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-slate-600'
        )}>
          {trend >= 0 ? '+' : ''}{trendPercent.toFixed(1)}%
        </div>
      </div>
    </div>
  )
}

export default TrendSparkline
