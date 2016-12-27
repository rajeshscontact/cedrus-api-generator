'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');
var httpStatusCodes = ['204', '404', '500'];

module.exports = yeoman.Base.extend({
  prompting: function () {
    console.log('ADD HTTPCODES');
  },
  end: function () {
    var cb = this.async();
    var runningThrough = this.options.runningThrough;
    var configOptions = this.config.getAll();
    if (runningThrough === 'generator') {
      // console.log('options', this.config.getAll());
      addHTTPCodes(configOptions, false, cb);
    }else if (runningThrough === 'AddResource') {
      //createJson(configOptions.addResource.resourceName, configOptions.addResource.numberOfFakeRecords, configOptions.addResource.JSONSchema);
      addHTTPCodes(configOptions, true, cb);
    } else {
      cb();
    }
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
var addHTTPCodes = function (options, isAddResource, cb) {
  /*
  **  Reading the copied json file and adding the required paramaters
  */
  fs.readFile(path.resolve('swaggerConfig/input.json'), 'utf8', function (error, jsonObj) {
    if (error) {
      throw error;
    }
    // console.log('WE MADE IT', options);
    var inputJSON = JSON.parse(jsonObj);
    if(isAddResource){
      addToDefinitions(inputJSON, options.addResource.resourceName, options.addResource.JSONSchema);
      if (options.addResource.isPublic) {
        addToPaths(inputJSON, options.APIOverviewProps.APIProduces, options.addResource.APIHttpMethods, options.addResource.resourceName);
      }
    }else{
      var apiPaths = options.JSONExtraction;
      apiPaths.forEach(function (apiPath) {
        addToDefinitions(inputJSON, apiPath.resourceName, apiPath.JSONSchema);
        if (apiPath.isPublic) {
          addToPaths(inputJSON, options.APIOverviewProps.APIProduces, apiPath.HTTPMethods, apiPath.resourceName);
        }
      });
    }
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
** This method converts provider json to schema object and adds to definitions
*/
var addToDefinitions = function (inputJSON, resourceName, schemaObj) {
  inputJSON.definitions[resourceName] = {};
  inputJSON.definitions[resourceName] = schemaObj;
};
/*
** This method add's user selected paths with appropriate error codes
*/
var addToPaths = function (inputJSON, apiProduces, httpMethodList, resourceName) {
  if (inputJSON.paths === {} || typeof inputJSON.paths['/' + resourceName + 's'] === 'undefined') {
    inputJSON.paths['/' + resourceName + 's'] = {};
  }
  //
  // For each httpMethod
  //
  var httpMethods = httpMethodList;
  httpMethods.forEach(function (httpMethod) {
    inputJSON.paths['/' + resourceName + 's'][httpMethod] = {};
    var httpOptions = {};
    httpOptions.tags = [capitalizeFirstLetter(resourceName)];
    httpOptions.description = capitalizeFirstLetter(httpMethod) + 's all ' + resourceName + 's from the system that the user has access to';
    httpOptions.operationId = httpMethod + capitalizeFirstLetter(resourceName);
    httpOptions.produces = apiProduces;
    httpOptions['x-swagger-router-controller'] = capitalizeFirstLetter(resourceName);
    httpOptions.responses = {};
    //
    // Adding HTTP Response Code
    //
    var responses = {};
    httpStatusCodes.forEach(function (httpStatusCode) {
      if (httpMethod === 'get' && httpStatusCode === '204') {
        httpStatusCode = '200';
      }
      responses[httpStatusCode] = {};
      responses[httpStatusCode].description = resourceName + ' response';
      responses[httpStatusCode].schema = {};
      if (httpStatusCode === '200' || httpStatusCode === '204') {
        responses[httpStatusCode].schema.type = 'array';
        responses[httpStatusCode].schema.items = {};
        responses[httpStatusCode].schema.items.$ref = '#/definitions/' + resourceName;
      } else {
        responses[httpStatusCode].schema.type = 'object';
      }
    });
    httpOptions.responses = responses;
    inputJSON.paths['/' + resourceName + 's'][httpMethod] = httpOptions;
  });
};
