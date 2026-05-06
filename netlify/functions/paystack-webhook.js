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

    // 1. Verify it's a successful payment from Paystack
    if (body.event === 'charge.success' && body.data.status === 'success') {
        const userEmail = body.data.customer.email;
        console.log(`[Automation] 📥 Signal received for: ${userEmail}`);

        const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN;
        const SITE_ID = process.env.NETLIFY_SITE_ID;

        if (!NETLIFY_TOKEN || !SITE_ID) {
            console.error("[Automation] ❌ CRITICAL: Missing ENV vars. Check NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID.");
            return { statusCode: 500, body: "Server configuration error" };
        }

        try {
            // 2. Fetch users from Netlify Identity
            // Note: Netlify returns { users: [...], total: X }
            console.log(`[Automation] 🔍 Searching for user in Identity...`);
            const usersResponse = await axios.get(
                `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users`,
                { 
                    headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` },
                    params: { filter: userEmail } // Optimization: ask Netlify to filter by email
                }
            );

            // Access the .users array from the response object
            const userList = usersResponse.data.users || usersResponse.data;
            const user = Array.isArray(userList) ? userList.find(u => u.email === userEmail) : null;

            if (!user) {
                console.error(`[Automation] ❌ User NOT FOUND in database for email: ${userEmail}`);
                return { statusCode: 404, body: "User not found in site database" };
            }

            console.log(`[Automation] ✅ Found user: ${user.id}. Upgrading role...`);

            // 3. Add the 'premium' role
            await axios.put(
                `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users/${user.id}`,
                { app_metadata: { roles: ["premium"] } },
                { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
            );

            console.log(`[Automation] 🚀 SUCCESS: ${userEmail} is now a Premium Member.`);
            return { statusCode: 200, body: JSON.stringify({ message: "Role updated" }) };

        } catch (error) {
            const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
            console.error("[Automation] ❌ API Error:", errorMsg);
            return { statusCode: 500, body: `Internal error: ${error.message}` };
        }
    }

    console.log("[Automation] ⏩ Event ignored (not a successful charge).");
    return { statusCode: 200, body: "Event ignored" };
};
