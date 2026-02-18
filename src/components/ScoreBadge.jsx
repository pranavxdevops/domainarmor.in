export default function ScoreBadge({ score, size = 'md' }) {
    if (score === null || score === undefined) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold bg-surface-700/50 text-surface-400 border border-surface-600/30 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-surface-500" />
                N/A
            </span>
        );
    }

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    if (score > 80) {
        return (
            <span className={`badge-healthy ${sizeClasses[size]}`}>
                <span className="status-dot status-dot-healthy" />
                {score}
            </span>
        );
    }

    if (score >= 60) {
        return (
            <span className={`badge-warning ${sizeClasses[size]}`}>
                <span className="status-dot status-dot-warning" />
                {score}
            </span>
        );
    }

    return (
        <span className={`badge-critical ${sizeClasses[size]}`}>
            <span className="status-dot status-dot-critical" />
            {score}
        </span>
    );
}
