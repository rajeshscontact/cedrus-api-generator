'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var jsonSchemaFaker = require('json-schema-faker');

module.exports = yeoman.Base.extend({
  prompting: function () {
  },
  end: function () {
    var cb = this.async();
    var configOptions = this.config.getAll();
    createFakeData(configOptions, cb);
  }
});

var createFakeData = function (options, cb) {
  var apiPaths = options.JSONExtraction;
  apiPaths.forEach(function (apiPath) {
    if (apiPath.requireFakeData) {
      var inputJSONArray = [];
      for (var i = 0; i < apiPath.numberOfFakeRecords; i++) {
        var inputJSON = jsonSchemaFaker(apiPath.JSONSchema);
        inputJSONArray.push(inputJSON);
        if (i === (apiPath.numberOfFakeRecords - 1)) {
          if (!fs.existsSync('./sampleData')) {
            fs.mkdirSync('./sampleData');
          }
          fs.writeFile('./sampleData/' + apiPath.resourceName + '.json', JSON.stringify(inputJSONArray), function (err) {
            if (err) {
              return console.log(err);
            }
            console.log('Fake Data has been generated for resource ' + apiPath.resourceName + '!');
          });
        }
      }
    }
  });
  cb();
};
