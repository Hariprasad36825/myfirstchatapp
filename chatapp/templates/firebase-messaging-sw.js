importScripts("https://www.gstatic.com/firebasejs/7.18.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/7.18.0/firebase-messaging.js");
const firebaseConfig = {
    apiKey: "AIzaSyAYoRSuZXO6FvcK_CuTKuC9qM9m0Y0y9Hc",
    authDomain: "buoyant-arena-322216.firebaseapp.com",
    projectId: "buoyant-arena-322216",
    storageBucket: "buoyant-arena-322216.appspot.com",
    messagingSenderId: "480437393258",
    appId: "1:480437393258:web:e10df2d2a36b3c6c5c3713",
    measurementId: "G-SHK9HJNP5J"
    };
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.usePublicVapidKey("BBbkontzkKjxBvlIS2IHhqndJqEwsJZ7AJ7OC7FxU5yOJ5ytMREOyk1OietaANrki6nI8z7tex6o-pdoT_gTfd4");


messaging.onBackgroundMessage(function(payload) {
    console.log(payload)
    const notificationTitle = payload.data.title;
    
    const notificationOptions = {
        body: payload.data.body,
        icon: payload.data.image,
        badge: 'https://www.google.com/search?q=stackoverflow+icon&tbm=isch&source=iu&ictx=1&fir=wJwj4cAbEmkwDM%252CsXB9L4LZX6wQKM%252C_&vet=1&usg=AI4_-kRTKQC9_SJv7meC0YJMAoppJDGGlA&sa=X&ved=2ahUKEwiKld-v0OryAhX0IbcAHVuLAFkQ9QF6BAgeEAE#imgrc=wJwj4cAbEmkwDM',
        data: { url:'http://localhost:8000/#', room_id: payload.data.room }, //the url which we gonna use later
    };
    return self.registration.showNotification(notificationTitle,notificationOptions);
});
    //Code for adding event on click of notification
self.addEventListener('notificationclick', function(event) {
    // console.log(event.notification)
    let url = event.notification.data.url;

    caches.open( event.notification.data.room_id)

    event.notification.close(); 
    event.waitUntil(
        
        clients.matchAll({includeUncontrolled: true, type: 'window'}).then( windowClients => {
        // Check if there is already a window/tab open with the target URL
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
            // If so, just focus it.
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
        );
        
    });