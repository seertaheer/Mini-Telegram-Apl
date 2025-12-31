const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. DATABASE CONNECTION
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
    }
};

// 2. USER MODEL (Fixed to prevent "OverwriteModelError")
const UserSchema = new mongoose.Schema({
    telegramId: String,
    balance: Number,
    pph: Number,
    lastLogin: Date
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// 3. GET ROUTE (This fixes the "Cannot GET" error in browser)
app.get('/api/server', (req, res) => {
    res.status(200).send("✅ API is live! Send a POST request to sync data.");
});

// 4. POST ROUTE (The Sync Route)
app.post('/api/server', async (req, res) => {
    await connectDB();
    const { telegramId, balance, pph } = req.body;
    
    try {
        let user = await User.findOneAndUpdate(
            { telegramId },
            { balance, pph, lastLogin: new Date() },
            { upsert: true, new: true }
        );
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = app;
