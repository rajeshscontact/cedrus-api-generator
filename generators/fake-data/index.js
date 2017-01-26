'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var jsonSchemaFaker = require('json-schema-faker');
var fakerMapping = require('./faker-mapping.json');

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
    } else if (runningThrough === 'AddResource') {
      createJson(configOptions.addResource.resourceName, configOptions.addResource.numberOfFakeRecords, configOptions.addResource.JSONSchema);
      //createFakeData(configOptions, cb);
    } else {
      cb();
    }
  }
});

var createFakeData = function (options, cb) {
  var apiPaths = options.JSONExtraction;
  apiPaths.forEach(function (apiPath) {
    if (apiPath.requireFakeData) {
      var jsonObj = apiPath.JSONSchema;
      var jsonProperties = {};
      var keys = [];
      if(jsonObj.type === 'array'){
        jsonProperties = jsonObj.items.properties;
        keys = Object.keys(jsonObj.items.properties);
      }else if(jsonObj.type === 'object'){
        jsonProperties = jsonObj.properties;
        keys = Object.keys(jsonObj.properties);
      }
      if(keys.length > 0){
        keys.forEach(function(key){
          if(jsonProperties[key]['type'] === 'array' || jsonProperties[key]['type'] === 'object'){
            var subKeys = [];
            if(jsonProperties[key]['type'] === 'array'){
              subKeys = Object.keys(jsonProperties[key]['items']['properties']);
            }else if(jsonProperties[key]['type'] === 'object'){
              subKeys = Object.keys(jsonProperties[key]['properties']);
            }
            if(subKeys.length > 0){
              subKeys.forEach(function(subKey){
                var subKeyLowerCase = subKey.toLowerCase();
                if(fakerMapping[subKeyLowerCase] != undefined){
                  if(jsonObj.type === 'array'){
                    if(jsonProperties[key]['type'] === 'array'){
                      jsonObj.items.properties[key]['items']['properties'][subKey]['faker'] = fakerMapping[subKeyLowerCase];
                    }else if(jsonProperties[key]['type'] === 'object'){
                      jsonObj.items.properties[key]['properties'][subKey]['faker'] = fakerMapping[subKeyLowerCase];
                    }
                  }else if(jsonObj.type === 'object'){
                    if(jsonProperties[key]['type'] === 'array'){
                      jsonObj.properties[key]['items']['properties'][subKey]['faker'] = fakerMapping[subKeyLowerCase];
                    }else if(jsonProperties[key]['type'] === 'object'){
                      jsonObj.properties[key]['properties'][subKey]['faker'] = fakerMapping[subKeyLowerCase];
                    }
                  }
                }
              });
              if(jsonObj.type === 'array'){
                jsonObj.items.properties[key]['required']=subKeys;
              }else if(jsonObj.type === 'object'){
                jsonObj.properties[key]['required'] = subKeys;
              }
            }
          }else{
            var keyLowerCase = key.toLowerCase();
            if(keyLowerCase === 'age'){
              if(jsonObj.type === 'array'){
                jsonObj.items.properties[key]['maximum'] = 150;
                jsonObj.items.properties[key]['minimum'] = 0;
              }else if(jsonObj.type === 'object'){
                jsonObj.properties[key]['maximum'] = 150;
                jsonObj.properties[key]['minimum'] = 0;
              }
            }
            if(fakerMapping[keyLowerCase] != undefined){
              if(jsonObj.type === 'array'){
                jsonObj.items.properties[key]['faker'] = fakerMapping[keyLowerCase];
              }else if(jsonObj.type === 'object'){
                jsonObj.properties[key]['faker'] = fakerMapping[keyLowerCase];
              }
            }
          }
        });
        jsonObj.required = keys;
      }
      createJson(apiPath.resourceName, apiPath.numberOfFakeRecords, jsonObj, options.DataInput.applicationType);
    }
  });
  cb();
};

var createJson = function (resourceName, numberOfRecords, schemaObj, applicationType) {
  var inputJSONArray = [];
  for (var i = 0; i < numberOfRecords; i++) {
    var inputJSON = jsonSchemaFaker(schemaObj);
    inputJSONArray.push(inputJSON);
    if (i === (numberOfRecords - 1)) {
      if (!fs.existsSync('./sampleData')) {
        fs.mkdirSync('./sampleData');
      }
      var path = './sampleData/' + capitalizeFirstLetter(resourceName) + '.json';
      if(applicationType === 'java'){
        if (!fs.existsSync('./src/main/resources/sampleData')) {
          fs.mkdirSync('./src/main/resources/sampleData');
        }
        path = './src/main/resources/sampleData/' + capitalizeFirstLetter(resourceName) + '.json'
      }
      fs.writeFile(path, JSON.stringify(inputJSONArray), function (err) {
        if (err) {
          return console.log(err);
        }
        console.log('Fake Data has been generated for resource ' + resourceName + '!');
      });
    }
  }
};

var capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
