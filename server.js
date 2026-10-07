require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/topup_db';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error(err));

// Database Schemas
const UserSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  password: String,
  balance: { type: Number, default: 0 },
  points: { type: Number, default: 0 }
});

const DepositSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  userName: String,
  amount: Number,
  method: String,
  status: { type: String, default: 'Pending' }, // Pending, Approved, Rejected
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Deposit = mongoose.model('Deposit', DepositSchema);

// App Routes
app.get('/', (req, res) => res.render('app'));

// Register API
app.post('/api/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const user = await User.create({ name, phone, password });
    res.json({ success: true, user });
  } catch (err) {
    res.json({ success: false, message: 'ဖုန်းနံပါတ် ရှိပြီးသားဖြစ်နေပါသည်' });
  }
});

// Login API
app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone, password });
  if (user) {
    res.json({ success: true, user });
  } else {
    res.json({ success: false, message: 'ဖုန်းနံပါတ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်' });
  }
});

// Deposit Request API
app.post('/api/deposit', async (req, res) => {
  const { userId, userName, amount, method } = req.body;
  await Deposit.create({ userId, userName, amount, method });
  res.json({ success: true, message: 'ငွေဖြည့်တောင်းဆိုမှု အောင်မြင်ပါသည်။ Admin စစ်ဆေးပေးပါမည်။' });
});

// Admin Panel Page
app.get('/admin', async (req, res) => {
  const deposits = await Deposit.find().sort({ createdAt: -1 });
  const users = await User.find();
  res.render('admin', { deposits, users });
});

// Admin Approve Deposit
app.post('/admin/approve-deposit/:id', async (req, res) => {
  const deposit = await Deposit.findById(req.params.id);
  if (deposit && deposit.status === 'Pending') {
    deposit.status = 'Approved';
    await deposit.save();
    
    // Add balance to User
    await User.findByIdAndUpdate(deposit.userId, { $inc: { balance: deposit.amount } });
  }
  res.redirect('/admin');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
