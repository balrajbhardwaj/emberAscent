// VisualExplanation.tsx
// Reusable component that renders different visual explanation types

import React from 'react';

// Type definitions for visual explanation specs
interface SVGInlineSpec {
  type: 'svg_inline';
  svg_code: string;
  alt_text: string;
  caption?: string;
}

interface NumberLineSpec {
  type: 'number_line';
  spec: {
    min: number;
    max: number;
    start_point?: number;
    jumps?: Array<{ from: number; to: number; label: string; color: string }>;
    markers?: Array<{ value: number; label: string; color: string }>;
  };
  alt_text: string;
  caption?: string;
}

interface FractionSpec {
  type: 'fraction_visual';
  spec: {
    numerator: number;
    denominator: number;
    shaded_color?: string;
    unshaded_color?: string;
  };
  alt_text: string;
  caption?: string;
}

interface ChartSpec {
  type: 'chart_spec';
  chart_library: 'recharts' | 'chartjs';
  spec: {
    type: 'bar' | 'line' | 'pie';
    data: Array<Record<string, unknown>>;
    xKey: string;
    yKey: string;
    title?: string;
  };
  alt_text: string;
  caption?: string;
}

interface GeometrySpec {
  type: 'geometry';
  spec: {
    shape: 'triangle' | 'rectangle' | 'circle' | 'polygon';
    vertices?: Array<{ x: number; y: number; label: string }>;
    angles?: Array<{ vertex: string; value: string; unknown: boolean }>;
  };
  alt_text: string;
  caption?: string;
}

type VisualSpec = SVGInlineSpec | NumberLineSpec | FractionSpec | ChartSpec | GeometrySpec;

// Main component
export function VisualExplanation({ visual }: { visual: VisualSpec }) {
  return (
    <div className="visual-explanation my-4 p-4 bg-slate-50 rounded-lg">
      <div className="visual-container" role="img" aria-label={visual.alt_text}>
        {renderVisual(visual)}
      </div>
      {visual.caption && (
        <p className="caption text-sm text-slate-600 mt-2 text-center italic">
          {visual.caption}
        </p>
      )}
    </div>
  );
}

function renderVisual(visual: VisualSpec): React.ReactNode {
  switch (visual.type) {
    case 'svg_inline':
      return <SVGInline svg={visual.svg_code} />;
    case 'number_line':
      return <NumberLine spec={visual.spec} />;
    case 'fraction_visual':
      return <FractionVisual spec={visual.spec} />;
    case 'chart_spec':
      return <ChartVisual spec={visual.spec} />;
    case 'geometry':
      return <GeometryVisual spec={visual.spec} />;
    default:
      return <p>Visual not available</p>;
  }
}

// Sub-components for each visual type

function SVGInline({ svg }: { svg: string }) {
  // Sanitize SVG before rendering (use DOMPurify in production)
  return (
    <div 
      className="svg-container flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
}

function NumberLine({ spec }: { spec: NumberLineSpec['spec'] }) {
  const { min, max, start_point, jumps, markers } = spec;
  const range = max - min;
  const width = 400;
  const height = 80;
  const padding = 20;
  const lineY = 50;
  
  const xScale = (value: number) => 
    padding + ((value - min) / range) * (width - 2 * padding);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md mx-auto">
      {/* Main line */}
      <line 
        x1={padding} y1={lineY} 
        x2={width - padding} y2={lineY} 
        stroke="#374151" strokeWidth="2"
      />
      
      {/* Tick marks and labels */}
      {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(value => (
        <g key={value}>
          <line 
            x1={xScale(value)} y1={lineY - 5} 
            x2={xScale(value)} y2={lineY + 5} 
            stroke="#374151" strokeWidth="1"
          />
          <text 
            x={xScale(value)} y={lineY + 20} 
            textAnchor="middle" fontSize="12" fill="#374151"
          >
            {value}
          </text>
        </g>
      ))}
      
      {/* Jump arcs */}
      {jumps?.map((jump, i) => {
        const x1 = xScale(jump.from);
        const x2 = xScale(jump.to);
        const midX = (x1 + x2) / 2;
        const arcHeight = Math.abs(x2 - x1) * 0.3;
        
        return (
          <g key={i}>
            <path 
              d={`M ${x1} ${lineY} Q ${midX} ${lineY - arcHeight} ${x2} ${lineY}`}
              fill="none" stroke={jump.color} strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
            <text 
              x={midX} y={lineY - arcHeight - 5} 
              textAnchor="middle" fontSize="12" fill={jump.color} fontWeight="bold"
            >
              {jump.label}
            </text>
          </g>
        );
      })}
      
      {/* Markers */}
      {markers?.map((marker, i) => (
        <circle 
          key={i}
          cx={xScale(marker.value)} cy={lineY} r="6"
          fill={marker.color}
        />
      ))}
      
      {/* Arrow marker definition */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" 
          refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#22C55E" />
        </marker>
      </defs>
    </svg>
  );
}

function FractionVisual({ spec }: { spec: FractionSpec['spec'] }) {
  const { numerator, denominator, shaded_color = '#3B82F6', unshaded_color = '#E5E7EB' } = spec;
  const width = 300;
  const height = 50;
  const partWidth = width / denominator;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-sm mx-auto">
      {Array.from({ length: denominator }, (_, i) => (
        <rect
          key={i}
          x={i * partWidth}
          y={0}
          width={partWidth}
          height={height}
          fill={i < numerator ? shaded_color : unshaded_color}
          stroke="#374151"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

function ChartVisual({ spec }: { spec: ChartSpec['spec'] }) {
  // In production, use actual Recharts components
  // This is a simplified SVG bar chart
  const { data, xKey, yKey, title } = spec;
  const maxValue = Math.max(...data.map(d => d[yKey] as number));
  const width = 300;
  const height = 200;
  const barWidth = width / data.length - 10;

  return (
    <div className="chart-container">
      {title && <h4 className="text-center font-medium mb-2">{title}</h4>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-sm mx-auto">
        {data.map((item, i) => {
          const value = item[yKey] as number;
          const barHeight = (value / maxValue) * (height - 40);
          const x = i * (barWidth + 10) + 5;
          const y = height - barHeight - 30;
          
          return (
            <g key={i}>
              <rect
                x={x} y={y}
                width={barWidth} height={barHeight}
                fill="#3B82F6"
                rx="2"
              />
              <text 
                x={x + barWidth/2} y={height - 10}
                textAnchor="middle" fontSize="10"
              >
                {item[xKey] as string}
              </text>
              <text 
                x={x + barWidth/2} y={y - 5}
                textAnchor="middle" fontSize="10" fontWeight="bold"
              >
                {value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function GeometryVisual({ spec }: { spec: GeometrySpec['spec'] }) {
  const { vertices, angles } = spec;
  
  if (!vertices || vertices.length < 3) {
    return <p>Invalid geometry specification</p>;
  }

  const points = vertices.map(v => `${v.x},${v.y}`).join(' ');

  return (
    <svg viewBox="0 0 200 180" className="w-full max-w-xs mx-auto">
      {/* Shape */}
      <polygon 
        points={points}
        fill="none" stroke="#374151" strokeWidth="2"
      />
      
      {/* Vertex labels */}
      {vertices.map((v, i) => (
        <text 
          key={i}
          x={v.x} y={v.y - 10}
          textAnchor="middle" fontSize="14" fontWeight="bold"
        >
          {v.label}
        </text>
      ))}
      
      {/* Angle labels */}
      {angles?.map((angle, i) => {
        const vertex = vertices.find(v => v.label === angle.vertex);
        if (!vertex) return null;
        
        // Offset angle label inside the shape
        const offsetX = vertex.x < 100 ? 15 : -15;
        const offsetY = vertex.y < 100 ? 25 : -5;
        
        return (
          <text
            key={i}
            x={vertex.x + offsetX}
            y={vertex.y + offsetY}
            fontSize="12"
            fill={angle.unknown ? '#EF4444' : '#374151'}
            fontWeight={angle.unknown ? 'bold' : 'normal'}
          >
            {angle.value}
          </text>
        );
      })}
    </svg>
  );
}

// Export all components
export { NumberLine, FractionVisual, ChartVisual, GeometryVisual, SVGInline };
