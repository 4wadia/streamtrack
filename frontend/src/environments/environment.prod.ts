/**
 * Production environment configuration
 * Fill in your Firebase config from Firebase Console
 */
export const environment = {
    production: true,
    apiUrl: '/api',
    firebase: {
        apiKey: '',           // Get from Firebase Console
        authDomain: '',       // your-project.firebaseapp.com
        projectId: '',        // your-project-id
        storageBucket: '',    // your-project.appspot.com
        messagingSenderId: '', // sender ID
        appId: ''             // app ID
    }
};
