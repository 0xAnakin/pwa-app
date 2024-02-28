require('dotenv').config();

const cors = require('cors');
const express = require('express');
const webpush = require('web-push');

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {

    console.error(`You must set the VAPID_PUBLIC_KEY & VAPID_PRIVATE_KEY environment variables. You can use the following ones:\n`, webPush.generateVAPIDKeys());

    process.exit(1);

}

const subscriptions = new Map();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(function (req, res, next) {
    res.header('Service-Worker-Allowed', '/');
    next();
})
app.use(express.static('public'));

// Subscribe 
app.post('/subscribe', (req, res) => {

    const subscription = req.body;

    if (!subscriptions.has(subscription.keys.auth)) {

        console.log('adding subscription:', subscription);

        subscriptions.set(subscription.keys.auth, subscription);

        res.status(201).json({ subscriptions: subscriptions.size });

    } else {
        res.status(200).json({ subscriptions: subscriptions.size });
    }

});

// Notification
app.post('/notify', (req, res) => {

    const promises = [];
    const payload = {
        notification: {
            title: req.body.title,
            body: req.body.body,
            icon: '/images/pwa/icons/icon-192.png',
            badge: '/images/pwa/icons/icon-24.png'
        }
    };

    console.log('Notification payload:', payload);

    subscriptions.forEach((subscription) => {

        const parsed = new URL(subscription.endpoint);
        const audience = `${parsed.protocol}//${parsed.hostname}`;
        const headers = webpush.getVapidHeaders(audience, `mailto: ${process.env.VAPID_MAIL_TO}`, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY, 'aes128gcm');

        promises.push(webpush.sendNotification(subscription, JSON.stringify(payload), { headers: headers }))

    })

    Promise.all(promises).then((notifications) => {

        console.log(`Sent ${notifications.length} notifications`);

        res.status(200).json({ notifications: notifications.length });

    }).catch(((err) => {

        console.error(err);

        res.status(500).json({ error: err.message });

    }))

});

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).end();

});

app.listen(process.env.PORT, () => {
    console.debug(`Server listening on port ${process.env.PORT}`);
});
