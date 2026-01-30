import { useState, useEffect, useCallback, useRef } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import usePusher from './hooks/usePusher';
import useNotification from './hooks/useNotification';
import PriceDisplay from './components/PriceDisplay';
import AlertSettings from './components/AlertSettings';
import { formatPrice } from './utils/formatPrice';
import './App.css';

function AppContent() {
  const { priceData, isConnected, error } = usePusher();
  const { permission, requestPermission, sendNotification } = useNotification();
  const [alerts, setAlerts] = useState(null);

  // Track last notification time to avoid spamming
  const lastNotificationRef = useRef({
    buy: 0,
    sell: 0,
  });

  const NOTIFICATION_COOLDOWN = 60000; // 1 minute cooldown between same type notifications

  // Check alerts and trigger notifications
  useEffect(() => {
    if (!alerts || !priceData.buyingRate || !priceData.sellingRate) {
      return;
    }

    const now = Date.now();

    // Check buy alert (price dropped to target)
    if (
      alerts.buyEnabled &&
      alerts.buyTarget &&
      priceData.buyingRate <= alerts.buyTarget &&
      now - lastNotificationRef.current.buy > NOTIFICATION_COOLDOWN
    ) {
      sendNotification('📉 Harga Emas Turun!', {
        body: `Harga beli sekarang ${formatPrice(priceData.buyingRate)}/gram\nTarget Anda: ${formatPrice(alerts.buyTarget)}`,
        tag: 'treasury-buy-alert',
      });
      lastNotificationRef.current.buy = now;
    }

    // Check sell alert (price rose to target)
    if (
      alerts.sellEnabled &&
      alerts.sellTarget &&
      priceData.sellingRate >= alerts.sellTarget &&
      now - lastNotificationRef.current.sell > NOTIFICATION_COOLDOWN
    ) {
      sendNotification('📈 Harga Emas Naik!', {
        body: `Harga jual sekarang ${formatPrice(priceData.sellingRate)}/gram\nTarget Anda: ${formatPrice(alerts.sellTarget)}`,
        tag: 'treasury-sell-alert',
      });
      lastNotificationRef.current.sell = now;
    }
  }, [priceData, alerts, sendNotification]);

  const handleAlertChange = useCallback((newAlerts) => {
    setAlerts(newAlerts);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">🪙</span>
          <h1>Gold Price Monitor</h1>
        </div>
        <p className="tagline">Real-time gold prices from Treasury.id</p>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            ⚠️ Connection error: {error}
          </div>
        )}

        <PriceDisplay
          priceData={priceData}
          isConnected={isConnected}
        />

        <AlertSettings
          currentBuyPrice={priceData.buyingRate}
          currentSellPrice={priceData.sellingRate}
          permission={permission}
          onRequestPermission={requestPermission}
          onAlertChange={handleAlertChange}
        />
      </main>

      <footer className="app-footer">
        <p>
          Data sourced from <a href="https://treasury.id" target="_blank" rel="noopener noreferrer">treasury.id</a>
        </p>
        <p className="disclaimer">
          This is an unofficial monitoring tool. Not affiliated with Treasury.
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
