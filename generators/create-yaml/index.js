'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');
var writeYaml = require('write-yaml');

module.exports = yeoman.Base.extend({
  prompting: function () {
    //console.log('CREATE YAML');
  },
  end: function () {
    var cb = this.async();
    createYamlJson(cb);
  }
});

var createYamlJson = function (cb) {
  /*
  **  Reading the copied json file and adding the required paramaters
  */
  fs.readFile(path.resolve('swaggerConfig/input.json'), 'utf8', function (error, jsonObj) {
    if (error) {
      throw error;
    }
    var inputJSON = JSON.parse(jsonObj);
    /*
    **  Creating the Yaml file from the json
    */
    writeYaml('swaggerConfig/input.yaml', inputJSON, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('The Yaml file is saved!');
      cb();
    });
  });
};
