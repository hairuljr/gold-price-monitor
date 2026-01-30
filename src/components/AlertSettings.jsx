import { useState, useEffect } from 'react';
import { formatPriceInput, parsePriceInput, formatPrice } from '../utils/formatPrice';
import './AlertSettings.css';

const STORAGE_KEY = 'treasury-gold-alerts';

function AlertSettings({
    currentBuyPrice,
    currentSellPrice,
    permission,
    onRequestPermission,
    onAlertChange
}) {
    const [alerts, setAlerts] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return getDefaultAlerts();
            }
        }
        return getDefaultAlerts();
    });

    const [buyInput, setBuyInput] = useState('');
    const [sellInput, setSellInput] = useState('');

    // Initialize inputs from saved alerts
    useEffect(() => {
        if (alerts.buyTarget) {
            setBuyInput(formatPriceInput(alerts.buyTarget));
        }
        if (alerts.sellTarget) {
            setSellInput(formatPriceInput(alerts.sellTarget));
        }
    }, []);

    // Save to localStorage whenever alerts change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
        onAlertChange?.(alerts);
    }, [alerts, onAlertChange]);

    const handleBuyTargetChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
        const formatted = formatPriceInput(rawValue);
        setBuyInput(formatted);
        const parsed = parsePriceInput(rawValue);
        setAlerts(prev => ({ ...prev, buyTarget: parsed }));
    };

    const handleSellTargetChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
        const formatted = formatPriceInput(rawValue);
        setSellInput(formatted);
        const parsed = parsePriceInput(rawValue);
        setAlerts(prev => ({ ...prev, sellTarget: parsed }));
    };

    const handleBuyPaste = (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const rawValue = pastedText.replace(/\D/g, ''); // Extract only digits
        const formatted = formatPriceInput(rawValue);
        setBuyInput(formatted);
        const parsed = parsePriceInput(rawValue);
        setAlerts(prev => ({ ...prev, buyTarget: parsed }));
    };

    const handleSellPaste = (e) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const rawValue = pastedText.replace(/\D/g, ''); // Extract only digits
        const formatted = formatPriceInput(rawValue);
        setSellInput(formatted);
        const parsed = parsePriceInput(rawValue);
        setAlerts(prev => ({ ...prev, sellTarget: parsed }));
    };

    const toggleBuyAlert = () => {
        setAlerts(prev => ({ ...prev, buyEnabled: !prev.buyEnabled }));
    };

    const toggleSellAlert = () => {
        setAlerts(prev => ({ ...prev, sellEnabled: !prev.sellEnabled }));
    };

    const needsPermission = permission !== 'granted';

    return (
        <div className="alert-settings">
            <h2>🔔 Pengaturan Notifikasi</h2>

            {needsPermission && (
                <div className="permission-banner">
                    <p>Aktifkan notifikasi untuk menerima alert harga emas</p>
                    <button onClick={onRequestPermission} className="btn-enable">
                        Aktifkan Notifikasi
                    </button>
                </div>
            )}

            <div className="alert-cards">
                {/* Buy Alert - Alert when price goes DOWN to target */}
                <div className={`alert-card ${alerts.buyEnabled ? 'active' : ''}`}>
                    <div className="alert-header">
                        <div className="alert-info">
                            <span className="alert-icon">📉</span>
                            <div>
                                <h3>Alert Harga Turun</h3>
                                <p>Notifikasi saat harga beli ≤ target</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={alerts.buyEnabled}
                                onChange={toggleBuyAlert}
                                disabled={needsPermission}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="alert-input-group">
                        <label>Target Harga Beli:</label>
                        <div className="input-wrapper">
                            <span className="currency">Rp</span>
                            <input
                                type="text"
                                value={buyInput}
                                onChange={handleBuyTargetChange}
                                onPaste={handleBuyPaste}
                                placeholder="Contoh: 2.800.000"
                                disabled={needsPermission || !alerts.buyEnabled}
                            />
                        </div>
                        {currentBuyPrice && alerts.buyTarget && (
                            <div className="price-comparison">
                                Harga saat ini: {formatPrice(currentBuyPrice)}
                                {currentBuyPrice <= alerts.buyTarget ? (
                                    <span className="badge triggered">Target tercapai!</span>
                                ) : (
                                    <span className="badge waiting">
                                        Tunggu turun {formatPrice(currentBuyPrice - alerts.buyTarget)}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sell Alert - Alert when price goes UP to target */}
                <div className={`alert-card ${alerts.sellEnabled ? 'active' : ''}`}>
                    <div className="alert-header">
                        <div className="alert-info">
                            <span className="alert-icon">📈</span>
                            <div>
                                <h3>Alert Harga Naik</h3>
                                <p>Notifikasi saat harga jual ≥ target</p>
                            </div>
                        </div>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                checked={alerts.sellEnabled}
                                onChange={toggleSellAlert}
                                disabled={needsPermission}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="alert-input-group">
                        <label>Target Harga Jual:</label>
                        <div className="input-wrapper">
                            <span className="currency">Rp</span>
                            <input
                                type="text"
                                value={sellInput}
                                onChange={handleSellTargetChange}
                                onPaste={handleSellPaste}
                                placeholder="Contoh: 2.900.000"
                                disabled={needsPermission || !alerts.sellEnabled}
                            />
                        </div>
                        {currentSellPrice && alerts.sellTarget && (
                            <div className="price-comparison">
                                Harga saat ini: {formatPrice(currentSellPrice)}
                                {currentSellPrice >= alerts.sellTarget ? (
                                    <span className="badge triggered">Target tercapai!</span>
                                ) : (
                                    <span className="badge waiting">
                                        Tunggu naik {formatPrice(alerts.sellTarget - currentSellPrice)}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function getDefaultAlerts() {
    return {
        buyTarget: null,
        buyEnabled: false,
        sellTarget: null,
        sellEnabled: false,
    };
}

export default AlertSettings;
