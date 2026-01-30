import { renderHook, waitFor } from '@testing-library/react';
import { useHistoricalPrices } from '../hooks/useHistoricalPrices';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the environment variable
vi.stubEnv('VITE_TREASURY_API_URL', 'https://mock-api.com');

describe('useHistoricalPrices', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('should start with loading state', async () => {
        global.fetch.mockReturnValue(new Promise(() => { })); // Never resolves
        const { result } = renderHook(() => useHistoricalPrices('1D'));

        expect(result.current.loading).toBe(true);
        expect(result.current.data).toEqual([]);
    });

    it('should fetch and format data correctly on success', async () => {
        const mockApiResponse = {
            data: {
                attributes: {
                    prices: [
                        {
                            datetime: '30/01/26 - 17:00',
                            buy_price: 2800000,
                            sell_price: 2900000
                        }
                    ]
                }
            }
        };

        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => mockApiResponse
        });

        const { result } = renderHook(() => useHistoricalPrices('1D'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.data).toHaveLength(1);
        }, { timeout: 2000 });

        expect(result.current.data[0]).toMatchObject({
            buy: 2800000,
            sell: 2900000,
            timestamp: '30/01/26 - 17:00'
        });
        expect(result.current.error).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 500
        });

        const { result } = renderHook(() => useHistoricalPrices('1D'));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('Failed to fetch historical data');
        expect(result.current.data).toEqual([]);
    });
});
