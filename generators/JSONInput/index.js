'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');

module.exports = yeoman.Base.extend({
  prompting: function () {
    console.log('CREATE JSON INPUT');
  },
  writing: function () {
    this.copy('input.json', 'swaggerConfig/input.json');
  },
  end: function () {
    var cb = this.async();
    // console.log('options INPUT', this.config.getAll());
    var configOptions = this.config.getAll();
    createJsonInput(configOptions, cb);
  }
});

var createJsonInput = function (options, cb) {
  /*
  **  Reading the copied json file and adding the required paramaters
  */
  fs.readFile(path.resolve('swaggerConfig/input.json'), 'utf8', function (error, jsonObj) {
    if (error) {
      throw error;
    }
    var inputJSON = JSON.parse(jsonObj);
    inputJSON.info.title = options.APIOverviewProps.APIName;
    inputJSON.info.description = options.APIOverviewProps.APIDescription;
    inputJSON.basePath = options.APIOverviewProps.APIBasePath;
    inputJSON.consumes = options.APIOverviewProps.APIConsumes;
    inputJSON.produces = options.APIOverviewProps.APIProduces;
    /*
    ** saving final json file for future references
    */
    fs.writeFile('swaggerConfig/input.json', JSON.stringify(inputJSON), function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('The Json file is saved!');
      cb();
    });
  });
};
