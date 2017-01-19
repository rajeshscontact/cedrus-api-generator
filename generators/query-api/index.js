'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');
var httpStatusCodes = ['200', '404', '500'];

module.exports = yeoman.Base.extend({
  prompting: function () {
    console.log('ADD Query');
  },
  end: function () {
    var cb = this.async();
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
    var inputJSON = JSON.parse(jsonObj);
    var apiPaths = options.JSONExtraction;
    apiPaths.forEach(function (apiPath) {
      if (apiPath.requireQuery && apiPath.isPublic) {
        addToPaths(inputJSON, options, apiPath);
      }
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
/*
** This method add's user selected paths with appropriate error codes
*/
var addToPaths = function (inputJSON, options, apiPath) {
  if (inputJSON.paths === {} || typeof inputJSON.paths['/' + apiPath.resourceName + 's/{' + apiPath.whichParameter + '}'] === 'undefined') {
    inputJSON.paths['/' + apiPath.resourceName + 's/{' + apiPath.whichParameter + '}'] = {};
  }
//
// For each httpMethod
//
  inputJSON.paths['/' + apiPath.resourceName + 's/{' + apiPath.whichParameter + '}'].get = {};
  var httpOptions = {};
  httpOptions.tags = [capitalizeFirstLetter(apiPath.resourceName)];
  httpOptions.description = 'Query\'s all ' + apiPath.resourceName + 's from the system that the user has access to';
  httpOptions.operationId = 'query' + capitalizeFirstLetter(apiPath.resourceName);
  httpOptions.produces = options.APIOverviewProps.APIProduces;
  httpOptions.responses = {};
//
// Adding HTTP Response Code
//
  var responses = {};
  httpStatusCodes.forEach(function (httpStatusCode) {
    responses[httpStatusCode] = {};
    responses[httpStatusCode].description = apiPath.resourceName + ' response';
    responses[httpStatusCode].schema = {};
    if (httpStatusCode === '200') {
      responses[httpStatusCode].schema.type = 'array';
      responses[httpStatusCode].schema.items = {};
      responses[httpStatusCode].schema.items.$ref = '#/definitions/' + apiPath.resourceName;
    } else {
      responses[httpStatusCode].schema.type = 'object';
    }
  });
  httpOptions.responses = responses;
  inputJSON.paths['/' + apiPath.resourceName + 's/{' + apiPath.whichParameter + '}'].get = httpOptions;
  var outline = {
    name: apiPath.whichParameter,
    in: 'path',
    type: (inputJSON.definitions[apiPath.resourceName].items !== undefined)  ? inputJSON.definitions[apiPath.resourceName].items.properties[apiPath.whichParameter].type : inputJSON.definitions[apiPath.resourceName].properties[apiPath.whichParameter].type,
    required: true
  };
//
// Adding parameters for Query if it exists
//
  inputJSON.paths['/' + apiPath.resourceName + 's/{' + apiPath.whichParameter + '}'].get.parameters = [];
  inputJSON.paths['/' + apiPath.resourceName + 's/{' + apiPath.whichParameter + '}'].get.parameters.push(outline);
};
