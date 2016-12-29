'use strict';
var yeoman = require('yeoman-generator');
var jsonSchemaGenerator = require('json-schema-generator');
var fs = require('fs');
var path = require('path');
var del = require('del');

module.exports = yeoman.Base.extend({
  prompting: function() {
    console.log('Inside copy controllers');
  },
  end: function () {
      var configOptions = this.config.getAll();
      var apiPaths = configOptions.JSONExtraction;
      var thisFunc = this;
      apiPaths.forEach(function (apiPath) {
        if(apiPath.requireFakeData){
          del(['./controllers/'+capitalizeFirstLetter(apiPath.resourceName)+'.js', './controllers/'+capitalizeFirstLetter(apiPath.resourceName)+'Service.js'], {force: true}).then(paths => {
            console.log('Files and folders that would be deleted:\n', paths.join('\n'));
              //copying Resource to controllers
              thisFunc.fs.copyTpl(
                thisFunc.templatePath('resource.js'),
                thisFunc.destinationPath('./controllers/'+capitalizeFirstLetter(apiPath.resourceName)+'.js'), {
                  resourceName: capitalizeFirstLetter(apiPath.resourceName),
                  httpMethods : apiPath.HTTPMethods
                }
              );
              //copying ResourceService to controllers
              thisFunc.fs.copyTpl(
                thisFunc.templatePath('resourceService.js'),
                thisFunc.destinationPath('./controllers/'+capitalizeFirstLetter(apiPath.resourceName)+'Service.js'), {
                  resourceName: capitalizeFirstLetter(apiPath.resourceName),
                  httpMethods : apiPath.HTTPMethods,
                  fakeData: apiPath.requireFakeData
                }
              );
          });
        }
      });
  }
});

var capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
