// Service worker for Firebase Cloud Messaging
// This file must be served from the root of the site

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// The config will be injected or we can try to fetch it
// Since service workers can't easily access localStorage or same-origin /api/config 
// without some tricks, we'll use a listener to initialize it when the config is sent
// or just hope the default project initialization works if we can hardcode some parts.

// However, Firebase Messaging SW usually needs the config hardcoded or provided.
// A common trick is to fetch it from the same origin.

firebase.initializeApp({
    // These are placeholders. In a real production environment, 
    // these should be either hardcoded or retrieved.
    // Messaging only REALLY needs the messagingSenderId for the SW.
    messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/images/icone-megafone-verde.svg', // Default icon
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
