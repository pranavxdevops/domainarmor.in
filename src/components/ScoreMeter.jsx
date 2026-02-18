import { useEffect, useState } from 'react';

export default function ScoreMeter({ score, size = 200 }) {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score ?? 0), 100);
        return () => clearTimeout(timer);
    }, [score]);

    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    const getColor = () => {
        if (animatedScore > 80) return { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' };
        if (animatedScore >= 60) return { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' };
        return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' };
    };

    const getLabel = () => {
        if (animatedScore > 80) return 'Healthy';
        if (animatedScore >= 60) return 'Warning';
        return 'Critical';
    };

    const color = getColor();

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="10"
                />
                {/* Score ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color.stroke}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                        transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease',
                        filter: `drop-shadow(0 0 8px ${color.glow})`,
                    }}
                />
            </svg>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                    className="text-4xl font-bold transition-colors duration-500"
                    style={{ color: color.stroke }}
                >
                    {score ?? '—'}
                </span>
                <span className="text-sm text-surface-400 mt-1">{score !== null ? getLabel() : 'No Data'}</span>
            </div>
        </div>
    );
}
