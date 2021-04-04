import firebase from 'firebase-admin';

export function initFirebase(): void {
  firebase.initializeApp({
    credential: firebase.credential.applicationDefault(),
  });
}

export async function sendNotification(tokens: string[]): Promise<void> {
  const payload = {
    data: {
      title: 'Parametric Transformer Reminder',
      body: 'Your parametric transformer will be ready soon!',
      url: '/reminder',
    },
  };

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
