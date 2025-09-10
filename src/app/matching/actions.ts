'use server';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as geofire from 'geofire-common';

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

// --- Environment Configuration ---
// Set these using `firebase functions:config:set matching.radius_km="10"`
const SEARCH_RADIUS_KM = functions.config().matching?.radius_km || '10';


/**
 * Cloud Function triggered when a new food listing is created.
 *
 * This function orchestrates the core matching logic:
 * 1.  Finds verified receivers within a configured radius of the donation.
 * 2.  Finds available volunteers near the donation.
 * 3.  (For MVP) Selects the nearest receiver and volunteer.
 * 4.  Creates a 'delivery' document to track the assignment.
 * 5.  Sends a push notification to the assigned volunteer.
 */
export const onListingCreate = onDocumentCreated('listings/{listingId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log('No data associated with the event');
    return;
  }
  const listing = snapshot.data();
  const listingId = snapshot.id;

  functions.logger.info(`New listing created: ${listingId}`, { structuredData: true, listing });

  // --- Idempotency Check ---
  // Ensure we don't create duplicate deliveries for the same listing.
  const existingDeliveries = await db.collection('deliveries').where('listingId', '==', listingId).limit(1).get();
  if (!existingDeliveries.empty) {
    functions.logger.warn(`Delivery already exists for listing ${listingId}. Aborting.`);
    return;
  }
  
  const { location, donorId } = listing;

  if (!location || !location.latitude || !location.longitude) {
    functions.logger.error(`Listing ${listingId} is missing a valid location.`, { structuredData: true });
    return;
  }
  const center = [location.latitude, location.longitude];
  const radiusInM = parseFloat(SEARCH_RADIUS_KM) * 1000;

  try {
    // --- 1. Find Nearby Receivers ---
    const receiversQuery = db.collection('receivers').where('status', '==', 'verified');
    // Additional geo-query logic would be applied here in a full implementation.
    // For MVP, we'll fetch all and calculate distance manually.
    const allReceivers = await receiversQuery.get();
    
    let nearestReceiver: admin.firestore.DocumentSnapshot | null = null;
    let minReceiverDistance = Infinity;

    allReceivers.docs.forEach(doc => {
        const receiver = doc.data();
        if (receiver.location) {
            const distanceInKm = geofire.distanceBetween([receiver.location.latitude, receiver.location.longitude], center);
            if (distanceInKm * 1000 <= radiusInM && distanceInKm < minReceiverDistance) {
                minReceiverDistance = distanceInKm;
                nearestReceiver = doc;
            }
        }
    });

    if (!nearestReceiver) {
        functions.logger.warn(`No verified receivers found within ${SEARCH_RADIUS_KM}km for listing ${listingId}.`);
        // In a real app, you might queue this for a later retry or manual assignment.
        return;
    }
    
    const receiverId = nearestReceiver.id;
    functions.logger.info(`Found nearest receiver: ${receiverId} at ${minReceiverDistance.toFixed(2)}km.`);

    // --- 2. Find Nearest Available Volunteer ---
    const volunteersQuery = db.collection('volunteers').where('status', '==', 'available');
    const allVolunteers = await volunteersQuery.get();

    let nearestVolunteer: admin.firestore.DocumentSnapshot | null = null;
    let minVolunteerDistance = Infinity;

    allVolunteers.docs.forEach(doc => {
        const volunteer = doc.data();
        if (volunteer.currentLocation) {
             const distanceInKm = geofire.distanceBetween([volunteer.currentLocation.latitude, volunteer.currentLocation.longitude], center);
             if (distanceInKm < minVolunteerDistance) {
                minVolunteerDistance = distanceInKm;
                nearestVolunteer = doc;
             }
        }
    });
    
    if (!nearestVolunteer) {
        functions.logger.warn(`No available volunteers found for listing ${listingId}.`);
        return;
    }
    const volunteerId = nearestVolunteer.id;
    const volunteerData = nearestVolunteer.data();
    functions.logger.info(`Found nearest volunteer: ${volunteerId} at ${minVolunteerDistance.toFixed(2)}km.`);


    // --- 3. Create Delivery Document ---
    const deliveryRef = db.collection('deliveries').doc(); // Auto-generate ID
    await deliveryRef.set({
      listingId: listingId,
      donorId: donorId,
      receiverId: receiverId,
      volunteerId: volunteerId,
      status: 'assigned',
      otpHash: null,
      otpExpiry: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    functions.logger.info(`Created delivery document ${deliveryRef.id}.`);


    // --- 4. Send FCM Notification to Volunteer ---
    const deviceToken = volunteerData?.deviceToken;
    if (deviceToken) {
      const message = {
        notification: {
          title: 'New Delivery Assignment!',
          body: `You have a new pickup from ${listing.title}. Please check the app for details.`,
        },
        token: deviceToken,
      };

      try {
        await admin.messaging().send(message);
        functions.logger.info(`Successfully sent notification to volunteer ${volunteerId}.`);
      } catch (error) {
        functions.logger.error(`Error sending FCM notification to volunteer ${volunteerId}:`, error);
        // Note: Don't fail the whole function if notification fails.
      }
    } else {
        functions.logger.warn(`Volunteer ${volunteerId} does not have a device token. Cannot send notification.`);
    }

  } catch (error) {
    functions.logger.error(`Failed to process listing ${listingId}:`, error);
    // The function will automatically retry on most errors.
    throw error;
  }
});
