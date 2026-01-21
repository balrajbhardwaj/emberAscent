/**
 * Analytics Components Index
 * 
 * Export all analytics components for easy importing.
 * 
 * @module components/analytics
 */

// Main dashboard
export { AnalyticsDashboard, default as AnalyticsDashboardDefault } from './AnalyticsDashboard'
export { AnalyticsPreview, default as AnalyticsPreviewDefault } from './AnalyticsPreview'
export { AnalyticsSkeleton, default as AnalyticsSkeletonDefault } from './AnalyticsSkeleton'

// Main visualizations
export { WeaknessHeatmap, default as WeaknessHeatmapDefault } from './WeaknessHeatmap'
export { ReadinessScore, default as ReadinessScoreDefault } from './ReadinessScore'
export { GrowthChart, default as GrowthChartDefault } from './GrowthChart'

// Data tables
export { KeyMetricsRow, default as KeyMetricsRowDefault } from './KeyMetricsRow'
export { PerformanceTables, default as PerformanceTablesDefault } from './PerformanceTables'

// Study planning
export { StudyRecommendations, default as StudyRecommendationsDefault } from './StudyRecommendations'
export { StudyPlanDisplay, default as StudyPlanDisplayDefault } from './StudyPlan'

// Premium features
export { BenchmarkingCard, default as BenchmarkingCardDefault } from './BenchmarkingCard'
export { FeatureComparison, default as FeatureComparisonDefault } from './FeatureComparison'
export { UpgradePrompt, default as UpgradePromptDefault } from './UpgradePrompt'

// Supporting components
export { HeatmapCell, default as HeatmapCellDefault } from './HeatmapCell'
export { HeatmapLegend, HeatmapLegendDetailed } from './HeatmapLegend'
export { ScoreGauge, ScoreGaugeMini } from './ScoreGauge'
export { TrendSparkline, TrendSparklineWithLabel } from './TrendSparkline'
