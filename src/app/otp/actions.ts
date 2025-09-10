'use server';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import {createHash} from 'crypto';

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// --- Helper Functions ---

/**
 * Generates a random 6-digit number as a string.
 */
function generate6DigitOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Creates a SHA-256 hash of a given string.
 * @param text The string to hash.
 * @returns The SHA-256 hash.
 */
function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

// --- Twilio and FCM Configuration (placeholders) ---
// In a real app, use firebase functions:config:set twilio.sid="..." etc.
const twilioSid = functions.config().twilio?.sid;
const twilioAuthToken = functions.config().twilio?.authtoken;
const twilioFromNumber = functions.config().twilio?.from_number;

// --- Callable Cloud Function: generateOtp ---

export const generateOtp = onCall<{ deliveryId: string }>(async (request) => {
  const { deliveryId } = request.data;
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError('unauthenticated', 'You must be logged in to request an OTP.');
  }

  if (!deliveryId) {
    throw new HttpsError('invalid-argument', 'The function must be called with a "deliveryId".');
  }

  const deliveryRef = db.collection('deliveries').doc(deliveryId);
  const deliveryDoc = await deliveryRef.get();

  if (!deliveryDoc.exists) {
    throw new HttpsError('not-found', `Delivery with ID ${deliveryId} not found.`);
  }

  const delivery = deliveryDoc.data()!;
  
  // Security check: Only the assigned volunteer can generate the OTP
  if (delivery.volunteerId !== uid) {
      throw new HttpsError('permission-denied', 'You are not authorized to generate an OTP for this delivery.');
  }
      
  const otp = generate6DigitOtp();
  const otpHash = sha256(otp);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

  try {
    await deliveryRef.update({
      otpHash: otpHash,
      otpExpiry: admin.firestore.Timestamp.fromDate(otpExpiry),
    });

    // --- Send OTP via Twilio or FCM ---
    // This is where you'd integrate with Twilio or send an FCM notification to the receiver's device.
    // For this example, we will skip the actual sending part.
    // In a real implementation:
    // const receiverRef = await db.collection('receivers').doc(delivery.receiverId).get();
    // const receiverData = receiverRef.data();
    // if (receiverData && receiverData.phone) {
    //   // Use Twilio to send SMS
    // } else if (receiverData && receiverData.fcmToken) {
    //   // Use FCM to send notification
    // }
    console.log(`Generated OTP for delivery ${deliveryId}: ${otp}`); // Log for demo purposes. DO NOT DO IN PRODUCTION.

    return { success: true, message: 'OTP has been generated and sent.', expiry: otpExpiry.toISOString() };

  } catch (error) {
    console.error('Error generating OTP:', error);
    throw new HttpsError('internal', 'An unexpected error occurred while generating the OTP.');
  }
});


// --- Callable Cloud Function: verifyOtp ---

export const verifyOtp = onCall<{ deliveryId: string, otp: string }>(async (request) => {
    const { deliveryId, otp } = request.data;
    const uid = request.auth?.uid;
    
    if (!uid) {
        throw new HttpsError('unauthenticated', 'You must be logged in to verify an OTP.');
    }

    if (!deliveryId || !otp) {
        throw new HttpsError('invalid-argument', 'The function must be called with "deliveryId" and "otp".');
    }

    const deliveryRef = db.collection('deliveries').doc(deliveryId);
    const deliveryDoc = await deliveryRef.get();

    if (!deliveryDoc.exists) {
        throw new HttpsError('not-found', `Delivery with ID ${deliveryId} not found.`);
    }

    const delivery = deliveryDoc.data()!;

    // Security check: Only the assigned volunteer can verify.
    if (delivery.volunteerId !== uid) {
        throw new HttpsError('permission-denied', 'You are not authorized to verify this delivery.');
    }
    
    if (delivery.status === 'delivered') {
        throw new HttpsError('failed-precondition', 'This delivery has already been confirmed.');
    }
    
    const { otpHash, otpExpiry } = delivery;

    if (!otpHash || !otpExpiry) {
        throw new HttpsError('failed-precondition', 'No OTP has been generated for this delivery.');
    }

    if (otpExpiry.toDate() < new Date()) {
        throw new HttpsError('failed-precondition', 'The OTP has expired. Please generate a new one.');
    }

    const receivedOtpHash = sha256(otp);

    if (receivedOtpHash !== otpHash) {
        throw new HttpsError('invalid-argument', 'The OTP entered is incorrect.');
    }

    try {
        // --- Perform atomic update and logging ---
        const auditLogRef = db.collection('auditLogs').doc();
        
        await db.runTransaction(async (transaction) => {
            transaction.update(deliveryRef, {
                status: 'delivered',
                otpHash: admin.firestore.FieldValue.delete(), // Remove OTP fields after use
                otpExpiry: admin.firestore.FieldValue.delete(),
            });
            
            transaction.set(auditLogRef, {
                action: 'verifyOtp',
                status: 'success',
                userId: uid,
                deliveryId: deliveryId,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        return { success: true, message: 'Delivery confirmed successfully!' };
    
    } catch (error) {
        console.error("Error verifying OTP:", error);
        throw new HttpsError('internal', 'An unexpected error occurred while verifying the OTP.');
    }
});
