import './PriceSkeleton.css';

const PriceSkeleton = () => {
    return (
        <div className="price-skeleton-card">
            <div className="skeleton-label"></div>
            <div className="skeleton-value"></div>
            <div className="skeleton-unit"></div>
            <div className="skeleton-shimmer"></div>
        </div>
    );
};

export default PriceSkeleton;
