'use client';
import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase'; // Ensure you have a firebase init file
import { useToast } from './use-toast';

export const useFcm = (userId: string | null) => {
    const { toast } = useToast();

    useEffect(() => {
        if (typeof window === 'undefined' || !userId) {
            return;
        }

        // Check for notification support
        if (!('Notification' in window)) {
            console.log('This browser does not support desktop notification');
            return;
        }

        const messaging = getMessaging(firebaseApp);

        // --- Foreground Message Handler ---
        const unsubscribeOnMessage = onMessage(messaging, (payload) => {
            console.log('Foreground message received. ', payload);
            toast({
                title: payload.notification?.title,
                description: payload.notification?.body,
            });
        });

        // --- Request Permission and Get Token ---
        const requestPermissionAndToken = async () => {
            console.log('Requesting permission...');
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    console.log('Notification permission granted.');

                    // Get the token
                    const currentToken = await getToken(messaging, {
                        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    });

                    if (currentToken) {
                        console.log('FCM Token:', currentToken);
                        // Save the token to Firestore for the current user
                        const db = getFirestore(firebaseApp);
                        const volunteerRef = doc(db, 'volunteers', userId);
                        await setDoc(volunteerRef, { deviceToken: currentToken }, { merge: true });
                        console.log('FCM token saved to Firestore.');
                    } else {
                        console.log('No registration token available. Request permission to generate one.');
                    }
                } else {
                    console.log('Unable to get permission to notify.');
                }
            } catch (err) {
                console.log('An error occurred while retrieving token. ', err);
            }
        };

        requestPermissionAndToken();

        return () => {
            unsubscribeOnMessage(); // Clean up the listener
        };
    }, [userId, toast]);
};
