/**
 * Environment Check Utility
 * Validates critical configuration before API boots
 * Run with: bun run check-env
 */

import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
    name: string;
    status: 'ok' | 'warning' | 'error';
    message: string;
}

function normalizeToken(value: string | undefined): string | undefined {
    if (!value) return undefined;

    let token = value.trim();
    token = token.replace(/^Bearer\s+/i, '');
    token = token.replace(/^['"](.*)['"]$/, '$1').trim();

    return token || undefined;
}

function isV4TokenFormat(token: string): boolean {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    return parts.every((part) => part.length > 0 && /^[A-Za-z0-9_-]+$/.test(part));
}

function isV3ApiKeyFormat(token: string): boolean {
    return /^[a-f0-9]{32}$/i.test(token);
}

function getEnvCandidates(): string[] {
    return [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '../.env')
    ];
}

function checkEnvFile(): CheckResult {
    const envCandidates = getEnvCandidates();
    const existingEnv = envCandidates.find((envPath) => fs.existsSync(envPath));

    if (!existingEnv) {
        const templateCandidates = [
            path.resolve(process.cwd(), '.env.template'),
            path.resolve(process.cwd(), '.env.example'),
            path.resolve(process.cwd(), '../.env.template'),
            path.resolve(process.cwd(), '../.env.example')
        ];

        const existingTemplate = templateCandidates.find((templatePath) => fs.existsSync(templatePath));
        if (existingTemplate) {
            return {
                name: '.env file',
                status: 'error',
                message: `.env file not found. Create one from ${existingTemplate}.`
            };
        }
        return {
            name: '.env file',
            status: 'error',
            message: '.env file not found and no template available.'
        };
    }
    
    return {
        name: '.env file',
        status: 'ok',
        message: `.env file found: ${existingEnv}`
    };
}

function checkTMDBToken(): CheckResult {
    const readAccessToken = normalizeToken(process.env.TMDB_READ_ACCESS_TOKEN);
    const apiKey = normalizeToken(process.env.TMDB_API_KEY);
    
    if (!readAccessToken && !apiKey) {
        return {
            name: 'TMDB Token',
            status: 'error',
            message: 'Neither TMDB_READ_ACCESS_TOKEN nor TMDB_API_KEY is set. Get your token at https://www.themoviedb.org/settings/api'
        };
    }
    
    if (readAccessToken) {
        if (isV4TokenFormat(readAccessToken)) {
            return {
                name: 'TMDB Token',
                status: 'ok',
                message: 'TMDB_READ_ACCESS_TOKEN is set (V4 JWT format ✓)'
            };
        } else {
            return {
                name: 'TMDB Token',
                status: 'warning',
                message: 'TMDB_READ_ACCESS_TOKEN appears to be invalid. Expected JWT starting with "eyJ..." (V4 Read Access Token)'
            };
        }
    }
    
    if (apiKey) {
        if (isV3ApiKeyFormat(apiKey)) {
            return {
                name: 'TMDB Token',
                status: 'warning',
                message: 'TMDB_API_KEY is set (V3 format). Consider using TMDB_READ_ACCESS_TOKEN (V4) for better security.'
            };
        } else {
            return {
                name: 'TMDB Token',
                status: 'warning',
                message: 'TMDB_API_KEY is set but has unusual format. Expected 32-character hex string.'
            };
        }
    }
    
    return {
        name: 'TMDB Token',
        status: 'error',
        message: 'Unknown TMDB token configuration issue'
    };
}

function getFirebaseServiceAccountPathCandidates(envPath: string | undefined): { path: string; label: string }[] {
    const pathsToCheck: { path: string; label: string }[] = [];

    if (envPath) {
        const normalized = envPath.trim();
        if (path.isAbsolute(normalized)) {
            pathsToCheck.push({ path: normalized, label: `FIREBASE_SERVICE_ACCOUNT_PATH (absolute): ${normalized}` });
        } else {
            pathsToCheck.push({ path: path.resolve(process.cwd(), normalized), label: `FIREBASE_SERVICE_ACCOUNT_PATH from cwd: ${normalized}` });
            pathsToCheck.push({ path: path.resolve(process.cwd(), '../', normalized), label: `FIREBASE_SERVICE_ACCOUNT_PATH from repo root: ${normalized}` });
        }
    }

    pathsToCheck.push({ path: path.resolve(process.cwd(), 'serviceAccountKey.json'), label: './serviceAccountKey.json (from cwd)' });
    pathsToCheck.push({ path: path.resolve(process.cwd(), '../serviceAccountKey.json'), label: '../serviceAccountKey.json (from repo root)' });

    return Array.from(new Map(pathsToCheck.map((entry) => [entry.path, entry])).values());
}

function checkFirebaseServiceAccount(): CheckResult {
    // Check inline JSON first
    const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (envJson) {
        try {
            JSON.parse(envJson);
            return {
                name: 'Firebase Service Account',
                status: 'ok',
                message: 'FIREBASE_SERVICE_ACCOUNT_JSON is set and valid JSON'
            };
        } catch {
            return {
                name: 'Firebase Service Account',
                status: 'error',
                message: 'FIREBASE_SERVICE_ACCOUNT_JSON is set but contains invalid JSON'
            };
        }
    }
    
    const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const pathsToCheck = getFirebaseServiceAccountPathCandidates(envPath);
    
    for (const { path: checkPath, label } of pathsToCheck) {
        if (fs.existsSync(checkPath)) {
            try {
                const content = fs.readFileSync(checkPath, 'utf-8');
                JSON.parse(content);
                return {
                    name: 'Firebase Service Account',
                    status: 'ok',
                    message: `Service account file found and valid: ${label}`
                };
            } catch {
                return {
                    name: 'Firebase Service Account',
                    status: 'error',
                    message: `Service account file exists but contains invalid JSON: ${label}`
                };
            }
        }
    }
    
    return {
        name: 'Firebase Service Account',
        status: 'error',
        message: 'Firebase service account not found. Checked:\n' +
                 pathsToCheck.map((entry, index) => `   ${index + 1}. ${entry.path} (${entry.label})`).join('\n') + '\n' +
                 '   Download from: Firebase Console > Project Settings > Service Accounts'
    };
}

function checkMongoDB(): CheckResult {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
        return {
            name: 'MongoDB',
            status: 'warning',
            message: 'MONGO_URI not set. Will default to mongodb://localhost:27017/streamtrack'
        };
    }
    
    return {
        name: 'MongoDB',
        status: 'ok',
        message: `MONGO_URI is set: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}` // Hide credentials
    };
}

function runChecks(): void {
    console.log('🔍 StreamTrack Environment Check\n');
    console.log('=====================================\n');
    
    const results = [
        checkEnvFile(),
        checkTMDBToken(),
        checkFirebaseServiceAccount(),
        checkMongoDB()
    ];
    
    let hasErrors = false;
    let hasWarnings = false;
    
    for (const result of results) {
        const icon = result.status === 'ok' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
        console.log(`${icon} ${result.name}: ${result.message}\n`);
        
        if (result.status === 'error') hasErrors = true;
        if (result.status === 'warning') hasWarnings = true;
    }
    
    console.log('=====================================\n');
    
    if (hasErrors) {
        console.log('❌ Environment check FAILED. Please fix the errors above before starting the API.\n');
        process.exit(1);
    } else if (hasWarnings) {
        console.log('⚠️  Environment check PASSED with warnings. The API will start but some features may not work correctly.\n');
        process.exit(0);
    } else {
        console.log('✅ Environment check PASSED. All required configurations are in place.\n');
        process.exit(0);
    }
}

runChecks();
