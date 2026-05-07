const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: "Invalid JSON" };
    }

    if (body.event === 'charge.success' && body.data.status === 'success') {
        const userEmail = body.data.customer.email;
        console.log(`[Automation] 📥 Processing payment for: ${userEmail}`);

        const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN;
        const SITE_ID = process.env.NETLIFY_SITE_ID;

        // Diagnostic logs (safe)
        console.log(`[Automation] Token present: ${!!NETLIFY_TOKEN}`);
        console.log(`[Automation] Site ID present: ${!!SITE_ID}`);
        if (SITE_ID) {
            console.log(`[Automation] Site ID length: ${SITE_ID.length}`);
            console.log(`[Automation] Site ID starts with: ${SITE_ID.substring(0, 4)}...`);
        }

        if (!NETLIFY_TOKEN || !SITE_ID) {
            console.error("[Automation] ❌ Missing ENV vars. Please set NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID.");
            return { statusCode: 500, body: "Config Error" };
        }

        try {
            // Official Netlify API endpoint for Identity users
            const url = `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users`;
            console.log(`[Automation] 🔍 Calling Netlify API...`);

            const usersResponse = await axios.get(url, { 
                headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` }
            });

            // Handle different API response shapes
            const users = usersResponse.data.users || usersResponse.data;
            
            if (!Array.isArray(users)) {
                console.error("[Automation] ❌ Unexpected API response shape:", typeof users);
                return { statusCode: 500, body: "API Response Error" };
            }

            const user = users.find(u => u.email === userEmail);

            if (!user) {
                console.error(`[Automation] ❌ User ${userEmail} not found in Identity.`);
                return { statusCode: 404, body: "User not found" };
            }

            console.log(`[Automation] ✅ Found user ${user.id}. Upgrading...`);

            await axios.put(
                `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users/${user.id}`,
                { app_metadata: { roles: ["premium"] } },
                { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
            );

            console.log(`[Automation] 🚀 SUCCESS: ${userEmail} is now Premium.`);
            return { statusCode: 200, body: JSON.stringify({ message: "Role updated" }) };

        } catch (error) {
            console.error("[Automation] ❌ API Error Details:", error.response ? JSON.stringify(error.response.data) : error.message);
            if (error.response && error.response.status === 404) {
                console.error("[Automation] 💡 HINT: A 404 usually means the NETLIFY_SITE_ID is wrong. Ensure it's the UUID from Site Settings.");
            }
            return { statusCode: 500, body: "Internal Server Error" };
        }
    }

    return { statusCode: 200, body: "Ignored" };
};
