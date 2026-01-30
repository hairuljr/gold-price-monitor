import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Alert Logic Tests
 * Tests for the price alert triggering logic
 */

describe('Price Alert Logic', () => {
    describe('Buy Alert (Price Drop)', () => {
        it('should trigger when current price is less than target', () => {
            const currentPrice = 2700000;
            const targetPrice = 2800000;
            const shouldTrigger = currentPrice <= targetPrice;

            expect(shouldTrigger).toBe(true);
        });

        it('should trigger when current price equals target', () => {
            const currentPrice = 2800000;
            const targetPrice = 2800000;
            const shouldTrigger = currentPrice <= targetPrice;

            expect(shouldTrigger).toBe(true);
        });

        it('should not trigger when current price is above target', () => {
            const currentPrice = 2900000;
            const targetPrice = 2800000;
            const shouldTrigger = currentPrice <= targetPrice;

            expect(shouldTrigger).toBe(false);
        });
    });

    describe('Sell Alert (Price Rise)', () => {
        it('should trigger when current price is greater than target', () => {
            const currentPrice = 3000000;
            const targetPrice = 2900000;
            const shouldTrigger = currentPrice >= targetPrice;

            expect(shouldTrigger).toBe(true);
        });

        it('should trigger when current price equals target', () => {
            const currentPrice = 2900000;
            const targetPrice = 2900000;
            const shouldTrigger = currentPrice >= targetPrice;

            expect(shouldTrigger).toBe(true);
        });

        it('should not trigger when current price is below target', () => {
            const currentPrice = 2800000;
            const targetPrice = 2900000;
            const shouldTrigger = currentPrice >= targetPrice;

            expect(shouldTrigger).toBe(false);
        });
    });

    describe('Alert State Management', () => {
        it('should only trigger when alert is enabled', () => {
            const alerts = {
                buyEnabled: true,
                buyTarget: 2800000,
                sellEnabled: false,
                sellTarget: 2900000,
            };
            const currentBuyPrice = 2700000;
            const currentSellPrice = 3000000;

            const shouldTriggerBuy = alerts.buyEnabled &&
                alerts.buyTarget &&
                currentBuyPrice <= alerts.buyTarget;

            const shouldTriggerSell = alerts.sellEnabled &&
                alerts.sellTarget &&
                currentSellPrice >= alerts.sellTarget;

            expect(shouldTriggerBuy).toBe(true);
            expect(shouldTriggerSell).toBe(false); // disabled even though price condition met
        });

        it('should not trigger if target is not set', () => {
            const alerts = {
                buyEnabled: true,
                buyTarget: null,
                sellEnabled: true,
                sellTarget: null,
            };
            const currentBuyPrice = 2700000;
            const currentSellPrice = 3000000;

            const shouldTriggerBuy = alerts.buyEnabled &&
                alerts.buyTarget &&
                currentBuyPrice <= alerts.buyTarget;

            const shouldTriggerSell = alerts.sellEnabled &&
                alerts.sellTarget &&
                currentSellPrice >= alerts.sellTarget;

            expect(shouldTriggerBuy).toBeFalsy();
            expect(shouldTriggerSell).toBeFalsy();
        });
    });
});

describe('Notification Throttling', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it('should prevent duplicate notifications within cooldown period', () => {
        const COOLDOWN_MS = 60000; // 1 minute
        let lastNotificationTime = 0;
        const notifications = [];

        const sendNotification = (message) => {
            const now = Date.now();
            if (now - lastNotificationTime >= COOLDOWN_MS) {
                notifications.push({ message, time: now });
                lastNotificationTime = now;
                return true;
            }
            return false;
        };

        // First notification should succeed
        expect(sendNotification('Price alert!')).toBe(true);
        expect(notifications.length).toBe(1);

        // Immediate second notification should be blocked
        expect(sendNotification('Price alert again!')).toBe(false);
        expect(notifications.length).toBe(1);

        // After cooldown, notification should succeed
        vi.advanceTimersByTime(COOLDOWN_MS);
        expect(sendNotification('Price alert after cooldown!')).toBe(true);
        expect(notifications.length).toBe(2);
    });
});
