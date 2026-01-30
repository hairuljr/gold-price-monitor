import './ChartSkeleton.css';

const ChartSkeleton = () => {
    return (
        <div className="chart-skeleton">
            <div className="skeleton-toolbar">
                <div className="skeleton-btn"></div>
                <div className="skeleton-btn"></div>
                <div className="skeleton-btn"></div>
            </div>
            <div className="skeleton-chart-area">
                <div className="skeleton-grid-line"></div>
                <div className="skeleton-grid-line"></div>
                <div className="skeleton-grid-line"></div>
                <div className="skeleton-pulse"></div>
            </div>
        </div>
    );
};

export default ChartSkeleton;
