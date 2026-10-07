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
// A single-origin CORS config (just CLIENT_URL) only allows the deployed web app.
// The Capacitor native app is a DIFFERENT origin — Android WebViews serve the app
// from 'http://localhost', iOS from 'capacitor://localhost' — neither matches a
// Vercel URL, so every request from the installed app was being blocked by CORS.
// That shows up exactly as reported: works fine in the browser (Vercel origin
// matches), fails in the emulator with no useful error (a CORS rejection has no
// response body, so the frontend falls back to its generic "Login failed. Please
// try again." message) — the request never even reaches the route handler.

const allowedOrigins = [
  process.env.CLIENT_URL, // your deployed web app, e.g. https://ghar-ka-hisaab.vercel.app
  'http://localhost', // Capacitor Android WebView origin
  'capacitor://localhost', // Capacitor iOS WebView origin
  'https://localhost', // some Capacitor configs use this scheme instead
  'http://localhost:5173', // local Vite dev server
].filter(Boolean);

// app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header at all (curl, Postman, server-to-server calls) is allowed —
      // only browser/WebView-originated requests send an Origin header to check.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
  })
);
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
