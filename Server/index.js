const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect your routes here
// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('VaultBooks Backend is running');
});

const PORT = process.env.PORT || 5000;
 
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});