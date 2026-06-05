const https = require('https');
const crypto = require('crypto');

// Custom native HTTPS request wrapper to avoid external dependencies
function makeRequest(url, options = {}, postData = null) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const reqOptions = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        if (postData) {
            reqOptions.headers['Content-Type'] = 'application/json';
            reqOptions.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = https.request(reqOptions, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve({ data: JSON.parse(body), statusCode: res.statusCode });
                    } catch (e) {
                        resolve({ data: body, statusCode: res.statusCode });
                    }
                } else {
                    reject(new Error(`Request failed with status ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

exports.handler = async (event) => {
    // Return early if no body
    if (!event.body) {
        return { statusCode: 400, body: "Missing body" };
    }

    const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN;
    const SITE_ID = process.env.NETLIFY_SITE_ID;

    // 1. Validation Logic for Site IDs
    if (!NETLIFY_TOKEN || !SITE_ID) {
        console.error("[Auth] Missing configuration");
        return { statusCode: 500, body: "Server configuration error" };
    }

    // Helper: Paginated User Lookup
    const findUserByEmail = async (email) => {
        let page = 1;
        let foundUser = null;
        let hasMore = true;

        while (hasMore && !foundUser) {
            try {
                const response = await makeRequest(
                    `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users?page=${page}&per_page=100`,
                    { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
                );
                const pageUsers = response.data.users || [];
                foundUser = pageUsers.find(u => u.email === email);
                
                if (pageUsers.length < 100) {
                    hasMore = false;
                } else {
                    page++;
                }
            } catch (err) {
                console.error(`[Identity] Error fetching page ${page}:`, err.message);
                hasMore = false;
            }
        }
        return foundUser;
    };

    // 2. Local Simulation or Post-Checkout Success (GET)
    if (event.httpMethod === "GET") {
        const email = event.queryStringParameters.email;
        if (!email) return { statusCode: 400, body: "Email required" };
        
        try {
            const user = await findUserByEmail(email);
            if (!user) return { statusCode: 404, body: "User not found" };
            
            return { 
                statusCode: 200, 
                body: JSON.stringify({ roles: user.app_metadata.roles || [] }) 
            };
        } catch (e) {
            return { statusCode: 500, body: e.message };
        }
    }

    // 3. Webhook Logic (POST)
    if (event.httpMethod === "POST") {
        // Validate Paystack signature
        const headers = event.headers || {};
        const signature = headers['x-paystack-signature'] || headers['X-Paystack-Signature'];
        
        if (!signature) {
            console.warn("[Auth] Webhook called without signature header");
            return { statusCode: 401, body: "Signature missing" };
        }

        const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
                           .update(event.body)
                           .digest('hex');

        if (hash !== signature) {
            console.error("[Auth] Webhook signature verification failed");
            return { statusCode: 401, body: "Invalid signature" };
        }

        let body;
        try {
            body = JSON.parse(event.body);
        } catch (e) {
            return { statusCode: 400, body: "Invalid JSON" };
        }

        if (body.event === 'charge.success' && body.data.status === 'success') {
            const userEmail = body.data.customer.email;
            console.log(`[Automation] 💳 Verified Paystack Payment: ${userEmail}`);

            try {
                // Find User (with pagination safety)
                const user = await findUserByEmail(userEmail);

                if (user) {
                    // Update Role
                    await makeRequest(
                        `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users/${user.id}`,
                        { 
                            method: 'PUT',
                            headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } 
                        },
                        JSON.stringify({ app_metadata: { roles: ["premium"] } })
                    );
                    console.log(`[Automation] 🚀 Upgraded ${userEmail} to premium`);
                    return { statusCode: 200, body: "Success" };
                } else {
                    console.warn(`[Automation] User not found in Netlify Identity: ${userEmail}`);
                    return { statusCode: 404, body: "User not found" };
                }
            } catch (error) {
                console.error("[Automation] Error updating role:", error.message);
                return { statusCode: 500, body: "Error updating role" };
            }
        }
    }

    return { statusCode: 200, body: "Handled" };
};
