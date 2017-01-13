'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var GenerateSchema = require('generate-schema');
var path = require('path');
var self;
var cb;
var apis = [];
var schemaObj;

var promptMe = function (prompts, cb) {
  self.prompt(prompts).then(function (props) {
    // console.log('props JSON EXTRACTION', props);
    //
    // Extracting JSON Object from path
    //
    var contents = fs.readFileSync(path.resolve(props.JSONFilePath), 'utf8');
    if (props.dataType === 'Data Object') {
      try {
        schemaObj = GenerateSchema.json(props.resource, [JSON.parse(contents)]);
        delete schemaObj.$schema;
      } catch (error) {
        throw new Error('Your \'' + props.resource + '\' resource has a JSON error\n' + error.message);
      }
    // console.log('Type : \n' + typeof contents);
    // console.log('Output Content : \n' + contents);
    // console.log('apis', apis);
    } else {
      try {
        schemaObj = JSON.parse(contents);
      } catch (error) {
        throw new Error('Your \'' + props.resource + '\' resource has a JSON error\n' + error.message);
      }
    }
    //
    // Create temp object to push to API array
    //
    var temp = {
      resourceName: props.resource,
      JSONFilePath: props.JSONFilePath,
      JSONSchema: schemaObj,
      isPublic: props.isPublic,
      HTTPMethods: props.APIHttpMethods,
      httpStatusCodes: ['204', '404', '500'],
      requireFakeData: props.requireFakeData,
      numberOfFakeRecords: props.numberOfFakeRecords,
      requireQuery: props.requireQuery,
      whichParameter: props.whichParameter
    };
    //
    // Push object of info to API array
    //
    apis.push(temp);
    //
    // If client has more resources continue asking questions if not save and break
    //
    if (props.ContinueBoolean) {
      promptMe(prompts, cb);
    } else {
      self.config.set({JSONExtraction: apis});
      cb();
    }
  });
};

module.exports = yeoman.Base.extend({
  prompting: function () {
    self = this;
    cb = this.async();
    var prompts = [{
      name: 'dataType',
      message: 'Do you have a Data Object or a Data Schema?',
      type: 'list',
      choices: ['Data Object', 'Data Schema']
    }, {
      type: 'input',
      name: 'resource',
      message: 'Enter name of your resource?',
      validate: function (input) {
        if (input.length === 0) {
          return 'You forgot to enter resource name!!!';
        } else {
          var done = this.async();
          done(null, true);
        }
      }
    }, {
      type: 'input',
      name: 'JSONFilePath',
      message: 'Enter path of your resource?',
      validate: function (input) {
        if (input.length === 0) {
          return 'You forgot to enter resource location!!!';
        } else {
          var done = this.async();
          done(null, true);
        }
      }
    }, {
      type: 'confirm',
      name: 'isPublic',
      message: 'Would you like this resource to be public?',
      default: true
    }, {
      when: function (response) {
        return response.isPublic;
      },
      type: 'checkbox',
      name: 'APIHttpMethods',
      message: 'Which http methods you would like to generate?',
      choices: [{
        name: 'GET',
        value: 'get',
        checked: true
      },
        {
          name: 'POST',
          value: 'post',
          checked: true
        },
        {
          name: 'PUT',
          value: 'put',
          checked: true
        },
        {
          name: 'PATCH',
          value: 'patch',
          checked: true
        },
        {
          name: 'DELETE',
          value: 'delete',
          checked: true
        }
      ]
    }, {
      name: 'requireFakeData',
      type: 'confirm',
      message: 'Would you like to have test data for your API?'
    }, {
      when: function (response) {
        return response.requireFakeData;
      },
      name: 'numberOfFakeRecords',
      type: 'number',
      message: 'How many records of test data would you like to have?'
    }, {
      name: 'requireQuery',
      type: 'confirm',
      message: 'Would you like to query this API?'
    }, {
      when: function (response) {
        return response.requireQuery;
      },
      name: 'whichParameter',
      type: 'input',
      message: 'By which parameter?'
    }, {
      type: 'confirm',
      name: 'ContinueBoolean',
      message: 'Do you have more resources?'
    }];
    // Will ask questions about api until user is finished
    promptMe(prompts, function () {
      console.log('done');
      cb();
    });
  }
});
