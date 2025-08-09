require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();


app.use(cors());
app.use(express.json());

//Import semua Routes
const authRoutes = require('./routes/authRoutes');
const certificateRoutes = require('./routes/certificateRoutes');

// Pakai semua routes
app.use('/api/auth', authRoutes);
app.use('/api/certificate', certificateRoutes);


//port listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { //0.0.0.0 , () agar bisa di akses device lain
  console.log(`Server running on port ${PORT}`);
});
