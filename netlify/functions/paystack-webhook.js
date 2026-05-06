const axios = require('axios');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const body = JSON.parse(event.body);

    // 1. Verify it's a successful payment from Paystack
    if (body.event === 'charge.success' && body.data.status === 'success') {
        const userEmail = body.data.customer.email;
        console.log(`[Automation] Payment success received for: ${userEmail}`);

        const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN;
        const SITE_ID = process.env.NETLIFY_SITE_ID; // Updated from SITE_ID to avoid reserved conflict

        if (!NETLIFY_TOKEN || !SITE_ID) {
            console.error("[Automation] Error: Missing Environment Variables (NETLIFY_AUTH_TOKEN or NETLIFY_SITE_ID)");
            return { statusCode: 500, body: "Internal Server Error" };
        }

        try {
            // 2. Fetch all users from Netlify Identity
            const usersResponse = await axios.get(
                `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users`,
                { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
            );

            const user = usersResponse.data.find(u => u.email === userEmail);

            if (!user) {
                console.error(`[Automation] User not found in Identity for email: ${userEmail}`);
                return { statusCode: 404, body: "User not found" };
            }

            // 3. Add the 'premium' role to the user's account
            await axios.put(
                `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users/${user.id}`,
                { app_metadata: { roles: ["premium"] } },
                { headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` } }
            );

            console.log(`[Automation] SUCCESS: ${userEmail} upgraded to premium.`);
            return { statusCode: 200, body: JSON.stringify({ message: "Role updated" }) };

        } catch (error) {
            console.error("[Automation] Netlify API Error:", error.response ? error.response.data : error.message);
            return { statusCode: 500, body: "Error updating user" };
        }
    }

    return { statusCode: 200, body: "Event ignored" };
};
