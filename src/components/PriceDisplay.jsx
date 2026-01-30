import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatPrice } from '../utils/formatPrice';
import './PriceDisplay.css';
import PriceSkeleton from './PriceSkeleton';

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
                {buyingRate ? (
                    <div className="price-card buy">
                        <div className="price-label">Harga Beli</div>
                        <div className="price-value">{formatPrice(buyingRate)}</div>
                        <div className="price-unit">per gram</div>
                    </div>
                ) : (
                    <PriceSkeleton />
                )}

                {sellingRate ? (
                    <div className="price-card sell">
                        <div className="price-label">Harga Jual</div>
                        <div className="price-value">{formatPrice(sellingRate)}</div>
                        <div className="price-unit">per gram</div>
                    </div>
                ) : (
                    <PriceSkeleton />
                )}
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
