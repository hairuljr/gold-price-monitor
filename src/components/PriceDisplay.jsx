import { formatPrice } from '../utils/formatPrice';
import './PriceDisplay.css';

function PriceDisplay({ priceData, isConnected }) {
    const { buyingRate, sellingRate, lastUpdated } = priceData;

    return (
        <div className="price-display">
            <div className="price-header">
                <h2>Harga Emas Treasury</h2>
                <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                    <span className="status-dot"></span>
                    {isConnected ? 'Live' : 'Connecting...'}
                </div>
            </div>

            <div className="price-cards">
                <div className="price-card buy">
                    <div className="price-label">Harga Beli</div>
                    <div className="price-value">
                        {buyingRate ? formatPrice(buyingRate) : '-'}
                    </div>
                    <div className="price-unit">per gram</div>
                </div>

                <div className="price-card sell">
                    <div className="price-label">Harga Jual</div>
                    <div className="price-value">
                        {sellingRate ? formatPrice(sellingRate) : '-'}
                    </div>
                    <div className="price-unit">per gram</div>
                </div>
            </div>

            {lastUpdated && (
                <div className="last-updated">
                    Terakhir update: {lastUpdated.toLocaleTimeString('id-ID')}
                </div>
            )}
        </div>
    );
}

export default PriceDisplay;
