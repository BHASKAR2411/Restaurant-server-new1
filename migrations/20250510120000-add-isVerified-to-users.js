'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'planType', {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        isIn: [['free_trial', '1_month', '6_months', '1_year']],
      },
    });

    await queryInterface.addColumn('Users', 'planStartDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'planEndDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'hasUsedFreeTrial', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'planType');
    await queryInterface.removeColumn('Users', 'planStartDate');
    await queryInterface.removeColumn('Users', 'planEndDate');
    await queryInterface.removeColumn('Users', 'hasUsedFreeTrial');
  },
};