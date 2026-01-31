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

        <div className="author-section">
          <p className="author-name">Made with ☕️ by <strong>Hairul Januar</strong></p>
          <div className="social-links">
            <a href="https://www.linkedin.com/in/hairul-januar/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
            <a href="https://github.com/hairuljr" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a href="https://www.facebook.com/hairul.januar/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
          </div>
        </div>
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
