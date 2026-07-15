import http from 'node:http';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const PORT = Number(process.env.PORT || 3102);
const SHIPPING_COST = 10000;
const MAX_BODY_SIZE = 32 * 1024;
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 1000;
const ALLOWED_ORIGINS = new Set(
    (process.env.ALLOWED_ORIGINS || 'https://raydan08x.github.io')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
);
const PRODUCT_PRICES = JSON.parse(
    readFileSync(new URL('./catalog.json', import.meta.url), 'utf8')
);
const BOLD_SECRET_KEY = (() => {
    const credentialsDirectory = process.env.CREDENTIALS_DIRECTORY;
    if (!credentialsDirectory) return '';

    try {
        return readFileSync(`${credentialsDirectory}/BOLD_SECRET_KEY`, 'utf8').trim();
    } catch (error) {
        return '';
    }
})();
const rateLimits = new Map();

function isPrivateOrLocalHostname(hostname) {
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return true;
    if (/^10\./.test(hostname) || /^192\.168\./.test(hostname)) return true;

    const match172 = hostname.match(/^172\.(\d{1,3})\./);
    if (match172 && Number(match172[1]) >= 16 && Number(match172[1]) <= 31) return true;

    const matchTailscale = hostname.match(/^100\.(\d{1,3})\./);
    return Boolean(matchTailscale && Number(matchTailscale[1]) >= 64 && Number(matchTailscale[1]) <= 127);
}

function isAllowedOrigin(origin) {
    if (ALLOWED_ORIGINS.has(origin)) return true;

    try {
        const parsedOrigin = new URL(origin);
        return parsedOrigin.protocol === 'http:' && isPrivateOrLocalHostname(parsedOrigin.hostname);
    } catch (error) {
        return false;
    }
}

function corsHeaders(origin) {
    return {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : 'null',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin',
        'Cache-Control': 'no-store'
    };
}

function sendJson(response, status, body, origin = '') {
    response.writeHead(status, corsHeaders(origin));
    response.end(JSON.stringify(body));
}

function isRateLimited(request) {
    const ip = request.headers['cf-connecting-ip'] || request.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimits.get(ip);

    if (!entry || now - entry.startedAt >= RATE_WINDOW_MS) {
        rateLimits.set(ip, { count: 1, startedAt: now });
        return false;
    }

    entry.count += 1;
    return entry.count > RATE_LIMIT;
}

function readJson(request) {
    return new Promise((resolve, reject) => {
        let body = '';
        request.setEncoding('utf8');
        request.on('data', (chunk) => {
            body += chunk;
            if (body.length > MAX_BODY_SIZE) {
                reject(new Error('BODY_TOO_LARGE'));
                request.destroy();
            }
        });
        request.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new Error('INVALID_JSON'));
            }
        });
        request.on('error', reject);
    });
}

function isValidOrderId(value) {
    return typeof value === 'string'
        && value.length <= 60
        && /^[A-Za-z0-9_-]+$/.test(value);
}

function calculateAmount(items) {
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) return null;

    let subtotal = 0;
    for (const item of items) {
        const price = PRODUCT_PRICES[item?.id];
        const quantity = Number(item?.quantity);
        if (!price || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 50) return null;
        subtotal += price * quantity;
    }

    return subtotal + SHIPPING_COST;
}

const server = http.createServer(async (request, response) => {
    const origin = request.headers.origin || '';
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

    if (request.method === 'OPTIONS') {
        response.writeHead(204, corsHeaders(origin));
        response.end();
        return;
    }

    if (url.pathname === '/health' && request.method === 'GET') {
        sendJson(response, 200, {
            status: 'ok',
            configured: Boolean(BOLD_SECRET_KEY)
        }, origin);
        return;
    }

    if (url.pathname !== '/bold/signature' || request.method !== 'POST') {
        sendJson(response, 404, { error: 'Not found' }, origin);
        return;
    }

    if (!isAllowedOrigin(origin)) {
        console.warn(`Rejected payment origin: ${origin || '(empty)'}`);
        sendJson(response, 403, { error: 'Origin not allowed' }, origin);
        return;
    }

    if (isRateLimited(request)) {
        sendJson(response, 429, { error: 'Too many requests' }, origin);
        return;
    }

    if (!BOLD_SECRET_KEY) {
        sendJson(response, 503, { error: 'Payment service is not configured' }, origin);
        return;
    }

    let payload;
    try {
        payload = await readJson(request);
    } catch (error) {
        sendJson(response, 400, { error: 'Invalid request' }, origin);
        return;
    }

    const { orderId, currency, items } = payload;
    const amount = calculateAmount(items);

    if (!isValidOrderId(orderId) || currency !== 'COP' || !Number.isSafeInteger(amount)) {
        sendJson(response, 400, { error: 'Invalid payment data' }, origin);
        return;
    }

    if (amount < 1000 || amount > 10000000) {
        sendJson(response, 400, { error: 'Amount outside allowed range' }, origin);
        return;
    }

    const integritySignature = createHash('sha256')
        .update(`${orderId}${amount}${currency}${BOLD_SECRET_KEY}`, 'utf8')
        .digest('hex');

    sendJson(response, 200, { integritySignature, amount }, origin);
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Bold signature service listening on 127.0.0.1:${PORT}`);
});
