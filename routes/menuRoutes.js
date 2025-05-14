const express = require('express');
const { createMenuItem, getMenuItems, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const yup = require('yup');

const router = express.Router();

const menuSchema = yup.object().shape({
  category: yup.string().required('Category is required'),
  name: yup.string().required('Name is required'),
  isVeg: yup.boolean().required('Veg/non-veg status is required'),
  price: yup.number().positive('Price must be positive').required('Price is required'),
});

router.post('/', auth, validate(menuSchema), createMenuItem);
router.get('/', getMenuItems); // Public for clients, filtered by restaurantId
router.put('/:id', auth, validate(menuSchema), updateMenuItem);
router.delete('/:id', auth, deleteMenuItem);

module.exports = router;