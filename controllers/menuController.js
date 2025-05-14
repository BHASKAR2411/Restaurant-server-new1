const Menu = require('../models/Menu');

exports.createMenuItem = async (req, res) => {
  const { category, name, isVeg, price } = req.body;
  try {
    const menuItem = await Menu.create({
      category,
      name,
      isVeg,
      price,
      userId: req.user.id,
    });
    res.status(201).json(menuItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMenuItems = async (req, res) => {
  try {
    const restaurantId = req.query.restaurantId;
    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }
    const menuItems = await Menu.findAll({ where: { userId: restaurantId } });
    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { category, name, isVeg, price } = req.body;
  try {
    const menuItem = await Menu.findOne({ where: { id, userId: req.user.id } });
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    menuItem.category = category;
    menuItem.name = name;
    menuItem.isVeg = isVeg;
    menuItem.price = price;
    await menuItem.save();

    res.json(menuItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    const menuItem = await Menu.findOne({ where: { id, userId: req.user.id } });
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    await menuItem.destroy();
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};