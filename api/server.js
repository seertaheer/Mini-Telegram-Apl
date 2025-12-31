const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection logic for Serverless
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

const UserSchema = new mongoose.Schema({
    telegramId: String,
    balance: Number,
    pph: Number,
    lastLogin: Date
});

const User = mongoose.model('User', UserSchema);

// The Sync Route
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

// CRITICAL: Export for Vercel
module.exports = app;
