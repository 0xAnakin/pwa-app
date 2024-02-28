const registerServiceWorker = () => {

    return new Promise((resolve, reject) => {

        if (!('serviceWorker' in navigator)) {

            reject(new Error('ServiceWorker unavailable'));

        } else {


            Promise.all([
                navigator.serviceWorker.register('/js/sw.js', { scope: '/', updateViaCache: 'none' }),
                navigator.serviceWorker.ready
            ]).then((arr) => resolve(arr.pop())).catch(reject);

            // navigator.serviceWorker.ready.then((registration) => {
            //     resolve(registration);
            // });

            // navigator.serviceWorker.register('/js/sw.js', { scope:'/', updateViaCache: 'none' }).then(function (registration) {

            //     console.debug('Service Worker registered with scope:', registration.scope);

            // }).catch(function (err) {

            //     console.error('Service Worker registration failed:', err);

            //     reject(err);

            // })

        }

    })

}

const requestNotificationPermission = () => {

    return new Promise((resolve, reject) => {

        if (!('Notification' in window)) {

            reject(new Error('Notification unavailable'));

        } else if (Notification.permission !== 'granted') {

            console.debug('Requesting notification permission...');

            Notification.requestPermission().then((permission) => {

                if (permission === 'granted') {

                    console.debug('Notification permission granted');

                    resolve(permission);

                } else {

                    console.debug('Notification permission were denied');

                    reject(permission);

                }

            })

        } else {
            resolve(Notification.permission);
        }

    })

}

const pushSubscription = ([registration, permission]) => {

    const options = {
        userVisibleOnly: true,
        applicationServerKey: 'BPEkIUHjVxWCD4_l5oTmPl5K-JLxW5GSp_eTNGiGzCkGuq7NOgVgKu6FDj9OHGj0lI1vQNkijpyb7L8VoYsQpk0'
    };

    return new Promise((resolve, reject) => {
        registration.pushManager.subscribe(options).then((subscription) => {
            return resolve([registration, permission, subscription]);
        }).catch(reject);
    })

}

Promise.all([
    registerServiceWorker(),
    requestNotificationPermission()
]).then(pushSubscription).then(([registration, permission, subscription]) => {

    console.debug('registration:', registration);
    console.debug('permission:', permission);
    console.debug('subscription:', subscription);

    const options = {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(subscription)
    };

    fetch('/subscribe', options).then((res) => {
        return res.json();
    }).then((data) => {
        console.debug('/subscribe parsed reply:', data);
    }).catch(console.error);

}).catch(console.error);

document.getElementById('notification-btn').addEventListener('click', function () {

    const options = {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
            title: 'Sample Notification',
            body: 'This is a notification from your PWA!'
        })
    };

    fetch('/notify', options).then((res) => {
        return res.json();
    }).then((data) => {
        console.debug('/notify parsed reply:', data);
    }).catch(console.error);

});
