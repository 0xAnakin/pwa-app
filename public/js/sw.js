self.addEventListener('install', function (evt) {

    console.debug('Service Worker installed');

});

self.addEventListener('activate', function (evt) {

    console.debug('Service Worker activated');

});

self.addEventListener('notificationclick', function (evt) {

    console.debug('Notification clicked');

    evt.notification.close();

});

self.addEventListener('push', (evt) => {

    const data = evt.data.json()
    const { title, ...options } = data.notification;

    evt.waitUntil(self.registration.showNotification(title, options));

});

console.log('Service worker event listeners registered');