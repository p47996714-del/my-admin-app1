const Item = require('../models/Item');

// Add New Item Route
router.post('/admin/add-item', async (req, res) => {
  try {
    const { game, title, price } = req.body;
    await Item.create({ game, title, price });
    res.redirect('/admin');
  } catch (err) {
    res.status(500).send("Error adding item");
  }
});
