import { useCallback, useEffect, useState } from 'react';

export function useNotification() {
    const [permission, setPermission] = useState('default');

    useEffect(() => {
        // Check current permission status
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }, []);

    const sendNotification = useCallback(async (title, options = {}) => {
        if (permission !== 'granted') {
            console.warn('Notification permission not granted');
            return null;
        }

        const notificationOptions = {
            icon: '/icon-192.png', // Use PNG for better compatibility
            badge: '/gold-icon.svg',
            tag: 'treasury-gold-alert',
            requireInteraction: true,
            vibrate: [200, 100, 200], // Add vibration for mobile
            ...options,
        };

        try {
            // Play sound (attempt before notification)
            try {
                const audio = new Audio('/notification-sound.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => { });
            } catch (e) {
                // Ignore audio errors
            }

            // Try Service Worker first (Required for Android Chrome)
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                if (registration) {
                    await registration.showNotification(title, notificationOptions);
                    return true;
                }
            }

            // Fallback to classic Web Notification API (Desktop)
            return new Notification(title, notificationOptions);
        } catch (err) {
            console.error('Failed to create notification:', err);
            return null;
        }
    }, [permission]);

    return {
        permission,
        requestPermission,
        sendNotification,
        isSupported: 'Notification' in window,
    };
}

export default useNotification;
