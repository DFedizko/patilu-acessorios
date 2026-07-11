"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { ChartTooltip } from "@/components/ui/chart/chart-tooltip";
import styles from "@/components/ui/chart/line-chart.module.css";

interface LineChartSeries {
    name: string;
    values: number[];
    stroke: string;
    colorClass: string;
    fill?: boolean;
}

interface LineChartProps {
    labels: string[];
    series: LineChartSeries[];
    formatValue?: (value: number) => string;
}

const PADDING_TOP = 18;
const PADDING_BOTTOM = 28;
const PADDING_RIGHT = 12;
const AXIS_WIDTH = 64;
const AXIS_LABEL_GAP = 8;
const POINT_INSET = 6;
const RANGE_MARGIN_RATIO = 0.15;
const X_LABEL_WIDTH = 68;
const GRID_LINES = [0, 0.25, 0.5, 0.75, 1];

const buildScale = (series: LineChartSeries[]) => {
    const all = series.flatMap((entry) => entry.values);
    const min = Math.min(...all);
    const max = Math.max(...all);
    const margin = Math.max(1, (max - min || max) * RANGE_MARGIN_RATIO);
    const low = Math.max(0, min - margin);
    const high = max + margin;
    const span = Math.max(1, high - low);
    return { low, high, span };
};

const buildGeometry = (labels: string[], series: LineChartSeries[], width: number, height: number) => {
    const { low, high, span } = buildScale(series);
    const count = labels.length;
    const plotLeft = AXIS_WIDTH + POINT_INSET;
    const plotRight = width - PADDING_RIGHT - POINT_INSET;
    const plotSpan = Math.max(1, plotRight - plotLeft);
    const top = PADDING_TOP;
    const baseline = height - PADDING_BOTTOM;
    const plotHeight = Math.max(1, baseline - top);
    const xs = labels.map((_, index) =>
        count === 1 ? plotLeft + plotSpan / 2 : plotLeft + (index * plotSpan) / (count - 1),
    );
    const toY = (value: number) => baseline - ((value - low) / span) * plotHeight;
    const lines = series.map((entry) => {
        const ys = entry.values.map(toY);
        const line = xs.map((x, index) => `${x.toFixed(1)},${ys[index].toFixed(1)}`).join(" ");
        const area = `${xs[0]},${baseline} ${line} ${xs[xs.length - 1]},${baseline}`;
        return { ys, line, area };
    });
    const axis = GRID_LINES.map((ratio) => ({ y: top + ratio * plotHeight, value: high - ratio * span }));
    const visibleColumns = Math.max(1, Math.floor(plotSpan / X_LABEL_WIDTH));
    const labelStep = Math.max(1, Math.ceil(count / visibleColumns));
    const first = labels[0] ?? "";
    const last = labels[count - 1] ?? "";
    return {
        xs,
        lines,
        axis,
        baseline,
        top,
        gridLeft: AXIS_WIDTH,
        gridRight: width - PADDING_RIGHT,
        labelStep,
        animationKey: `${count}:${first}:${last}`,
    };
};

export const LineChart = ({ labels, series, formatValue = (value) => String(value) }: LineChartProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [active, setActive] = useState<number | null>(null);
    const gradientId = useId();
    const clipId = useId();
    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;
        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setSize({ width, height });
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);
    const { width, height } = size;
    const ready = width > 0 && height > 0 && labels.length > 0;
    const { xs, lines, axis, baseline, top, gridLeft, gridRight, labelStep, animationKey } = buildGeometry(
        labels,
        series,
        width,
        height,
    );
    const activeTop = active === null ? 0 : Math.min(...lines.map((entry) => entry.ys[active]));
    const handleMove = (event: MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const nearest = xs.reduce(
            (best, candidate, index) => (Math.abs(candidate - x) < Math.abs(xs[best] - x) ? index : best),
            0,
        );
        setActive(nearest);
    };
    return (
        <div
            ref={containerRef}
            className="relative size-full"
            onMouseMove={handleMove}
            onMouseLeave={() => setActive(null)}
        >
            {ready && (
                <svg width={width} height={height} className="block">
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                        </linearGradient>
                        <clipPath id={clipId}>
                            <rect
                                key={animationKey}
                                x={0}
                                y={0}
                                width={width}
                                height={height}
                                className={styles.sweep}
                            />
                        </clipPath>
                    </defs>
                    {axis.map((tick, index) => (
                        <line
                            key={index}
                            x1={gridLeft}
                            x2={gridRight}
                            y1={tick.y}
                            y2={tick.y}
                            stroke="var(--color-border)"
                            strokeWidth={1}
                        />
                    ))}
                    {axis.map((tick, index) => (
                        <text
                            key={index}
                            x={AXIS_WIDTH - AXIS_LABEL_GAP}
                            y={tick.y}
                            textAnchor="end"
                            dominantBaseline="central"
                            fontSize={11}
                            fill="var(--color-ink-muted)"
                            className="tabular-nums"
                        >
                            {formatValue(tick.value)}
                        </text>
                    ))}
                    {labels.map((label, index) =>
                        index % labelStep === 0 || index === labels.length - 1 ? (
                            <text
                                key={index}
                                x={xs[index]}
                                y={baseline + 18}
                                textAnchor="middle"
                                fontSize={11}
                                fill="var(--color-ink-muted)"
                                className="tabular-nums"
                            >
                                {label}
                            </text>
                        ) : null,
                    )}
                    <g key={animationKey} clipPath={`url(#${clipId})`}>
                        {series.map((entry, seriesIndex) =>
                            entry.fill ? (
                                <polygon
                                    key={seriesIndex}
                                    points={lines[seriesIndex].area}
                                    fill={`url(#${gradientId})`}
                                />
                            ) : null,
                        )}
                        {series.map((entry, seriesIndex) => (
                            <polyline
                                key={seriesIndex}
                                points={lines[seriesIndex].line}
                                fill="none"
                                stroke={entry.stroke}
                                strokeWidth={3}
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                        ))}
                        {series.map((entry, seriesIndex) =>
                            xs.map((x, index) => (
                                <circle
                                    key={`${seriesIndex}-${index}`}
                                    cx={x}
                                    cy={lines[seriesIndex].ys[index]}
                                    r={active === index ? 5 : 4}
                                    fill="var(--color-surface)"
                                    stroke={entry.stroke}
                                    strokeWidth={active === index ? 3 : 2.5}
                                />
                            )),
                        )}
                    </g>
                    {active !== null && (
                        <line
                            x1={xs[active]}
                            x2={xs[active]}
                            y1={top}
                            y2={baseline}
                            stroke="var(--color-primary)"
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            opacity={0.4}
                        />
                    )}
                </svg>
            )}
            {ready && active !== null && (
                <div
                    className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+0.5rem)]"
                    style={{ left: `${xs[active]}px`, top: `${activeTop}px` }}
                >
                    <ChartTooltip
                        label={labels[active]}
                        items={series.map((entry) => ({
                            name: entry.name,
                            value: formatValue(entry.values[active]),
                            colorClass: entry.colorClass,
                        }))}
                    />
                </div>
            )}
        </div>
    );
};
