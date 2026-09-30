require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const dashboardRoutes = require('./routes/dashboard');
const budgetRoutes = require('./routes/budget');
const recurringRoutes = require('./routes/recurring');
const reportRoutes = require('./routes/reports');
const lifestyleRoutes = require('./routes/lifestyle');
const targetRoutes = require('./routes/targets');
const insightRoutes = require('./routes/insights');
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/lifestyle', lifestyleRoutes);
app.use('/api/targets', targetRoutes);
app.use('/api/insights', insightRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Ghar Ka Hisaab backend running on port ${PORT}`));
