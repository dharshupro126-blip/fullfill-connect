
'use server';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { onValueWritten } from 'firebase-functions/v2/database';

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

// --- Environment Configuration ---
// Set via `firebase functions:config:set iot.stale_timeout_minutes="10"`
const STALE_TIMEOUT_MINUTES = parseInt(functions.config().iot?.stale_timeout_minutes || '15', 10);


/**
 * Cloud Function triggered by new telemetry data written to the Realtime Database.
 *
 * Path: /containers/{containerId}/telemetry/latest
 *
 * This function monitors the latest sensor readings from an IoT container and
 * triggers alerts if the temperature goes out of bounds or if data becomes stale.
 */
export const onTelemetryUpdate = onValueWritten(
  '/containers/{containerId}/telemetry/latest',
  async (event) => {
    const { containerId } = event.params;
    const telemetryData = event.data.after.val();

    if (!telemetryData) {
      functions.logger.info(`No data for container ${containerId}, skipping.`);
      return;
    }

    const { temp, humidity, ts } = telemetryData;
    functions.logger.log(`Processing telemetry for ${containerId}: Temp=${temp}, Humidity=${humidity}`);

    // --- 1. Check for stale data ---
    const now = Date.now();
    const dataTimestamp = new Date(ts).getTime();
    const minutesDiff = (now - dataTimestamp) / (1000 * 60);

    if (minutesDiff > STALE_TIMEOUT_MINUTES) {
      functions.logger.warn(`Stale data for container ${containerId}. Last update was ${minutesDiff.toFixed(1)} minutes ago.`);
      // In a real app, you would send an alert here (FCM, email, etc.)
      // await sendAlert(containerId, 'Stale Data Alert', `Container ${containerId} has not reported data in over ${STALE_TIMEOUT_MINUTES} minutes.`);
      return; // Stop processing if data is stale
    }


    // --- 2. Check against temperature thresholds ---
    const containerRef = db.collection('containers').doc(containerId);
    const containerDoc = await containerRef.get();

    if (!containerDoc.exists) {
      functions.logger.error(`Container document for ${containerId} not found in Firestore.`);
      return;
    }

    const containerConfig = containerDoc.data();
    const { tempThresholds, assignedVolunteerId } = containerConfig;

    if (!tempThresholds || assignedVolunteerId == null) {
      functions.logger.info(`Container ${containerId} has no thresholds or volunteer assignment. No action needed.`);
      return;
    }

    let alertTitle: string | null = null;
    let alertBody: string | null = null;

    if (temp > tempThresholds.max) {
      alertTitle = 'High Temperature Alert!';
      alertBody = `Container ${containerId} has exceeded the maximum temperature (${temp}°C > ${tempThresholds.max}°C).`;
      functions.logger.warn(alertBody);
    } else if (temp < tempThresholds.min) {
      alertTitle = 'Low Temperature Alert!';
      alertBody = `Container ${containerId} is below the minimum temperature (${temp}°C < ${tempThresholds.min}°C).`;
      functions.logger.warn(alertBody);
    }

    if (alertTitle && alertBody) {
      // --- 3. Send Alert (FCM) ---
      const volunteerRef = db.collection('volunteers').doc(assignedVolunteerId);
      const volunteerDoc = await volunteerRef.get();
      if (volunteerDoc.exists && volunteerDoc.data()?.deviceToken) {
        const deviceToken = volunteerDoc.data()?.deviceToken;
        const message = {
            notification: { title: alertTitle, body: alertBody },
            token: deviceToken,
            data: { containerId: containerId, click_action: '/deliveries' }
        };

        try {
            await admin.messaging().send(message);
            functions.logger.info(`Successfully sent temp alert to volunteer ${assignedVolunteerId}.`);
        } catch(error) {
            functions.logger.error(`Error sending temp alert to volunteer ${assignedVolunteerId}:`, error);
        }
      }
    }
  }
);

