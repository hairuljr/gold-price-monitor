import { renderHook, waitFor, act } from '@testing-library/react';
import { usePusher } from '../hooks/usePusher';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Stub environment variables BEFORE anything else
vi.stubEnv('VITE_PUSHER_APP_KEY', 'test-key');
vi.stubEnv('VITE_PUSHER_CLUSTER', 'test-cluster');

// Define mocks outside but as vi.fn()
const mockSubscribe = vi.fn().mockReturnValue({ bind: vi.fn() });
const mockUnsubscribe = vi.fn();
const mockDisconnect = vi.fn();
const mockBind = vi.fn();

vi.mock('pusher-js', () => {
    return {
        default: vi.fn().mockImplementation(function () {
            this.subscribe = mockSubscribe;
            this.unsubscribe = mockUnsubscribe;
            this.disconnect = mockDisconnect;
            this.connection = {
                bind: mockBind,
                state: 'connected'
            };
            return this;
        })
    };
});

import Pusher from 'pusher-js';

describe('usePusher', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock return for subscribe
        mockSubscribe.mockReturnValue({ bind: mockBind });
    });

    it('should initialize Pusher and subscribe to channel', async () => {
        renderHook(() => usePusher());

        await waitFor(() => {
            expect(Pusher).toHaveBeenCalledWith('test-key', expect.objectContaining({
                cluster: 'test-cluster'
            }));
            expect(mockSubscribe).toHaveBeenCalledWith('gold-rate');
        });
    });

    it('should update price data when receiving events', async () => {
        const { result } = renderHook(() => usePusher());

        await waitFor(() => expect(mockBind).toHaveBeenCalled());

        // Find the event callback
        const eventCall = mockBind.mock.calls.find(call => call[0] === 'gold-rate-event');
        if (!eventCall) throw new Error('Event callback not found');
        const eventCallback = eventCall[1];

        act(() => {
            eventCallback({
                buying_rate: '2.800.000',
                selling_rate: '2.900.000'
            });
        });

        expect(result.current.priceData.buyingRate).toBe(2800000);
        expect(result.current.priceData.sellingRate).toBe(2900000);
    });

    it('should cleanup on unmount', () => {
        const { unmount } = renderHook(() => usePusher());
        unmount();
        expect(mockUnsubscribe).toHaveBeenCalledWith('gold-rate');
        expect(mockDisconnect).toHaveBeenCalled();
    });
});
