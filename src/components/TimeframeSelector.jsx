import './TimeframeSelector.css';

const TimeframeSelector = ({ selected, onChange }) => {
    const timeframes = [
        { id: '1D', label: '1 Hari' },
        { id: '1W', label: '1 Minggu' },
        { id: '1M', label: '1 Bulan' },
    ];

    return (
        <div className="timeframe-selector">
            {timeframes.map((tf) => (
                <button
                    key={tf.id}
                    className={`timeframe-btn ${selected === tf.id ? 'active' : ''}`}
                    onClick={() => onChange(tf.id)}
                >
                    {tf.label}
                </button>
            ))}
        </div>
    );
};

export default TimeframeSelector;
