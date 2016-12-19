'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');
var httpStatusCodes = ['200', '404', '500'];

module.exports = yeoman.Base.extend({
  prompting: function () {
    console.log('ADD HTTPCODES');
  },
  end: function () {
    var cb = this.async();
    console.log('options', this.config.getAll());
    var configOptions = this.config.getAll();
    addHTTPCodes(configOptions, cb);
  }
});

//
// FORMATING FUNCTIONS
//
var capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
//
// JOB HANDELING FUNCTIONS
//
var addHTTPCodes = function (options, cb) {
  /*
  **  Reading the copied json file and adding the required paramaters
  */
  fs.readFile(path.resolve('swaggerConfig/input.json'), 'utf8', function (error, jsonObj) {
    if (error) {
      throw error;
    }
    console.log('WE MADE IT', options);
    var inputJSON = JSON.parse(jsonObj);
    var apiPaths = options.JSONExtraction;
    apiPaths.forEach(function (apiPath) {
      addToPaths(inputJSON, options, apiPath);
    });
    // /*
    // ** saving final json file for future references
    // */
    fs.writeFile('swaggerConfig/input.json', JSON.stringify(inputJSON), function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('The Json file is saved!');
      cb();
    });
  });
};

var addToPaths = function (inputJSON, options, apiPath) {
  if (inputJSON.paths === {} || typeof inputJSON.paths['/' + apiPath.resourceName + 's'] === 'undefined') {
    inputJSON.paths['/' + apiPath.resourceName + 's'] = {};
  }
  //
  // For each httpMethod
  //
  var httpMethods = apiPath.HTTPMethods;
  httpMethods.forEach(function (httpMethod) {
    inputJSON.paths['/' + apiPath.resourceName + 's'][httpMethod] = {};
    var httpOptions = {};
    httpOptions.description = capitalizeFirstLetter(httpMethod) + 's all ' + apiPath.resourceName + 's from the system that the user has access to';
    httpOptions.operationId = httpMethod + capitalizeFirstLetter(apiPath.resourceName);
    httpOptions.produces = options.APIOverviewProps.APIProduces;
    httpOptions.responses = {};
    //
    // Adding HTTP Response Code
    //
    var responses = {};
    httpStatusCodes.forEach(function (httpStatusCode) {
      responses[httpStatusCode] = {};
      responses[httpStatusCode].description = apiPath.resourceName + ' response';
      // responses[httpStatusCode].schema = {};
      // responses[httpStatusCode].schema.type = 'array';
      // responses[httpStatusCode].schema.items = {};
      // responses[httpStatusCode].schema.items.$ref = '#/definitions/' + apiPath.resourceName;
    });
    httpOptions.responses = responses;
    inputJSON.paths['/' + apiPath.resourceName + 's'][httpMethod] = httpOptions;
  });
};
