'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');

module.exports = yeoman.Base.extend({
  prompting: function () {
    console.log('ADD Parameters');
  },
  end: function () {
    var cb = this.async();
    //console.log('options', this.config.getAll());
    var configOptions = this.config.getAll();
    addParameters(configOptions, cb);
  }
});

var addParameters = function (options, cb) {
  /*
  **  Reading the copied json file and adding the required parameters
  */
  fs.readFile(path.resolve('swaggerConfig/input.json'), 'utf8', function (error, jsonObj) {
    if (error) {
      throw error;
    }
    //console.log('Adding parameters options', options);
    var inputJSON = JSON.parse(jsonObj);
    var apiPaths = options.JSONExtraction;
    apiPaths.forEach(function (apiPath) {
      if(apiPath.isPublic){
        var outline = {
          name: apiPath.resourceName,
          in: 'body',
          schema: apiPath.JSONSchema
        };
        //
        // Adding parameters for Post if it exists
        //
        if (inputJSON.paths['/' + apiPath.resourceName + 's'].post) {
          inputJSON.paths['/' + apiPath.resourceName + 's'].post.parameters = [];
          inputJSON.paths['/' + apiPath.resourceName + 's'].post.parameters.push(outline);
        }
        //
        // Adding parameters for Put if it exists
        //
        if (inputJSON.paths['/' + apiPath.resourceName + 's'].put) {
          inputJSON.paths['/' + apiPath.resourceName + 's'].put.parameters = [];
          inputJSON.paths['/' + apiPath.resourceName + 's'].put.parameters.push(outline);
        }
      }
    });
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
