var TelegramBot = require('node-telegram-bot-api');
var Data = require('./data/data_ru.json');
    var token = '443479603:AAFPkbdY9IoantpLfCyl10ltwPyZfCoOpKg';
    var bot = new TelegramBot(token, {polling: true});

const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgres', 'postgres', 'postgres', {
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



const Session = sequelize.define('sessions', {
  user_id: {
    type: Sequelize.INTEGER
  },
  state: {
    type: Sequelize.STRING
  },
  date: {
    type: Sequelize.DATE
  },
  free_tables: {
    type: Sequelize.JSON
  },
  currentDate: {
    type: Sequelize.DATE
  },
  id_edit_message: {
    type: Sequelize.INTEGER
  },
  dinamic_menu: {
    type: Sequelize.JSON
  }
});

// Reservation.sync({force: true}).then(() => {
//   return Reservation.create({
//     user_id: 123,
//     table_id: 1,
//     date: new (Date),
//     time: null
//   });
// });
// Reviews.sync({force: true}).then(() => {
//   return Reviews.create({
//     user_id: 123,
//     review: 'ololo',
//     user_name: 'ololo'
//   });
// });
// Session.sync({force: true}).then(() => {
//   return Session.create({
//     user_id: 123,
//     state: 'start',
//     date: new (Date),
//     free_tables: [],
//     currentDate: new (Date),
//     id_edit_message: 123,
//     dinamic_menu: null
//   });
// });


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

var currentDate = new Date;
var dinamic_menu = {
  reply_markup: {
    inline_keyboard: []
  }
};

bot.onText(/\/start/, function (msg, match) {
    Session.destroy({
      where: {
        user_id: msg.from.id
        }
    }).then(result => {
      Session.create({
        user_id: msg.from.id,
        state: 'start',
        date: new Date,
        free_tables : [],
        currentDate : new Date,
        id_edit_message: 123,
        dinamic_menu: {
          reply_markup: {
            inline_keyboard: []
          }
        }
      }).then(session => {
          getVar(msg.from.id, 'state').then(response => {
            var photo = 'assets/hello.png';
            bot.sendPhoto(msg.from.id, photo, {caption: 'Вас приветствует бар Веселый Енот! У нас самые вкусные бургеры в этом лесу!'}).then(result => {
              handlers.status[response](msg, match)
            });

        })
        // handlers.status['start'](msg)
      });
    });
});

function getVar(user_id, value_name) {
  return new Promise(function(resolve, reject) {
    Session.findOne({
      where: {
        user_id: user_id
        }
    }).then(session => {
    resolve(session.get(value_name));
    });
  });
}

function setState(user_id, value) {
  return new Promise(function(resolve, reject) {
    Session.update({
  state: value
}, {
  where: {
    user_id:user_id
  }
}).then(session => {
    resolve(session);
    });
  });
}

function setFree_tables(user_id, value) {
  return new Promise(function(resolve, reject) {
    Session.update({
  free_tables: value
}, {
  where: {
    user_id:user_id
  }
}).then(session => {
    resolve(session);
    });
  });
}

function setMessageId(user_id, value) {
  return new Promise(function(resolve, reject) {
    Session.update({
  id_edit_message: value
}, {
  where: {
    user_id:user_id
  }
}).then(session => {
    resolve(session);
    });
  });
}

function setDinamic_menu(user_id, value) {
  return new Promise(function(resolve, reject) {
    Session.update({
  dinamic_menu: value
}, {
  where: {
    user_id:user_id
  }
}).then(session => {
    resolve(session);
    });
  });
}

function setDate(user_id, value) {
  return new Promise(function(resolve, reject) {
    Session.update({
  date: value
}, {
  where: {
    user_id:user_id
  }
}).then(session => {
    resolve(session);
    });
  });
}

function temporaryDelete() {
  date = '';
  free_tables = [];
  suit_tables = [];
  dinamic_menu.reply_markup.inline_keyboard = []
}

var handlers = {
status:
  {
    start: (msg) => bot.sendMessage(msg.from.id, 'Давай помогу!', getData(Data.MainMenu)),
    booking: (msg) => bot.sendMessage(msg.from.id, 'Бронировать стол, или отменить бронь?', getData(Data.Booking)),
    booking_new: (msg) => bot.sendMessage(msg.from.id, 'Не сомневайтесь, у нас очень круто! Или поменяем дату?', getData(Data.Booking_new)),
    booking_cancel_confirm: (msg) => bot.sendMessage(msg.from.id, 'Вы точно решили не приходить? Моему другу это не понравится :)', getData(Data.Booking_cancel_confirm)),
    booking_how_many_persons: (msg) => bot.sendMessage(msg.from.id, 'Я нашел столики для вас! Сколько персон ожидать?', getData(Data.Booking__how_many_persons)),
    booking_table_choise: (msg) => bot.sendMessage(msg.from.id, 'Я могу предложить эти столики для вас:', dinamic_menu),
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
  getVar(msg.from.id, 'state').then(state => {
    if (state == 'review') {
      Reviews.create({
      user_id: msg.from.id,
      user_name: msg.from.first_name,
      review: msg.text
    }).then(Reviews => {
        bot.sendMessage(msg.from.id, 'Спасибо за отзыв!');
        setState(msg.from.id, 'start').then(response => {
           getVar(msg.from.id, 'state').then(state =>{
             handlers.status[state](msg);
           })
         });
      });
    }
    else if (state == 'find') {
      var options = {
        parse_mode: 'HTML'
      }
      var userLocation = msg.location.latitude + ',' + msg.location.longitude;
      var link = 'https://www.google.com/maps/dir/'+userLocation+'/'+location.latitude +','+location.longitude +'/'+'@49.4354351,32.0818147,15z/data=!3m1!4b1'
      var text = '<a href="'  +  link +  '">Перейти к Google Maps</a>'
      bot.sendMessage(msg.from.id, text, options ).then(message=>{
        setState(msg.from.id, 'start').then(response => {
           getVar(msg.from.id, 'state').then(state =>{
             handlers.status[state](msg);
           })
         });
      });
    }
  })
});

 bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    getVar(callbackQuery.from.id, 'state').then(state =>{
      const choice = callbackQuery.data;

      if (choice === 'review') {
        setState(callbackQuery.from.id, choice);
        bot.sendMessage(callbackQuery.from.id, 'Просто напишите отзыв тут');

      }
      else if (choice === 'menu') {
          var photo = 'assets/menu.jpg';
          bot.sendPhoto(callbackQuery.from.id, photo, {caption: 'Наше меню'})
              .then(
                result => {
                  setState(callbackQuery.from.id, 'start').then(response => {
                     getVar(callbackQuery.from.id, 'state').then(state =>{
                       handlers.status[state](callbackQuery);
                     })
                   });
                },
                error => {console.log(error)}
              );
      }
      else if (choice === 'booking') {
        setState(callbackQuery.from.id, 'booking').then(response => {
           getVar(callbackQuery.from.id, 'state').then(state =>{
             handlers.status[state](callbackQuery);
           })
         });
      }
      else if (choice === 'find_route') {
        bot.sendMessage(callbackQuery.from.id, 'Прикрепите вашу геолокацию в сообщении, пожалуйста' );
      }
      else if (choice === 'find' ) {
        setState(callbackQuery.from.id, choice);
        bot.sendLocation(callbackQuery.from.id, location.latitude, location.longitude);
        bot.sendMessage(callbackQuery.from.id, "Бар тут :)").then(msg=>{
          setState(callbackQuery.from.id, choice).then(response => {
             getVar(callbackQuery.from.id, 'state').then(state =>{
               handlers.status[state](callbackQuery);
             })
           });
        });
      }
      else if (choice === 'find_route') {
        bot.sendMessage(callbackQuery.from.id, "Прикрепите ваше метоположение");
      }
      else if (choice === 'booking_new') {
        setState(callbackQuery.from.id, choice);
        bot.sendMessage(callbackQuery.from.id, 'Выберите дату визита:', getKalendarkeyboard()).then(result => {
          setMessageId (callbackQuery.from.id, result.message_id).then(response=>{
            setState(callbackQuery.from.id, 'booking_choise_date');
          });

        })
      }
      else if (choice === 'booking_cancel') {
        setState(callbackQuery.from.id, choice);
        Reservation.findAll({
                where: {
                  user_id: callbackQuery.from.id
                  }
              }).then(reservations => {
                if (reservations.length == 0) {
                  bot.sendMessage(callbackQuery.from.id, 'Вы еще ничего у нас не бронировали :)')
                  setState(callbackQuery.from.id, 'start').then(response => {
                     getVar(callbackQuery.from.id, 'state').then(state =>{
                       handlers.status[state](callbackQuery);
                     })
                   });
                  }
                else {
                  setState(callbackQuery.from.id, 'booking_cancel_del').then(result => {
                    var inline_keyboard = [];
                    for (var i = 0; i < reservations.length; i++) {
                      var button = [{text: reservations[i].dataValues.date.toUTCString(), callback_data: reservations[i].dataValues.date.toUTCString() }];
                      inline_keyboard.push(button);
                      }
                    var keyboard = {
                      reply_markup: JSON.stringify({
                        inline_keyboard: inline_keyboard
                        })
                      };
                    bot.sendMessage(callbackQuery.from.id, 'Какую бронь вы хотите отменить?', keyboard);
                  });
                  };
              })
      }
      else if (choice === 'return_to_main') {
        setState(callbackQuery.from.id, 'start').then(response => {
           getVar(callbackQuery.from.id, 'state').then(state =>{
             handlers.status[state](callbackQuery);
           })
         });
      }
      else if (state === 'booking_cancel_del' ) {
        Reservation.destroy({
          where: {
            date: choice
            }
          }).then(result => {
            bot.sendMessage(callbackQuery.from.id, 'Очень жаль, будем скучать :()').then(msg=>{
              setState(callbackQuery.from.id, 'start').then(response => {
                 getVar(callbackQuery.from.id, 'state').then(state =>{
                   handlers.status[state](callbackQuery);
                 })
               });
            })

          });
      }
      else if (choice === 'booking_add') {
        bot.sendMessage(callbackQuery.from.id, 'Спасибо, ожидаем вас!').then(msg=>{
          setState(callbackQuery.from.id, 'start').then(response => {
             getVar(callbackQuery.from.id, 'state').then(state =>{
               handlers.status[state](callbackQuery);
             })
           });
        });
      }
      else if (choice === 'booking_del') {
        bot.sendMessage(callbackQuery.from.id, 'Бронь отменена. Очень жаль.').then(msg=>{
          setState(callbackQuery.from.id, 'start').then(response => {
             getVar(callbackQuery.from.id, 'state').then(state =>{
               handlers.status[state](callbackQuery);
             })
           });
        });
      }
      else if (choice === 'show_review') {
        Reviews.findAll({
                limit: 10
              }).then(reviews => {
                var options = {
                  parse_mode: 'HTML'
                }
                for (var i = 0; i < reviews.length; i++ ) {
                    var text = '<strong>' + reviews[i].dataValues.user_name + ' : ' + '</strong>' + '<i>' +  reviews[i].dataValues.review + '</i>';
                    bot.sendMessage(callbackQuery.from.id, text, options).then(result=> {
                    });
                }
                setState(callbackQuery.from.id, 'start').then(response => {
                   getVar(callbackQuery.from.id, 'state').then(state =>{
                     handlers.status[state](callbackQuery);
                   })
                 });
              });
      }
      else if (choice > 0 && choice <= 8 && state == 'booking_how_many_persons') {
        var persons = parseInt(choice);
        var suit_tables = [];
        getVar(callbackQuery.from.id, 'free_tables').then(free_tables =>{
          for (var i = 0; i < free_tables.length; i++) {
            if (free_tables[i].seats >= persons) {
              suit_tables.push(free_tables[i])
              }
          }
          if (suit_tables.length == 0) {
            bot.sendMessage(callbackQuery.from.id, 'Увы, но таких свободных столиков нет :(.');
            setState(callbackQuery.from.id, 'booking').then(response => {
               getVar(callbackQuery.from.id, 'state').then(state =>{
                 handlers.status[state](callbackQuery);
               })
             });
            }
          else {
            for (var i = 0; i < suit_tables.length; i++) {
              dinamic_menu.reply_markup.inline_keyboard.push([{"text": 'Стол #' + suit_tables[i].id,"callback_data": String(suit_tables[i].id)}])
            };
            setDinamic_menu(callbackQuery.from.id, dinamic_menu).then(result=>{
              setState(callbackQuery.from.id, 'booking_table_choise').then(response => {
                 getVar(callbackQuery.from.id, 'state').then(state =>{
                   handlers.status[state](callbackQuery);
                 })
               });
            })
          }
        })
    }
    else if (choice > 0 && choice <= 8 && state == 'booking_table_choise') {
      Reservation.create({
        user_id: callbackQuery.from.id,
        table_id: choice,
        date: date,
        time: '00:00'
      }).then(reservations => {
        bot.sendMessage(callbackQuery.from.id, 'Бронь за вами! Ждем вас!').then(msg=>{
          setState(callbackQuery.from.id, 'booking').then(response => {
             getVar(callbackQuery.from.id, 'state').then(state =>{
               handlers.status[state](callbackQuery);
             })
           });
        });
      })
    }
    else if (choice == 'next_date') {
      currentDate.setDate(currentDate.getDate() + 5);
      getVar(callbackQuery.from.id, 'id_edit_message').then(message_id =>{
        bot.editMessageText('Выберите дату визита:', {
          chat_id: callbackQuery.from.id,
          message_id: message_id,
          reply_markup: getKalendarkeyboard().reply_markup
        })
      })
    }
    else if (choice == 'prev_date') {
      currentDate.setDate(currentDate.getDate() - 5);
      getVar(callbackQuery.from.id, 'id_edit_message').then(message_id =>{
        bot.editMessageText('Выберите дату визита:', {
          chat_id: callbackQuery.from.id,
          message_id: message_id,
          reply_markup: getKalendarkeyboard().reply_markup
        })
      })
    }
    else if (state == 'booking_choise_date') {
      var input_date = choice + 'T00:00:00.000Z';
        date = input_date ;
        Reservation.findAll({
                where: {
                  date: input_date
                  }
              }).then(reservations => {
                if (reservations.length > 0 ) {
                  var free_tables = tables;
                  for (var i = 0; i < reservations.length; i++) {
                    free_tables.splice(reservations[i].dataValues.table_id - 1,1);
                  }
                  setFree_tables(callbackQuery.from.id, free_tables).then(response => {
                    setState(callbackQuery.from.id, 'booking_how_many_persons').then(res => {
                       getVar(callbackQuery.from.id, 'state').then(state =>{
                         handlers.status[state](callbackQuery);
                       })
                     });
                  })
                }
                else if( reservations.length == 0 ) {
                  var free_tables = tables;
                  setFree_tables(callbackQuery.from.id, tables).then(response => {
                    setState(callbackQuery.from.id, 'booking_how_many_persons').then(res => {
                       getVar(callbackQuery.from.id, 'state').then(state =>{
                         handlers.status[state](callbackQuery);
                       })
                     });
                  })
                }
                else  {
                  bot.sendMessage(user_id, 'Увы, все столики заняты :( Может, в другой раз?').then(msg=>{
                    setState(callbackQuery.from.id, 'booking').then(response => {
                       getVar(callbackQuery.from.id, 'state').then(state =>{
                         handlers.status[state](callbackQuery);
                       })
                     });
                  });
                }
              })
    }
    })
})
