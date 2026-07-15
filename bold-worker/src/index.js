const JSON_HEADERS = {
    'Content-Type': 'application/json; charset=utf-8'
};

const SHIPPING_COST = 10000;
const PRODUCT_PRICES = Object.freeze({
    C1000: 14000, C1001: 15000, C1002: 15000, C1003: 16000, C1004: 18000,
    P1005: 50000, P1006: 54000, P1007: 54000, P1008: 58000, P1009: 66000,
    P1010: 192000, P1011: 192000, P1012: 192000, P1013: 192000, P1014: 192000,
    M1015: 35000, M1016: 120000, M1017: 45000
});

function createCorsHeaders(origin, allowedOrigin) {
    return {
        ...JSON_HEADERS,
        'Access-Control-Allow-Origin': origin === allowedOrigin ? origin : allowedOrigin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin'
    };
}

function jsonResponse(body, status, headers) {
    return new Response(JSON.stringify(body), { status, headers });
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

async function sha256(value) {
    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)]
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const origin = request.headers.get('Origin') || '';
        const allowedOrigin = env.ALLOWED_ORIGIN || 'https://raydan08x.github.io';
        const headers = createCorsHeaders(origin, allowedOrigin);

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers });
        }

        if (url.pathname !== '/bold/signature' || request.method !== 'POST') {
            return jsonResponse({ error: 'Not found' }, 404, headers);
        }

        if (origin !== allowedOrigin) {
            return jsonResponse({ error: 'Origin not allowed' }, 403, headers);
        }

        if (!env.BOLD_SECRET_KEY) {
            return jsonResponse({ error: 'Server is not configured' }, 500, headers);
        }

        let payload;
        try {
            payload = await request.json();
        } catch (error) {
            return jsonResponse({ error: 'Invalid JSON' }, 400, headers);
        }

        const { orderId, items, currency } = payload;
        const amount = calculateAmount(items);

        if (!isValidOrderId(orderId)) {
            return jsonResponse({ error: 'Invalid orderId' }, 400, headers);
        }

        if (!Number.isSafeInteger(amount) || amount < 1000 || amount > 10000000) {
            return jsonResponse({ error: 'Invalid amount' }, 400, headers);
        }

        if (currency !== 'COP') {
            return jsonResponse({ error: 'Invalid currency' }, 400, headers);
        }

        const integritySignature = await sha256(
            `${orderId}${amount}${currency}${env.BOLD_SECRET_KEY}`
        );

        return jsonResponse({ integritySignature, amount }, 200, headers);
    }
};
