const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();

// MongoDB Connection String
const MONGO_URI = process.env.MONGO_URI || '';

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.log('MongoDB Connection Error (Ignored for startup):', err.message));
} else {
  console.log('MONGO_URI is not set.');
}

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Express Middlewares (Form Data & JSON ဖတ်ရန်)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session Setup
const sessionConfig = {
  secret: 'safezonetopupsecretkey123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 Days
  }
};

// MONGO_URI ရှိမှသာ Persistent MongoStore သုံးမည်
if (MONGO_URI) {
  try {
    sessionConfig.store = MongoStore.create({
      mongoUrl: MONGO_URI,
      ttl: 14 * 24 * 60 * 60
    });
  } catch (e) {
    console.log('MongoStore initialization error:', e.message);
  }
}

app.use(session(sessionConfig));

// Global User Variable for EJS Views
app.use((req, res, next) => {
  res.locals.user = req.session ? req.session.user : null;
  next();
});

// Import Admin/User Routes
try {
  const adminRoutes = require('./routes/admin');
  app.use('/', adminRoutes);
} catch (e) {
  console.log('Routes loading error:', e.message);
}

// Home Route
app.get('/', (req, res) => {
  res.render('app');
});

// Deposit Route
app.get('/deposit', (req, res) => {
  res.render('deposit');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
