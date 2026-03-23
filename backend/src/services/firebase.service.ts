import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

let initialized = false;

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const backendRoot = path.resolve(currentDir, '../..');
const repoRoot = path.resolve(backendRoot, '..');

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

function getServiceAccountPathCandidates(envPath: string | undefined): string[] {
    const pathsToCheck: string[] = [];

    if (envPath) {
        const normalized = envPath.trim();
        if (path.isAbsolute(normalized)) {
            pathsToCheck.push(normalized);
        } else {
            pathsToCheck.push(path.resolve(process.cwd(), normalized));
            pathsToCheck.push(path.resolve(backendRoot, normalized));
            pathsToCheck.push(path.resolve(repoRoot, normalized));
        }
    }

    pathsToCheck.push(path.resolve(process.cwd(), 'serviceAccountKey.json'));
    pathsToCheck.push(path.resolve(backendRoot, 'serviceAccountKey.json'));
    pathsToCheck.push(path.resolve(repoRoot, 'serviceAccountKey.json'));

    return Array.from(new Set(pathsToCheck));
}

function readServiceAccountFromFile(envPath: string | undefined): { serviceAccount: ServiceAccount; filePath: string } | null {
    const candidates = getServiceAccountPathCandidates(envPath);

    for (const candidate of candidates) {
        if (!fs.existsSync(candidate)) continue;

        const serviceAccount = JSON.parse(fs.readFileSync(candidate, 'utf-8')) as ServiceAccount;
        return {
            serviceAccount,
            filePath: candidate
        };
    }

    return null;
}

export function initializeFirebase(): void {
    if (initialized) return;

    try {
        const serviceAccountFromEnv = getServiceAccountFromEnv();
        let serviceAccount: ServiceAccount | null = serviceAccountFromEnv;

        if (!serviceAccount) {
            const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
            const accountFromFile = readServiceAccountFromFile(envPath);

            if (!accountFromFile) {
                const checkedLocations = getServiceAccountPathCandidates(envPath)
                    .map((candidate, index) => `   ${index + 1}. ${candidate}`)
                    .join('\n');

                console.warn('⚠️  Firebase service account not found. Checked locations:');
                console.warn(checkedLocations);
                console.warn('⚠️  Firebase authentication will not work until credentials are configured.');
                console.warn('   Download from: Firebase Console > Project Settings > Service Accounts > Generate new private key');
                return;
            }

            serviceAccount = accountFromFile.serviceAccount;
            console.log('✅ Firebase: Service account loaded from:', accountFromFile.filePath);
        } else {
            console.log('✅ Firebase: Service account loaded from FIREBASE_SERVICE_ACCOUNT_JSON');
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

export function getFirebaseInitializationError(): string | null {
    if (initialized) return null;
    
    const serviceAccountFromEnv = getServiceAccountFromEnv();
    if (serviceAccountFromEnv) return null;
    
    const serviceAccountPaths = getServiceAccountPathCandidates(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    const existingPath = serviceAccountPaths.find((candidate) => fs.existsSync(candidate));

    if (!existingPath) {
        return `Firebase service account file not found. Checked: ${serviceAccountPaths.join(', ')}. Please set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON environment variable.`;
    }
    
    return 'Firebase Admin initialization failed for unknown reason';
}
