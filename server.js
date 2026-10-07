require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Item = require('./models/Item');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/myitemdb';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

app.get('/', (req, res) => res.redirect('/admin'));

app.get('/admin', async (req, res) => {
  const items = await Item.find().sort({ createdAt: -1 });
  res.render('admin', { items });
});

app.post('/admin/add', async (req, res) => {
  const { name, price, description } = req.body;
  await Item.create({ name, price, description });
  res.redirect('/admin');
});

app.post('/admin/delete/:id', async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.redirect('/admin');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
