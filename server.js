const express = require('express');
const cors = require('cors'); // 1. Import CORS
const app = express();

app.use(cors()); // 2. Enable CORS for all origins
app.use(express.json());

// ... rest of your server code

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB (use MongoDB Atlas for hosting)
mongoose.connect('your_mongodb_connection_string');

const UserSchema = new mongoose.Schema({
    telegramId: String,
    balance: Number,
    pph: Number,
    lastLogin: Date
});

const User = mongoose.model('User', UserSchema);

// Endpoint to sync data
app.post('/api/sync', async (req, res) => {
    const { telegramId, balance, pph } = req.body;
    let user = await User.findOneAndUpdate(
        { telegramId },
        { balance, pph, lastLogin: new Date() },
        { upsert: true, new: true }
    );
    res.json(user);
});

app.listen(3000, () => console.log('Server running on port 3000'));