function dB() {
  const Sequelize = require('sequelize');
  const sequelize = new Sequelize('botdb', 'test', 'test', {
    host: 'localhost',
    dialect: 'postgres',

    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },
  });

  sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });


  const Reservation = sequelize.define('reservations', {
    user_id: {
      type: Sequelize.INTEGER
    },
    table_id: {
      type: Sequelize.INTEGER
    },
    date: {
      type: Sequelize.DATE
    },
    time: {
      type: Sequelize.TIME
    }
  });

  const Reviews = sequelize.define('reviews', {
    user_id: {
      type: Sequelize.INTEGER
    },
    review: {
      type: Sequelize.STRING
    },
    user_name: {
      type: Sequelize.STRING
    }


  });

  // Reviews.sync({force: true}).then(function () {
  //   // Table created
  //   return Reviews.create({
  //     user_id: 12345,
  //     review: 'Вкусные блинчики!'
  //   });
  // });

  // Reviews.destroy({
  //   where: {
  //     user_name: null
  //     }
  // });

}

exports.dB = dB;
