const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 6000;

app.use(cors({
    origin: '*'
}));
app.use(express.json());

async function getAccessToken() {
    try {
        const tokenRes = await fetch("http://localhost:5000/auth/accessToken", {
            method: "GET"
        });
        if (!tokenRes.ok) {
            throw new Error(`Failed to get access token: ${tokenRes.status}`);
        }
        const tokenData = await tokenRes.json();
        return tokenData.accessToken || tokenData.token || tokenData;
    } catch (err) {
        console.error("Error getting access token:", err);
        throw err;
    }
}

async function loggingMiddleware(stack, level, pkg, message) {
    try {
        const accessToken = await getAccessToken();
        const res = await fetch("http://20.244.56.144/evaluation-service/logs", {
            method: "POST",
            headers: {
                "Authorization": `${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                stack: stack,
                level: level,
                package: pkg,
                message: message
            })
        });
        if (!res.ok) {
            throw new Error(`Logging failed: ${res.status}`);
        }
        const data = await res.json();
        console.log(data);
        return data;
    }
    catch (err) {
        console.error("Error in loggingMiddleware:", err);
        throw err;
    }
}

app.post('/log', async (req, res) => {
    try {
        const { stack, level, package: pkg, message } = req.body;        
        const result = await loggingMiddleware(stack, level, pkg, message);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to send log data',
            details: error.message
        });
    }
});
app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});