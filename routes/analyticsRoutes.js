const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const moment = require('moment');

router.get('/', auth, async (req, res) => {
  try {
    const { date } = req.query; // Optional: YYYY-MM-DD
    const restaurantId = req.user.id;

    // Daily earnings and order count (last 30 days or specific date)
    let dailyWhere = {
      restaurantId,
      status: { [Op.in]: ['live', 'recurring', 'past'] },
      createdAt: {
        [Op.gte]: date
          ? moment(date).startOf('day').toDate()
          : moment().subtract(30, 'days').startOf('day').toDate(),
        [Op.lte]: date ? moment(date).endOf('day').toDate() : moment().endOf('day').toDate(),
      },
    };

    const dailyEarnings = await Order.findAll({
      where: dailyWhere,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total'],
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
    });

    // Monthly earnings (last 12 months)
    const monthlyEarnings = await Order.findAll({
      where: {
        restaurantId,
        status: { [Op.in]: ['live', 'recurring', 'past'] },
        createdAt: {
          [Op.gte]: moment().subtract(12, 'months').startOf('month').toDate(),
          [Op.lte]: moment().endOf('month').toDate(),
        },
      },
      attributes: [
        [sequelize.fn('TO_CHAR', sequelize.col('createdAt'), 'YYYY-MM'), 'month'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total'],
      ],
      group: [sequelize.fn('TO_CHAR', sequelize.col('createdAt'), 'YYYY-MM')],
      order: [[sequelize.fn('TO_CHAR', sequelize.col('createdAt'), 'YYYY-MM'), 'ASC']],
    });

    // Total daily and monthly earnings and order counts
    const totalDaily = await Order.sum('total', { where: dailyWhere });
    const dailyOrderCount = await Order.count({ where: dailyWhere });
    const totalMonthly = await Order.sum('total', {
      where: {
        restaurantId,
        status: { [Op.in]: ['live', 'recurring', 'past'] },
        createdAt: {
          [Op.gte]: moment().startOf('month').toDate(),
          [Op.lte]: moment().endOf('month').toDate(),
        },
      },
    });
    const monthlyOrderCount = await Order.count({
      where: {
        restaurantId,
        status: { [Op.in]: ['live', 'recurring', 'past'] },
        createdAt: {
          [Op.gte]: moment().startOf('month').toDate(),
          [Op.lte]: moment().endOf('month').toDate(),
        },
      },
    });

    res.json({
      dailyEarnings: dailyEarnings.map((e) => ({
        date: e.get('date'),
        total: parseFloat(e.get('total') || 0),
      })),
      monthlyEarnings: monthlyEarnings.map((e) => ({
        month: e.get('month'),
        total: parseFloat(e.get('total') || 0),
      })),
      totalDaily: parseFloat(totalDaily || 0),
      totalMonthly: parseFloat(totalMonthly || 0),
      dailyOrderCount: dailyOrderCount || 0,
      monthlyOrderCount: monthlyOrderCount || 0,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;