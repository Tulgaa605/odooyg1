require('dotenv').config();
const express = require('express');
const apiRoutes = require('./routes/api');
const path = require('path');

const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://192.168.88.201:${PORT}`);
});