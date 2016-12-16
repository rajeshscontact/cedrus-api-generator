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
    inputJSON.consumes = options.APIConsumes;
    inputJSON.produces = options.APIProduces;
    var httpMethods = options.APIHttpMethods;
    httpMethods.forEach(function(httpMethod){
      addToPaths (inputJSON, options, httpMethod);
    });
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

var addToPaths = function(inputJSON, options, httpMethod){
  if(inputJSON.paths === {} || typeof inputJSON.paths[options.APIPath+'s'] === 'undefined'){
    inputJSON.paths[options.APIPath+'s'] = {};
  }
  inputJSON.paths[options.APIPath+'s'][httpMethod] = {};
  var httpOptions = {};
  httpOptions.description = 'Returns all '+options.APIPath+'s from the system that the user has access to';
  httpOptions.operationId = 'find'+options.APIPath;
  httpOptions.produces = options.APIProduces;
  httpOptions.responses = {};
  var responses = {"200":{}};
  responses['200'].description = options.APIPath+' response';
  responses['200'].schema = {};
  responses['200'].schema.type = 'array';
  responses['200'].schema.items = {};
  responses['200'].schema.items.$ref = '#/definitions'+options.APIPath;
  httpOptions.responses = responses;
  inputJSON.paths[options.APIPath+'s'][httpMethod] = httpOptions;
};
