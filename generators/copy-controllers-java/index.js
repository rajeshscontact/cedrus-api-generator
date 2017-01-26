'use strict';
var yeoman = require('yeoman-generator');
var del = require('del');

module.exports = yeoman.Base.extend({
  prompting: function() {
    console.log('Inside copy controllers');
  },
  end: function () {
      var configOptions = this.config.getAll();
      var apiPaths = configOptions.JSONExtraction;
      var javaOptions = configOptions.javaOptions;
      var folderPath = (javaOptions.basePackage).split('.').join('/');
      var thisFunc = this;
      apiPaths.forEach(function (apiPath) {
        if(apiPath.requireFakeData){
          del(['./src/main/java/'+folderPath+'/api/'+capitalizeFirstLetter(apiPath.resourceName)+'sApiController.java'], {force: true}).then(paths => {
              thisFunc.fs.copyTpl(
                thisFunc.templatePath('controller.java'),
                thisFunc.destinationPath('./src/main/java/'+folderPath+'/api/'+capitalizeFirstLetter(apiPath.resourceName)+'sApiController.java'), {
                  resourceName: capitalizeFirstLetter(apiPath.resourceName),
                  httpMethods : apiPath.HTTPMethods,
                  fakeData: apiPath.requireFakeData,
                  basePath: javaOptions.basePackage
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
