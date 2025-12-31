const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
    } catch (err) {
        console.error("MongoDB Error:", err);
    }
};

// User Schema
const UserSchema = new mongoose.Schema({
    telegramId: String,
    balance: Number,
    pph: Number,
    lastLogin: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// GET: Load user data
app.get('/api/server', async (req, res) => {
    await connectDB();
    const { telegramId } = req.query;
    try {
        const user = await User.findOne({ telegramId });
        res.status(200).json(user || { balance: 0, pph: 0 });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST: Save user data
app.post('/api/server', async (req, res) => {
    await connectDB();
    const { telegramId, balance, pph } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { telegramId },
            { balance, pph, lastLogin: new Date() },
            { upsert: true, new: true }
        );
        res.status(200).json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = app;
