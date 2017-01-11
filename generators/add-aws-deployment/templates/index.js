var index = require("./indexService.js");

exports.handler = function(event, context, cb) {
  index[event.method](event, cb);
};
