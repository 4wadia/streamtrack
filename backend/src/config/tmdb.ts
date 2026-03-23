/**
 * TMDB Configuration Helper
 * Validates TMDB tokens on startup and provides clear error messages
 */

export interface TMDBConfig {
    readAccessToken: string | undefined;
    apiKey: string | undefined;
    hasReadAccessToken: boolean;
    hasApiKey: boolean;
    isReadAccessTokenValid: boolean;
    isApiKeyValid: boolean;
    isV4Token: boolean;
    hasValidToken: boolean;
    effectiveToken: string | null;
}

/**
 * Detect if a token is a TMDB Read Access Token (V4 JWT format)
 * V4 tokens are long JWTs starting with "eyJ"
 * V3 API keys are 32-character hex strings
 */
function normalizeToken(value: string | undefined): string | undefined {
    if (!value) return undefined;

    let token = value.trim();
    token = token.replace(/^Bearer\s+/i, '');
    token = token.replace(/^['"](.*)['"]$/, '$1').trim();

    return token || undefined;
}

function isV4Format(token: string): boolean {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    return parts.every((part) => part.length > 0 && /^[A-Za-z0-9_-]+$/.test(part));
}

function isV3ApiKeyFormat(token: string): boolean {
    return /^[a-f0-9]{32}$/i.test(token);
}

/**
 * Validate and return TMDB configuration
 * Call this on startup to ensure tokens are properly configured
 */
export function validateTMDBConfig(): TMDBConfig {
    const readAccessToken = normalizeToken(process.env.TMDB_READ_ACCESS_TOKEN);
    const apiKey = normalizeToken(process.env.TMDB_API_KEY);
    const hasReadAccessToken = !!readAccessToken;
    const hasApiKey = !!apiKey;
    const isReadAccessTokenValid = readAccessToken ? isV4Format(readAccessToken) : false;
    const isApiKeyValid = apiKey ? isV3ApiKeyFormat(apiKey) : false;

    // Determine which token to use (prefer valid V4, then valid/available V3)
    let effectiveToken: string | null = null;
    if (isReadAccessTokenValid && readAccessToken) {
        effectiveToken = readAccessToken;
    } else if (isApiKeyValid && apiKey) {
        effectiveToken = apiKey;
    } else if (apiKey) {
        effectiveToken = apiKey;
    }

    const isV4Token = !!(effectiveToken && isReadAccessTokenValid && effectiveToken === readAccessToken);
    const hasValidToken = !!effectiveToken;
    
    return {
        readAccessToken,
        apiKey,
        hasReadAccessToken,
        hasApiKey,
        isReadAccessTokenValid,
        isApiKeyValid,
        isV4Token,
        hasValidToken,
        effectiveToken
    };
}

/**
 * Log TMDB token status on startup
 * Returns true if valid, false otherwise
 */
export function logTMDBStatus(): boolean {
    const config = validateTMDBConfig();
    
    if (!config.hasReadAccessToken && !config.hasApiKey) {
        console.error('❌ TMDB: No token configured');
        console.error('   Set TMDB_READ_ACCESS_TOKEN (recommended) or TMDB_API_KEY in .env');
        console.error('   Get your token at: https://www.themoviedb.org/settings/api');
        return false;
    }
    
    if (config.hasReadAccessToken) {
        if (config.isReadAccessTokenValid) {
            console.log('✅ TMDB: Read Access Token (V4) configured correctly');
        } else {
            console.warn('⚠️  TMDB: TMDB_READ_ACCESS_TOKEN appears to be in wrong format');
            console.warn('   Expected: JWT starting with "eyJ..." (V4 Read Access Token)');
            if (config.hasApiKey) {
                console.warn('   Falling back to TMDB_API_KEY (V3)');
            } else {
                console.warn('   Get it at: https://www.themoviedb.org/settings/api');
            }
        }
    }

    if (!config.hasReadAccessToken && config.hasApiKey) {
        console.log('✅ TMDB: API Key (V3) configured');
        console.log('   Consider upgrading to V4 Read Access Token for better security');
    } else if (config.hasApiKey && !config.isApiKeyValid && !config.isReadAccessTokenValid) {
        console.warn('⚠️  TMDB: TMDB_API_KEY format is unusual (expected 32-char hex)');
    }
    
    return config.hasValidToken;
}

/**
 * Get fetch headers for TMDB API based on token type
 */
export function getTMDBHeaders(): Record<string, string> {
    const config = validateTMDBConfig();
    
    const headers: Record<string, string> = {
        'Accept': 'application/json'
    };
    
    if (config.isV4Token && config.effectiveToken) {
        headers['Authorization'] = `Bearer ${config.effectiveToken}`;
    }
    
    return headers;
}

/**
 * Build TMDB API URL with proper authentication
 */
export function buildTMDBUrl(endpoint: string, params: Record<string, string> = {}): string {
    const config = validateTMDBConfig();
    const baseUrl = 'https://api.themoviedb.org/3';
    
    const searchParams = new URLSearchParams(params);
    
    // For V3 keys, add as query parameter
    if (!config.isV4Token && config.effectiveToken) {
        searchParams.set('api_key', config.effectiveToken);
    }
    
    const queryString = searchParams.toString();
    return queryString 
        ? `${baseUrl}${endpoint}?${queryString}`
        : `${baseUrl}${endpoint}`;
}
