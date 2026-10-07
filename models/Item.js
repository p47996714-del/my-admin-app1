const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  game: { 
    type: String, 
    required: true 
  }, // e.g., 'MLBB', 'PUBG'
  title: { 
    type: String, 
    required: true 
  }, // e.g., '86 Diamonds', '60 UC'
  price: { 
    type: Number, 
    required: true 
  }, // e.g., 3500
  image: { 
    type: String 
  }
});

module.exports = mongoose.model('Item', itemSchema);
