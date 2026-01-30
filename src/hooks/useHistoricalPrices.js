import { useState, useEffect } from 'react';
import { subDays, subMonths, format } from 'date-fns';

const API_ENDPOINT = 'https://webv2-api.treasury.id/api/v1/external/wp/gold/price';

export function useHistoricalPrices(timeframe) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const now = new Date();
                let startDate;

                // Calculate start date based on timeframe
                switch (timeframe) {
                    case '1D':
                        startDate = subDays(now, 1);
                        break;
                    case '1W':
                        startDate = subDays(now, 7);
                        break;
                    case '1M':
                        startDate = subMonths(now, 1);
                        break;
                    default:
                        startDate = subDays(now, 1);
                }

                // Format dates for API (YYYY-MM-DD HH:mm:ss)
                const formatDateForApi = (date) => format(date, 'yyyy-MM-dd HH:mm:ss');

                const payload = {
                    start_date: formatDateForApi(startDate),
                    end_date: formatDateForApi(now),
                    type: 'daily', // API uses 'daily' but returns granular data based on range
                    region: 'id',
                    assetType: 'gold'
                };

                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch historical data');
                }

                const result = await response.json();
                const prices = result?.data?.attributes?.prices || [];

                // Format data for Recharts
                // The API returns datetime like "30/01/26 - 17:00"
                const formattedData = prices.map(item => {
                    // Parse custom date format from API if needed, but for now let's trust the order
                    // Or simpler: just use the string as label if it's display-ready.
                    // However, to be safe with charts, let's parse.
                    // API format: DD/MM/YY - HH:mm
                    // Let's just keep the raw object for now and format in the chart component
                    // to allow flexible X-axis formatting based on timeframe
                    return {
                        timestamp: item.datetime,
                        buy: item.buy_price,
                        sell: item.sell_price,
                        // Create a sortable date object if needed for sorting
                        // _dateObj: parse(item.datetime, 'dd/MM/yy - HH:mm', new Date()) 
                    };
                });

                setData(formattedData);
            } catch (err) {
                console.error('Error fetching historical prices:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeframe]);

    return { data, loading, error };
}
