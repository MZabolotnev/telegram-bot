var TelegramBot = require('node-telegram-bot-api');
var Data = require('./data/data_ru.json');
    var token = '443479603:AAFPkbdY9IoantpLfCyl10ltwPyZfCoOpKg';
    var bot = new TelegramBot(token, {polling: true});





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
var location = {
  latitude: '49.4321835',
  longitude: '32.0827'
};
var tables = [
  {id: 1, seats: 2},
  {id: 2, seats: 2},
  {id: 3, seats: 2},
  {id: 4, seats: 2},
  {id: 5, seats: 4},
  {id: 6, seats: 4},
  {id: 7, seats: 8},
  {id: 8, seats: 8}
]


//в базу:
var user_id;
var state;
var date;
var free_tables;
var currentDate = new Date;
var id_edit_message;
var dinamic_menu = {
  reply_markup: {
    inline_keyboard: []
  }
};


function temporaryDelete() {
  date = '';
  free_tables = [];
  suit_tables = [];
  dinamic_menu.reply_markup.inline_keyboard = []
}

var handlers = {
status:
  {
    start: (msg) => bot.sendMessage(msg.from.id, 'Приветствую вас! Что изволите?', getData(Data.MainMenu)),
    booking: (msg) => bot.sendMessage(msg.from.id, 'Бронировать стол, или отменить бронь?', getData(Data.Booking)),
    booking_new: (msg) => bot.sendMessage(msg.from.id, 'Подтвердить бронь, или выбрать другую дату?', getData(Data.Booking_new)),
    booking_cancel_confirm: (msg) => bot.sendMessage(msg.from.id, 'Подтвердить отмену, или выбрать другую дату?', getData(Data.Booking_cancel_confirm)),
    booking_how_many_persons: (msg) => bot.sendMessage(msg.from.id, 'Eсть свободные столы! Сколько персон ожидать?', getData(Data.Booking__how_many_persons)),
    booking_table_choise: (msg) => bot.sendMessage(msg.from.id, 'Выберите доступный столик', dinamic_menu),
    find: (msg) => bot.sendMessage(msg.from.id, 'Построить маршрут для вас?', getData(Data.Find))

  }
}






function getData(data) {
  return options = {
    reply_markup: JSON.stringify({
      inline_keyboard: data
    })
 };
}


function getKalendarkeyboard() {
  var date = currentDate;
  var options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
    };
  var day = new Date();
  function nextDate(n) {
    day.setDate(currentDate.getDate()+ n);
    return day.toLocaleString("ru", options);
  }
  var inline_keyboard = [
    [{text: date.toLocaleString("ru", options) , callback_data: date.toLocaleString("ru", options)}],
    [{text: nextDate(1) , callback_data: nextDate(1)}],
    [{text: nextDate(2) , callback_data: nextDate(2)}],
    [{text: nextDate(3) , callback_data: nextDate(3)}],
    [{text: nextDate(4) , callback_data: nextDate(4)}],
    [{text: 'Следующие 5 дней:  ' , callback_data: 'next_date'}]
  ];
  var check_date = new Date();
  if (currentDate.toLocaleString("ru", options) !== check_date.toLocaleString("ru", options)) {
    inline_keyboard.unshift(
      [{text: 'Предыдущие 5 дней:' , callback_data: 'prev_date'}]
    );
  }
  var keyboard = {
    reply_markup: JSON.stringify({
      inline_keyboard: inline_keyboard
    })
 };
 return keyboard;
}




bot.on('message', msg => {
  if (state == 'review') {
    console.log(msg);
    Reviews.create({
    user_id: user_id,
    user_name: msg.from.first_name,
    review: msg.text
  }).then(Reviews => {
      bot.sendMessage(msg.chat.id, 'Спасибо за отзыв!');
      state = "start";
      handlers.status[state](msg);
    });
  }
  else if (state == 'find') {
    var options = {
      parse_mode: 'HTML'
    }
    var userLocation = msg.location.latitude + ',' + msg.location.longitude;
    var link = 'https://www.google.com/maps/dir/'+userLocation+'/'+location.latitude +','+location.longitude +'/'+'@49.4354351,32.0818147,15z/data=!3m1!4b1'
    // var link = '<a href="http://www.example.com/">inline URL</a>'
    var text = '<a href="'  +  link +  '">Перейти к Google Maps</a>'
    bot.sendMessage(msg.chat.id, text, options ).then(message=>{
      state = "start";
      handlers.status[state](msg);
    });

  }
});



 bot.onText(/\/start/, function (msg, match) {
     state = "start";
     user_id = msg.from.id;
     handlers.status[state](msg, match);
 });



 bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const choice = callbackQuery.data;
    console.log('каллбэк:', choice)
    console.log('состояние:', state)
    if (choice === 'review') {
      bot.sendMessage(callbackQuery.from.id, 'Просто напишите отзыв тут');
      state = 'review';
    }
    else if (choice === 'menu') {
        var photo = 'assets/menu.jpg';
        bot.sendPhoto(callbackQuery.from.id, photo, {caption: 'Наше меню'})
            .then(
              result => {
                state = 'start';
                handlers.status[state](callbackQuery);
              },
              error => {console.log(error)}
            );
    }
    else if (choice === 'booking') {
      state = 'booking';
      handlers.status[state](callbackQuery);
    }
    else if (choice === 'find_route') {

      bot.sendMessage(user_id, 'Прикрепите вашу геолокацию в сообщении, пожалуйста' );

    }
//"Find"
    else if (choice === 'find' ) {
      state = 'find';
      bot.sendLocation(callbackQuery.from.id, location.latitude, location.longitude);
      bot.sendMessage(callbackQuery.from.id, "Бар тут :)").then(msg=>{
        handlers.status[state](callbackQuery)
      });
    }
// "Find_route"
    else if (choice === 'find_route') {
      bot.sendMessage(callbackQuery.from.id, "Прикрепите ваше метоположение");
    }
// "Booking"
    else if (choice === 'booking_new') {
      state = 'booking_new';
      bot.sendMessage(user_id, 'Выберите дату визита:', getKalendarkeyboard()).then(result => {
      message_id = result.message_id;
      state = 'booking_choise_date'
      })
    }
    else if (choice === 'booking_cancel') {
      state = 'booking_cancel';
      Reservation.findAll({
              where: {
                user_id: user_id
                }
            }).then(reservations => {
              if (reservations.length == 0) {
                state = "start";
                bot.sendMessage(user_id, 'Вы еще ничего у нас не бронировали :)')
                handlers.status[state](callbackQuery);
                }
              else {
                state = 'booking_cancel_del'
                console.log (reservations);
                var inline_keyboard = [
                ];
                for (var i = 0; i < reservations.length; i++) {
                  var button = [{text: reservations[i].dataValues.date.toUTCString(), callback_data: reservations[i].dataValues.date.toUTCString() }];
                  inline_keyboard.push(button);
                  }
                var keyboard = {
                  reply_markup: JSON.stringify({
                    inline_keyboard: inline_keyboard
                    })
                  };
                bot.sendMessage(user_id, 'Какую бронь вы хотите отменить?', keyboard)
                };
            })


    }
    else if (choice === 'return_to_main') {
      state = 'start';
      handlers.status[state](callbackQuery);
    }
    else if (state === 'booking_cancel_del' ) {
      Reservation.destroy({
        where: {
          date: choice
          }
        }).then(result => {
          bot.sendMessage(user_id, 'Очень жаль, будем скучать :()')
          state = 'start';
          temporaryDelete();
          handlers.status[state](callbackQuery);
        });
    }
//"Booking_new"
    else if (choice === 'booking_add') {
      state = 'booking_add';
      bot.sendMessage(callbackQuery.from.id, 'Спасибо, ожидаем вас!');
      state = 'start';
      handlers.status[state](callbackQuery);
    }
//"Booking_del"
    else if (choice === 'booking_del') {
      state = 'booking_del';
      bot.sendMessage(callbackQuery.from.id, 'Бронь отменена. Очень жаль.');
      state = 'start';
      handlers.status[state](callbackQuery);
    }
    else if (choice === 'show_review') {
      Reviews.findAll({
              limit: 10
            }).then(reviews => {
              console.log(reviews);
              var options = {
                parse_mode: 'HTML'
              }
              for (var i = 0; i < reviews.length; i++ ) {
                  var text = '<strong>' + reviews[i].dataValues.user_name + ' : ' + '</strong>' + '<i>' +  reviews[i].dataValues.review + '</i>';
                  bot.sendMessage(callbackQuery.from.id, text, options).then(result=> {state = 'start'});
              }
              handlers.status[state](callbackQuery);
            });
    }
//"Booking__how_many_persons"
    else if (choice > 0 && choice <= 8 && state == 'booking_how_many_persons') {
      var persons = parseInt(choice);
      var suit_tables = [];
      console.log(suit_tables);
      for (var i = 0; i < free_tables.length; i++) {
        if (free_tables[i].seats >= persons) {
          suit_tables.push(free_tables[i])
          }
      }
      console.log(suit_tables);
      console.log(suit_tables.length);
      if (suit_tables.length == 0) {
        bot.sendMessage(callbackQuery.from.id, 'Увы, но таких свободных столиков нет :(.');
        state = 'booking';
        handlers.status[state](callbackQuery);
        }
      else {
        state = 'booking_table_choise';
        console.log('вошло', suit_tables.length);
        for (var i = 0; i < suit_tables.length; i++) {
          dinamic_menu.reply_markup.inline_keyboard.push([{"text": 'Стол #' + suit_tables[i].id,"callback_data": String(suit_tables[i].id)}])
        };
        handlers.status[state](callbackQuery);
      }
  }
  else if (choice > 0 && choice <= 8 && state == 'booking_table_choise') {
    console.log(date);
    Reservation.create({
      user_id: callbackQuery.from.id,
      table_id: choice,
      date: date,
      time: '00:00'
    }).then(reservations => {
      state = 'start';
      bot.sendMessage(callbackQuery.from.id, 'Бронь за вами! Ждем вас!');
      handlers.status[state](callbackQuery);
      temporaryDelete();
    })
  }
  else if (choice == 'next_date') {
    currentDate.setDate(currentDate.getDate() + 5);
    bot.editMessageText('Выберите дату визита:', {
      chat_id: user_id,
      message_id: message_id,
      reply_markup: getKalendarkeyboard().reply_markup
    })
  }
  else if (choice == 'prev_date') {
    currentDate.setDate(currentDate.getDate() - 5);
    bot.editMessageText('Выберите дату визита:', {
      chat_id: user_id,
      message_id: message_id,
      reply_markup: getKalendarkeyboard().reply_markup
    })
  }
  else if (state == 'booking_choise_date') {
    var input_date = choice + 'T00:00:00.000Z';
    console.log(input_date);
      date = input_date ;
      Reservation.findAll({
              where: {
                date: input_date
                }
            }).then(reservations => {
              console.log (reservations.length);
              if (reservations.length > 0 ) {
                state = "booking_how_many_persons";
                // console.log (reservations[0].dataValues)
                free_tables = tables;
                for (var i = 0; i < reservations.length; i++) {
                  free_tables.splice(reservations[i].dataValues.table_id - 1,1);
                  console.log (reservations[i].dataValues.table_id - 1);
                }
                console.log (free_tables);
                handlers.status[state](callbackQuery);
              }
              else if( reservations.length == 0 ) {
                state = "booking_how_many_persons";
                free_tables = tables;
                handlers.status[state](callbackQuery);
              }
              else  {
                state = 'booking';
                bot.sendMessage(user_id, 'Увы, все столики заняты :( Может, в другой раз?');
                handlers.status[state](callbackQuery);
              }
            })
  }
})
