'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var jsonSchemaFaker = require('json-schema-faker');

module.exports = yeoman.Base.extend({
  prompting: function () {
    var runningThrough = this.options.runningThrough;
    if (typeof runningThrough === 'undefined') {
      var availableResourceList = [];
      var apiPaths = this.config.getAll().JSONExtraction;
      apiPaths.forEach(function (apiPath) {
        var resource = {};
        resource.name = apiPath.resourceName;
        resource.value = {};
        resource.value.name = apiPath.resourceName;
        resource.value.schema = apiPath.JSONSchema;
        availableResourceList.push(resource);
      });
      var prompts = [{
        type: 'list',
        name: 'selectedResource',
        message: 'Please select a resource to generate fake data',
        choices: availableResourceList
      }, {
        name: 'numberOfFakeRecords',
        type: 'number',
        message: 'How many records would you like to have?'
      }];

      return this.prompt(prompts).then(function (props) {
        // console.log('props APP', props);
        createJson(props.selectedResource.name, props.numberOfFakeRecords, props.selectedResource.schema);
      });
    }
  },
  end: function () {
    var cb = this.async();
    var runningThrough = this.options.runningThrough;
    var configOptions = this.config.getAll();
    if (runningThrough === 'generator') {
      createFakeData(configOptions, cb);
    } else {
      cb();
    }
  }
});

var createFakeData = function (options, cb) {
  var apiPaths = options.JSONExtraction;
  apiPaths.forEach(function (apiPath) {
    if (apiPath.requireFakeData) {
      createJson(apiPath.resourceName, apiPath.numberOfFakeRecords, apiPath.JSONSchema);
    }
  });
  cb();
};

var createJson = function (resourceName, numberOfRecords, schemaObj) {
  var inputJSONArray = [];
  for (var i = 0; i < numberOfRecords; i++) {
    var inputJSON = jsonSchemaFaker(schemaObj);
    inputJSONArray.push(inputJSON);
    if (i === (numberOfRecords - 1)) {
      if (!fs.existsSync('./sampleData')) {
        fs.mkdirSync('./sampleData');
      }
      fs.writeFile('./sampleData/' + resourceName + '.json', JSON.stringify(inputJSONArray), function (err) {
        if (err) {
          return console.log(err);
        }
        console.log('Fake Data has been generated for resource ' + resourceName + '!');
      });
    }
  }
};
