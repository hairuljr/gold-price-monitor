import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatPrice } from '../utils/formatPrice';

const PriceChart = ({ data, loading, error, timeframe }) => {
    if (loading) {
        return (
            <div className="chart-loading">
                <div className="loading-spinner"></div>
                <p>Memuat grafik harga...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="chart-error">
                <p>Gagal memuat grafik: {error}</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="chart-empty">
                <p>Tidak ada data harga untuk ditampilkan.</p>
            </div>
        );
    }

    // Helper to format X-axis date based on timeframe
    const formatXAxis = (tickItem) => {
        // Input format: "30/01/26 - 17:00"
        if (!tickItem) return '';
        const [datePart, timePart] = tickItem.split(' - ');

        if (timeframe === '1D') {
            return timePart; // Show only time for 1 day view
        } else {
            // Show date (and maybe month) for longer views
            // datePart is "dd/mm/yy" -> take just dd/mm
            const [day, month] = datePart.split('/');
            return `${day}/${month}`;
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    <p className="tooltip-price buy">
                        Beli: {formatPrice(payload[0].value)}
                    </p>
                    <p className="tooltip-price sell">
                        Jual: {formatPrice(payload[1].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="price-chart-container">
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4bc0c0" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#4bc0c0" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSell" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff6384" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ff6384" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatXAxis}
                        stroke="rgba(255,255,255,0.5)"
                        tick={{ fontSize: 12 }}
                        minTickGap={30}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        stroke="rgba(255,255,255,0.5)"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}jt`}
                        width={40}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="buy"
                        name="Harga Beli"
                        stroke="#4bc0c0"
                        fillOpacity={1}
                        fill="url(#colorBuy)"
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="sell"
                        name="Harga Jual"
                        stroke="#ff6384"
                        fillOpacity={1}
                        fill="url(#colorSell)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PriceChart;
