'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');
var httpStatusCodes = ['204', '404', '500'];
var writeYaml = require('write-yaml');

module.exports = yeoman.Base.extend({
  prompting: function () {
    console.log('ADD HTTPCODES');
  },
  end: function () {
    var cb = this.async();
    // console.log('options', this.config.getAll());
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
    // console.log('WE MADE IT', options);
    var inputJSON = JSON.parse(jsonObj);
    var relationalObjects = options.APIRelationships;
    relationalObjects.forEach(function (relation) {
      if (relation.Relationship === 'BelongsTo') {
        addToPaths(inputJSON, options, relation.ToResource, relation.FromResource);
      } else {
        addToPaths(inputJSON, options, relation.FromResource, relation.ToResource);
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
    /*
    **  Creating the Yaml file from the json
    */
      writeYaml('api/swagger.yaml', inputJSON, function (err) {
        if (err) {
          return console.log(err);
        }
        console.log('The Yaml file is saved!');
        cb();
      });
    });
  });
};
/*
** This method add's user selected paths with appropriate error codes
*/
var addToPaths = function (inputJSON, options, fromRelationship, toRelationship) {
  var pathRelation = '/' + fromRelationship + 's/{id}/' + toRelationship;
  if (inputJSON.paths === {} || typeof inputJSON.paths[pathRelation] === 'undefined') {
    inputJSON.paths[pathRelation] = {};
  }
  //
  // For each httpMethod
  //
  for (var i = 0; i < options.JSONExtraction.length; i++) {
    if (options.JSONExtraction[i].resourceName === fromRelationship) {
      var httpMethods = options.JSONExtraction[i].HTTPMethods;
      var apiObject = options.JSONExtraction[i];
    }
  }
  httpMethods.forEach(function (httpMethod) {
    inputJSON.paths[pathRelation][httpMethod] = {};
    var httpOptions = {};
    httpOptions.tags = [capitalizeFirstLetter(fromRelationship), capitalizeFirstLetter(toRelationship)];
    httpOptions.description = capitalizeFirstLetter(httpMethod) + 's all ' + toRelationship + ' from ' + fromRelationship + ' from the system that the user has access to';
    httpOptions.operationId = httpMethod + capitalizeFirstLetter(toRelationship) + 's';
    httpOptions.produces = options.APIOverviewProps.APIProduces;
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
      responses[httpStatusCode].description = fromRelationship + 'and ' + toRelationship + ' response';
      responses[httpStatusCode].schema = {};
      if (httpStatusCode === '200' || httpStatusCode === '204') {
        responses[httpStatusCode].schema.type = 'array';
        responses[httpStatusCode].schema.items = {};
        responses[httpStatusCode].schema.items.$ref = '#/definitions/' + apiObject.resourceName;
      } else {
        responses[httpStatusCode].schema.type = 'object';
      }
    });
    httpOptions.responses = responses;
    inputJSON.paths[pathRelation][httpMethod] = httpOptions;
  });
};
