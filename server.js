const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();

// MongoDB Connection String
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://admin:admin123@cluster0.mongodb.net/topupapp?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Express Middlewares (Form data & JSON ဖတ်ရန် - Login/Register အတွက် လိုအပ်သည်)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Persistent Session Configuration (၁၄ ရက်ကြာ Login မှတ်ထားမည်)
app.use(session({
  secret: 'safezonetopupsecretkey123',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    ttl: 14 * 24 * 60 * 60 // 14 Days
  }),
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 Days
  }
}));

// Global User Variable for EJS Views
app.use((req, res, next) => {
  res.locals.user = req.session ? req.session.user : null;
  next();
});

// Import Admin & User Routes (Login, Register & Admin Panel)
const adminRoutes = require('./routes/admin');
app.use('/', adminRoutes);

// Home Page Route
app.get('/', (req, res) => {
  res.render('app');
});

// Deposit Page Route
app.get('/deposit', (req, res) => {
  res.render('deposit');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
