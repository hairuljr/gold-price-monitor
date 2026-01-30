import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatPrice } from '../utils/formatPrice';
import './PriceDisplay.css';

function PriceDisplay({ priceData, isConnected }) {
    const { buyingRate, sellingRate, lastUpdated } = priceData;
    const hasData = buyingRate && sellingRate;

    // Show "Live" only if we are connected AND have valid price data
    const isLive = isConnected && priceData.buyingRate !== null && priceData.sellingRate !== null;

    // Status text
    const statusText = isLive ? 'Live Updates' : 'Connecting...';
    const statusClass = isLive ? 'status-live' : 'status-connecting';

    return (
        <div className="price-display">
            <div className="price-header">
                <h2>Harga Emas Saat Ini</h2>
                <div className={`connection-status ${statusClass}`}>
                    <div className="status-dot"></div>
                    {statusText}
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
                    Terakhir update: {format(lastUpdated, 'd MMM yyyy, HH:mm:ss', { locale: id })} WIB
                </div>
            )}
        </div>
    );
}

export default PriceDisplay;
