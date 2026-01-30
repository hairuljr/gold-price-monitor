import { useState, useEffect } from 'react';
import { subDays, subMonths, format } from 'date-fns';

const API_ENDPOINT = import.meta.env.VITE_TREASURY_API_URL || 'https://webv2-api.treasury.id/api/v1/external/wp/gold/price';

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

                const formatDateForApi = (date) => format(date, 'yyyy-MM-dd HH:mm:ss');

                const payload = {
                    start_date: formatDateForApi(startDate),
                    end_date: formatDateForApi(now),
                    type: 'daily',
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

                // The API actually returns prices in result.data.attributes.prices
                const prices = result?.data?.attributes?.prices || [];

                const formattedData = prices.map(item => ({
                    timestamp: item.datetime,
                    buy: item.buy_price,
                    sell: item.sell_price
                }));

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
