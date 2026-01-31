import Pusher from 'pusher-js';
import { useEffect, useState, useRef } from 'react';

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 2000; // 2 seconds

export function usePusher() {
  const PUSHER_APP_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
  const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;
  const CHANNEL_NAME = import.meta.env.VITE_CHANNEL_NAME || 'gold-rate';
  const EVENT_NAME = import.meta.env.VITE_EVENT_NAME || 'gold-rate-event';

  const [priceData, setPriceData] = useState({
    buyingRate: null,
    sellingRate: null,
    lastUpdated: null,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const pusherRef = useRef(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef(null);

  useEffect(() => {
    // Validate required environment variables
    if (!PUSHER_APP_KEY || !PUSHER_CLUSTER) {
      setError('Missing Pusher configuration. Please check environment variables.');
      return;
    }

    const connectPusher = () => {
      try {
        // Initialize Pusher
        pusherRef.current = new Pusher(PUSHER_APP_KEY, {
          cluster: PUSHER_CLUSTER,
        });

        const channel = pusherRef.current.subscribe(CHANNEL_NAME);

        // Connection state handlers
        pusherRef.current.connection.bind('connected', () => {
          setIsConnected(true);
          setError(null);
          retryCountRef.current = 0; // Reset retry count on successful connection
        });

        pusherRef.current.connection.bind('disconnected', () => {
          setIsConnected(false);
        });

        pusherRef.current.connection.bind('error', (err) => {
          const errorMessage = err.message || 'Connection error';
          setError(errorMessage);
          setIsConnected(false);

          // Implement exponential backoff retry
          if (retryCountRef.current < MAX_RETRIES) {
            const delay = BASE_RETRY_DELAY * Math.pow(2, retryCountRef.current);
            retryCountRef.current++;

            retryTimeoutRef.current = setTimeout(() => {
              console.log(`Retrying connection... (${retryCountRef.current}/${MAX_RETRIES})`);
              if (pusherRef.current) {
                pusherRef.current.disconnect();
              }
              connectPusher();
            }, delay);
          }
        });

        // Listen for gold rate events
        channel.bind(EVENT_NAME, (data) => {
          // Parse the rates - they come as strings with dot separators (e.g., "2.885.222")
          const buyingRate = parsePrice(data.buying_rate);
          const sellingRate = parsePrice(data.selling_rate);

          setPriceData({
            buyingRate,
            sellingRate,
            lastUpdated: new Date(),
            raw: data,
          });
        });
      } catch (err) {
        setError(`Failed to initialize Pusher: ${err.message}`);
      }
    };

    connectPusher();

    // Reconnect when app returns to foreground (visibility change)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if Pusher is disconnected and reconnect
        if (pusherRef.current) {
          const state = pusherRef.current.connection.state;
          if (state === 'disconnected' || state === 'failed' || state === 'unavailable') {
            console.log('App resumed, reconnecting Pusher...');
            retryCountRef.current = 0;
            pusherRef.current.disconnect();
            connectPusher();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (pusherRef.current) {
        pusherRef.current.unsubscribe(CHANNEL_NAME);

        // Safely disconnect
        try {
          const state = pusherRef.current.connection.state;
          if (state !== 'disconnected' && state !== 'failed') {
            pusherRef.current.disconnect();
          }
        } catch (e) {
          // Ignore disconnect errors (common in strict mode)
        }
      }
    };
  }, []);

  return { priceData, isConnected, error };
}

// Parse price string like "2.885.222" to number 2885222
function parsePrice(priceString) {
  if (!priceString) return null;
  // Remove dots and convert to number
  return parseInt(priceString.replace(/\./g, ''), 10);
}

export default usePusher;
