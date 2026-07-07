"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { ChartTooltip } from "@/components/ui/chart/chart-tooltip";
import styles from "@/components/ui/chart/line-chart.module.css";

interface LineChartPoint {
    label: string;
    value: number;
}

interface LineChartProps {
    points: LineChartPoint[];
    seriesName?: string;
    colorClass?: string;
    formatValue?: (value: number) => string;
}

const PADDING_X = 12;
const PADDING_Y = 18;
const RANGE_MARGIN = 8;
const GRID_LINES = [0, 0.25, 0.5, 0.75, 1];

const buildGeometry = (points: LineChartPoint[], width: number, height: number) => {
    const values = points.map((point) => point.value);
    const low = Math.max(0, Math.floor(Math.min(...values) - RANGE_MARGIN));
    const high = Math.ceil(Math.max(...values) + RANGE_MARGIN);
    const span = Math.max(1, high - low);
    const count = points.length;
    const baseline = height - PADDING_Y;
    const xs = points.map((_, index) =>
        count === 1 ? width / 2 : PADDING_X + (index * (width - 2 * PADDING_X)) / (count - 1),
    );
    const ys = values.map((value) => baseline - ((value - low) / span) * (height - 2 * PADDING_Y));
    const line = xs.map((x, index) => `${x.toFixed(1)},${ys[index].toFixed(1)}`).join(" ");
    const area = `${PADDING_X},${baseline} ${line} ${width - PADDING_X},${baseline}`;
    const first = points[0]?.label ?? "";
    const last = points[points.length - 1]?.label ?? "";
    return { xs, ys, line, area, baseline, animationKey: `${count}:${first}:${last}` };
};

export const LineChart = ({
    points,
    seriesName = "Margem",
    colorClass = "bg-primary",
    formatValue = (value) => String(value),
}: LineChartProps) => {
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
    const ready = width > 0 && height > 0 && points.length > 0;
    const { xs, ys, line, area, baseline, animationKey } = buildGeometry(points, width, height);
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
                    {GRID_LINES.map((ratio, index) => (
                        <line
                            key={index}
                            x1={PADDING_X}
                            x2={width - PADDING_X}
                            y1={PADDING_Y + ratio * (height - 2 * PADDING_Y)}
                            y2={PADDING_Y + ratio * (height - 2 * PADDING_Y)}
                            stroke="var(--color-border)"
                            strokeWidth={1}
                        />
                    ))}
                    <g key={animationKey} clipPath={`url(#${clipId})`}>
                        <polygon points={area} fill={`url(#${gradientId})`} />
                        <polyline
                            points={line}
                            fill="none"
                            stroke="var(--color-primary)"
                            strokeWidth={3}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                        {xs.map((x, index) => (
                            <circle
                                key={index}
                                cx={x}
                                cy={ys[index]}
                                r={active === index ? 5 : 4}
                                fill="var(--color-surface)"
                                stroke="var(--color-primary)"
                                strokeWidth={active === index ? 3 : 2.5}
                            />
                        ))}
                    </g>
                    {active !== null && (
                        <line
                            x1={xs[active]}
                            x2={xs[active]}
                            y1={PADDING_Y}
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
                    style={{ left: `${xs[active]}px`, top: `${ys[active]}px` }}
                >
                    <ChartTooltip
                        label={points[active].label}
                        items={[{ name: seriesName, value: formatValue(points[active].value), colorClass }]}
                    />
                </div>
            )}
        </div>
    );
};
