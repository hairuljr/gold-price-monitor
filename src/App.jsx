import { useState, useEffect, useCallback, useRef } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import usePusher from './hooks/usePusher';
import useNotification from './hooks/useNotification';
import { useHistoricalPrices } from './hooks/useHistoricalPrices';
import PriceDisplay from './components/PriceDisplay';
import AlertSettings from './components/AlertSettings';
import TimeframeSelector from './components/TimeframeSelector';
import PriceChart from './components/PriceChart';
import { formatPrice } from './utils/formatPrice';
import './App.css';

function AppContent() {
  const { priceData, isConnected, error } = usePusher();
  const { permission, requestPermission, sendNotification } = useNotification();
  const [alerts, setAlerts] = useState(null);

  // Chart state
  const [timeframe, setTimeframe] = useState('1D');
  const { data: chartData, loading: chartLoading, error: chartError } = useHistoricalPrices(timeframe);

  // Track last notification time to avoid spamming
  const lastNotificationRef = useRef({
    buy: 0,
    sell: 0,
  });

  const NOTIFICATION_COOLDOWN = 60000; // 1 minute cooldown between same type notifications

  // Debounce alerts to prevent triggering while typing
  const [debouncedAlerts, setDebouncedAlerts] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAlerts(alerts);
    }, 1500); // Wait 1.5s after user stops typing

    return () => clearTimeout(timer);
  }, [alerts]);

  // Check alerts and trigger notifications
  useEffect(() => {
    if (!debouncedAlerts || !priceData.buyingRate || !priceData.sellingRate) {
      return;
    }

    const now = Date.now();

    // Check buy alert (price dropped to target)
    // Validate target is defined and reasonable (> 1000) to avoid false triggers
    if (
      debouncedAlerts.buyEnabled &&
      debouncedAlerts.buyTarget &&
      debouncedAlerts.buyTarget > 1000 &&
      priceData.buyingRate <= debouncedAlerts.buyTarget &&
      now - lastNotificationRef.current.buy > NOTIFICATION_COOLDOWN
    ) {
      sendNotification('📉 Harga Emas Turun!', {
        body: `Harga beli sekarang ${formatPrice(priceData.buyingRate)}/gram\nTarget Anda: ${formatPrice(debouncedAlerts.buyTarget)}`,
        tag: 'treasury-buy-alert',
      });
      lastNotificationRef.current.buy = now;
    }

    // Check sell alert (price rose to target)
    if (
      debouncedAlerts.sellEnabled &&
      debouncedAlerts.sellTarget &&
      debouncedAlerts.sellTarget > 1000 &&
      priceData.sellingRate >= debouncedAlerts.sellTarget &&
      now - lastNotificationRef.current.sell > NOTIFICATION_COOLDOWN
    ) {
      sendNotification('📈 Harga Emas Naik!', {
        body: `Harga jual sekarang ${formatPrice(priceData.sellingRate)}/gram\nTarget Anda: ${formatPrice(debouncedAlerts.sellTarget)}`,
        tag: 'treasury-sell-alert',
      });
      lastNotificationRef.current.sell = now;
    }
  }, [priceData, debouncedAlerts, sendNotification]);

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

        <div className="chart-section" style={{ width: '100%', marginBottom: '2rem' }}>
          <TimeframeSelector selected={timeframe} onChange={setTimeframe} />
          <PriceChart
            data={chartData}
            loading={chartLoading}
            error={chartError}
            timeframe={timeframe}
          />
        </div>

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
