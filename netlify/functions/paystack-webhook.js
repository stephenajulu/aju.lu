const axios = require('axios');

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

    // 2. Local Simulation or Post-Checkout Success
    // This allows the site to "Ask" the function to verify a user immediately
    if (event.httpMethod === "GET") {
        const email = event.queryStringParameters.email;
        if (!email) return { statusCode: 400, body: "Email required" };
        
        try {
            const usersResponse = await axios.get(
                `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users`,
                { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
            );
            const user = usersResponse.data.users.find(u => u.email === email);
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
        let body;
        try {
            body = JSON.parse(event.body);
        } catch (e) {
            return { statusCode: 400, body: "Invalid JSON" };
        }

        if (body.event === 'charge.success' && body.data.status === 'success') {
            const userEmail = body.data.customer.email;
            console.log(`[Automation] 💳 Payment Success: ${userEmail}`);

            try {
                // Find User
                const usersResponse = await axios.get(
                    `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users`,
                    { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
                );
                const user = usersResponse.data.users.find(u => u.email === userEmail);

                if (user) {
                    // Update Role
                    await axios.put(
                        `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users/${user.id}`,
                        { app_metadata: { roles: ["premium"] } },
                        { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
                    );
                    console.log(`[Automation] 🚀 Upgraded ${userEmail}`);
                    return { statusCode: 200, body: "Success" };
                }
            } catch (error) {
                console.error("[Automation] Error:", error.message);
                return { statusCode: 500, body: "Error" };
            }
        }
    }

    return { statusCode: 200, body: "Handled" };
};
