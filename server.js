const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();

// MongoDB Connection String
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.log('MongoDB Connection Error:', err));
} else {
  console.log('Warning: MONGO_URI is not defined in Environment Variables.');
}

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Persistent Session (MONGO_URI ရှိမှ Store ကို သုံးမည်)
const sessionConfig = {
  secret: 'safezonetopupsecretkey123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 Days
  }
};

if (MONGO_URI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: MONGO_URI,
    ttl: 14 * 24 * 60 * 60
  });
}

app.use(session(sessionConfig));

// Global User Variable for Views
app.use((req, res, next) => {
  res.locals.user = req.session ? req.session.user : null;
  next();
});

// Import Admin Routes
try {
  const adminRoutes = require('./routes/admin');
  app.use('/', adminRoutes);
} catch (e) {
  console.log('Admin routes loading skipped or not found');
}

// Default Home Route
app.get('/', (req, res) => {
  res.render('app');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
