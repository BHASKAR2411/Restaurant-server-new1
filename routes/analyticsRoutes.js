<<<<<<< HEAD
// server/routes/analyticsRoutes.js
=======
>>>>>>> 72190aeb0c040edda4804ec3f70762d4fbd05c0a
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const moment = require('moment');

router.get('/', auth, async (req, res) => {
  try {
<<<<<<< HEAD
    const { date, category } = req.query; // Optional: YYYY-MM-DD, category
    const restaurantId = req.user.id;

    // Define exists literal for filtering orders with items in the category
    const existsLiteral = category
      ? `EXISTS (
          SELECT 1
          FROM json_array_elements("items"::json) AS item
          WHERE item->>'category' = '${category.replace(/'/g, "''")}'
        )`
      : null;

    // Daily earnings (specific date or last 30 days)
=======
    const { date } = req.query; // Optional: YYYY-MM-DD
    const restaurantId = req.user.id;

    // Daily earnings and order count (last 30 days or specific date)
>>>>>>> 72190aeb0c040edda4804ec3f70762d4fbd05c0a
    let dailyWhere = {
      restaurantId,
      status: { [Op.in]: ['live', 'recurring', 'past'] },
      createdAt: {
        [Op.gte]: date
          ? moment(date).startOf('day').toDate()
          : moment().subtract(30, 'days').startOf('day').toDate(),
<<<<<<< HEAD
        [Op.lte]: date
          ? moment(date).endOf('day').toDate()
          : moment().endOf('day').toDate(),
      },
    };

    if (existsLiteral) {
      dailyWhere[Op.and] = sequelize.literal(existsLiteral);
    }

    const dailyEarningsQuery = category
      ? `
        SELECT
          DATE("Order"."createdAt") AS "date",
          COALESCE(SUM(
            (elem->>'price')::numeric * (elem->>'quantity')::integer
          ), 0) AS "total"
        FROM "Orders" AS "Order"
        CROSS JOIN LATERAL json_array_elements("items") AS elem
        WHERE ${existsLiteral ? `${existsLiteral} AND` : ''}
              "Order"."restaurantId" = :restaurantId
              AND "Order"."status" IN ('live', 'recurring', 'past')
              AND "Order"."createdAt" >= :startDate
              AND "Order"."createdAt" <= :endDate
              AND elem->>'category' = :category
        GROUP BY DATE("Order"."createdAt")
        ORDER BY DATE("Order"."createdAt") ASC
      `
      : `
        SELECT
          DATE("createdAt") AS "date",
          COALESCE(SUM("total"), 0) AS "total"
        FROM "Orders" AS "Order"
        WHERE "Order"."restaurantId" = :restaurantId
              AND "Order"."status" IN ('live', 'recurring', 'past')
              AND "Order"."createdAt" >= :startDate
              AND "Order"."createdAt" <= :endDate
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt") ASC
      `;

    const dailyEarnings = await sequelize.query(dailyEarningsQuery, {
      replacements: {
        restaurantId,
        startDate: date
          ? moment(date).startOf('day').toDate()
          : moment().subtract(30, 'days').startOf('day').toDate(),
        endDate: date
          ? moment(date).endOf('day').toDate()
          : moment().endOf('day').toDate(),
        category: category ? category.replace(/'/g, "''") : null,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    // Monthly earnings (last 12 months)
    let monthlyWhere = {
      restaurantId,
      status: { [Op.in]: ['live', 'recurring', 'past'] },
      createdAt: {
        [Op.gte]: moment().subtract(12, 'months').startOf('month').toDate(),
        [Op.lte]: moment().endOf('month').toDate(),
      },
    };

    if (existsLiteral) {
      monthlyWhere[Op.and] = sequelize.literal(existsLiteral);
    }

    const monthlyEarningsQuery = category
      ? `
        SELECT
          TO_CHAR("Order"."createdAt", 'YYYY-MM') AS "month",
          COALESCE(SUM(
            (elem->>'price')::numeric * (elem->>'quantity')::integer
          ), 0) AS "total"
        FROM "Orders" AS "Order"
        CROSS JOIN LATERAL json_array_elements("items") AS elem
        WHERE ${existsLiteral ? `${existsLiteral} AND` : ''}
              "Order"."restaurantId" = :restaurantId
              AND "Order"."status" IN ('live', 'recurring', 'past')
              AND "Order"."createdAt" >= :startDate
              AND "Order"."createdAt" <= :endDate
              AND elem->>'category' = :category
        GROUP BY TO_CHAR("Order"."createdAt", 'YYYY-MM')
        ORDER BY TO_CHAR("Order"."createdAt", 'YYYY-MM') ASC
      `
      : `
        SELECT
          TO_CHAR("createdAt", 'YYYY-MM') AS "month",
          COALESCE(SUM("total"), 0) AS "total"
        FROM "Orders" AS "Order"
        WHERE "Order"."restaurantId" = :restaurantId
              AND "Order"."status" IN ('live', 'recurring', 'past')
              AND "Order"."createdAt" >= :startDate
              AND "Order"."createdAt" <= :endDate
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
        ORDER BY TO_CHAR("createdAt", 'YYYY-MM') ASC
      `;

    const monthlyEarnings = await sequelize.query(monthlyEarningsQuery, {
      replacements: {
        restaurantId,
        startDate: moment().subtract(12, 'months').startOf('month').toDate(),
        endDate: moment().endOf('month').toDate(),
        category: category ? category.replace(/'/g, "''") : null,
      },
      type: sequelize.QueryTypes.SELECT,
    });

    // Total daily earnings
    const totalDailyQuery = category
      ? `
        SELECT
          COALESCE(SUM(
            (elem->>'price')::numeric * (elem->>'quantity')::integer
          ), 0) AS "total"
        FROM "Orders" AS "Order"
        CROSS JOIN LATERAL json_array_elements("items") AS elem
        WHERE ${existsLiteral ? `${existsLiteral} AND` : ''}
              "Order"."restaurantId" = :restaurantId
              AND "Order"."status" IN ('live', 'recurring', 'past')
              AND "Order"."createdAt" >= :startDate
              AND "Order"."createdAt" <= :endDate
              AND elem->>'category' = :category
      `
      : `
        SELECT
          COALESCE(SUM("total"), 0) AS "total"
        FROM "Orders" AS "Order"
        WHERE "Order"."restaurantId" = :restaurantId
              AND "Order"."status" IN ('live', 'recurring', 'past')
              AND "Order"."createdAt" >= :startDate
              AND "Order"."createdAt" <= :endDate
      `;

    const totalDailyResult = await sequelize.query(totalDailyQuery, {
      replacements: {
        restaurantId,
        startDate: date
          ? moment(date).startOf('day').toDate()
          : moment().subtract(30, 'days').startOf('day').toDate(),
        endDate: date
          ? moment(date).endOf('day').toDate()
          : moment().endOf('day').toDate(),
        category: category ? category.replace(/'/g, "''") : null,
      },
      type: sequelize.QueryTypes.SELECT,
    });
    const totalDaily = parseFloat(totalDailyResult[0]?.total || 0);

    // Total monthly earnings (current month)
    const totalMonthlyQuery = category
      ? `
        SELECT
          COALESCE(SUM(
            (elem->>'price')::numeric * (elem->>'quantity')::integer
          ), 0) AS "total"
        FROM "Orders" AS "Order"
        CROSS JOIN LATERAL json_array_elements("items") AS elem
        WHERE ${existsLiteral ? `${existsLiteral} AND` : ''}
              "Order"."restaurantId" = :restaurantId
              AND "Order"."status" IN ('live', 'recurring', 'past')
              AND "Order"."createdAt" >= :startMonth
              AND "Order"."createdAt" <= :endMonth
              AND elem->>'category' = :category
      `
      : `
        SELECT
          COALESCE(SUM("total"), 0) AS "total"
        FROM "Orders" AS "Order"
        WHERE "Order"."restaurantId" = :restaurantId
              AND "Order"."status" IN ('live', 'recurring', 'past')
              AND "Order"."createdAt" >= :startMonth
              AND "Order"."createdAt" <= :endMonth
      `;

    const totalMonthlyResult = await sequelize.query(totalMonthlyQuery, {
      replacements: {
        restaurantId,
        startMonth: moment().startOf('month').toDate(),
        endMonth: moment().endOf('month').toDate(),
        category: category ? category.replace(/'/g, "''") : null,
      },
      type: sequelize.QueryTypes.SELECT,
    });
    const totalMonthly = parseFloat(totalMonthlyResult[0]?.total || 0);

    // Daily and monthly order counts
    const dailyOrderCount = await Order.count({ where: dailyWhere });
=======
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
>>>>>>> 72190aeb0c040edda4804ec3f70762d4fbd05c0a
    const monthlyOrderCount = await Order.count({
      where: {
        restaurantId,
        status: { [Op.in]: ['live', 'recurring', 'past'] },
        createdAt: {
          [Op.gte]: moment().startOf('month').toDate(),
          [Op.lte]: moment().endOf('month').toDate(),
        },
<<<<<<< HEAD
        ...(existsLiteral ? { [Op.and]: sequelize.literal(existsLiteral) } : {}),
=======
>>>>>>> 72190aeb0c040edda4804ec3f70762d4fbd05c0a
      },
    });

    res.json({
      dailyEarnings: dailyEarnings.map((e) => ({
<<<<<<< HEAD
        date: e.date,
        total: parseFloat(e.total || 0),
      })),
      monthlyEarnings: monthlyEarnings.map((e) => ({
        month: e.month,
        total: parseFloat(e.total || 0),
      })),
      totalDaily,
      totalMonthly,
      dailyOrderCount,
      monthlyOrderCount,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
=======
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
>>>>>>> 72190aeb0c040edda4804ec3f70762d4fbd05c0a
  }
});

module.exports = router;