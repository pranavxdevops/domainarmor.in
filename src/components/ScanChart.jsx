import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

export default function ScanChart({ scanLogs = [] }) {
    if (scanLogs.length === 0) {
        return (
            <div className="glass-card p-8 flex items-center justify-center text-surface-400">
                <p>No scan history available yet. Run your first scan!</p>
            </div>
        );
    }

    // Reverse to show oldest first
    const sortedLogs = [...scanLogs].reverse();

    const labels = sortedLogs.map((log) =>
        new Date(log.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    );

    const scores = sortedLogs.map((log) => log.score);

    const data = {
        labels,
        datasets: [
            {
                label: 'Security Score',
                data: scores,
                borderColor: '#818cf8',
                backgroundColor: 'rgba(129, 140, 248, 0.08)',
                borderWidth: 2.5,
                pointBackgroundColor: scores.map((s) =>
                    s > 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444'
                ),
                pointBorderColor: 'transparent',
                pointRadius: 5,
                pointHoverRadius: 8,
                tension: 0.35,
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#e2e8f0',
                bodyColor: '#94a3b8',
                borderColor: '#334155',
                borderWidth: 1,
                cornerRadius: 12,
                padding: 12,
                displayColors: false,
                callbacks: {
                    title: (items) => items[0].label,
                    label: (item) => `Score: ${item.parsed.y}/100`,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(51, 65, 85, 0.3)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#64748b',
                    font: { size: 11 },
                    maxTicksLimit: 8,
                },
            },
            y: {
                min: 0,
                max: 100,
                grid: {
                    color: 'rgba(51, 65, 85, 0.3)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#64748b',
                    font: { size: 11 },
                    stepSize: 20,
                },
            },
        },
    };

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-surface-100 mb-4">Score History</h3>
            <div style={{ height: '280px' }}>
                <Line data={data} options={options} />
            </div>
        </div>
    );
}
