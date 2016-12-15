'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');
var yamljs = require('yamljs');
var writeYaml = require('write-yaml');


var codeGenEndpoint = 'http://generator.swagger.io/api/gen/servers';
var language = 'nodejs-server';

module.exports = yeoman.Base.extend({
  prompting: function () {
    console.log('CREATE YAML');
    this.option('name');
  },
  writing: function () {
    this.copy('input.json', 'swaggerConfig/input.json');
  },
  end: function () {
    createYamlJson(this.options.APIOverviewProps);
  }
});

var createYamlJson = function (options) {

  /*
  **  Reading the copied json file and adding the required paramaters
  */
  fs.readFile(path.resolve('swaggerConfig/input.json'), 'utf8', function (error, jsonObj) {
    if (error) {
      throw error;
    }
    var inputJSON = JSON.parse(jsonObj);
    inputJSON.info.title = options.APIName;
    inputJSON.info.description = options.APIDescription;
    inputJSON.basePath = options.APIBasePath;

    /*
    ** saving final json file for future references
    */
    fs.writeFile("swaggerConfig/input.json", JSON.stringify(inputJSON), function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The Json file is saved!");
    });

    /*
    **  Creating the Yaml file from the json
    */
    writeYaml('swaggerConfig/input.yaml', inputJSON, function(err){
      if (err) {
        return console.log(err);
      }
      console.log("The Yaml file is saved!");
    })
  });
};
