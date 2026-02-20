import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

let initialized = false;

function getServiceAccountFromEnv(): ServiceAccount | null {
    const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!rawJson) return null;

    try {
        return JSON.parse(rawJson) as ServiceAccount;
    } catch (error) {
        console.error('❌ Invalid FIREBASE_SERVICE_ACCOUNT_JSON:', error);
        return null;
    }
}

export function initializeFirebase(): void {
    if (initialized) return;

    try {
        const serviceAccountFromEnv = getServiceAccountFromEnv();
        let serviceAccount: ServiceAccount | null = serviceAccountFromEnv;

        if (!serviceAccount) {
            const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
            const absolutePath = path.resolve(process.cwd(), serviceAccountPath);

            if (!fs.existsSync(absolutePath)) {
                console.warn('⚠️ Firebase service account not found at:', absolutePath);
                console.warn('⚠️ Firebase authentication will not work until credentials are configured.');
                return;
            }

            serviceAccount = JSON.parse(fs.readFileSync(absolutePath, 'utf-8')) as ServiceAccount;
        }

        initializeApp({
            credential: cert(serviceAccount)
        });
        initialized = true;
        console.log('✅ Firebase Admin initialized');
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin:', error);
    }
}

export async function verifyIdToken(idToken: string): Promise<DecodedIdToken | null> {
    if (!initialized) {
        console.warn('⚠️ Firebase not initialized, cannot verify token');
        return null;
    }

    try {
        return await getAuth().verifyIdToken(idToken);
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

export function isFirebaseInitialized(): boolean {
    return initialized;
}
