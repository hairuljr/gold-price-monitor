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

    const sendNotification = useCallback((title, options = {}) => {
        if (permission !== 'granted') {
            console.warn('Notification permission not granted');
            return null;
        }

        const notification = new Notification(title, {
            icon: '/gold-icon.svg',
            badge: '/gold-icon.svg',
            tag: 'treasury-gold-alert',
            requireInteraction: true,
            ...options,
        });

        // Play sound if available
        try {
            const audio = new Audio('/notification-sound.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {
                // Sound might be blocked by browser
            });
        } catch {
            // Audio not available
        }

        return notification;
    }, [permission]);

    return {
        permission,
        requestPermission,
        sendNotification,
        isSupported: 'Notification' in window,
    };
}

export default useNotification;
