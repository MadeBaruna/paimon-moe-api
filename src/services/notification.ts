import firebase from 'firebase-admin';

export function initFirebase(): void {
  firebase.initializeApp({
    credential: firebase.credential.applicationDefault(),
  });
}

interface NotificationPayload {
  data: {
    title: string;
    body: string;
    url: string;
  };
}

export async function sendNotification(tokens: string[], payload: NotificationPayload): Promise<void> {
  try {
    await firebase.messaging().sendMulticast({
      tokens,
      ...payload,
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}
