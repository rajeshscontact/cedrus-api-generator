'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var jsonSchemaGenerator = require('json-schema-generator');
var path = require('path');
var self;
var cb;
var apis = [];

var promptMe = function (prompts, cb) {
  self.prompt(prompts).then(function (props) {
    // console.log('props JSON EXTRACTION', props);
    //
    // Extracting JSON Object from path
    //
    var contents = fs.readFileSync(path.resolve(props.JSONFilePath), 'utf8');
    var schemaObj = jsonSchemaGenerator(JSON.parse(contents));
    delete schemaObj['$schema'];
    // console.log('Type : \n' + typeof contents);
    // console.log('Output Content : \n' + contents);
    //console.log('apis', apis);
    //
    // Create temp object to push to API array
    //
    var temp = {
      resourceName: props.resource,
      JSONFilePath: props.JSONFilePath,
      JSONSchema: schemaObj,
      isPublic: props.isPublic,
      HTTPMethods: props.APIHttpMethods,
      requireFakeData: props.requireFakeData,
      numberOfFakeRecords: props.numberOfFakeRecords
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
      type: 'input',
      name: 'resource',
      message: 'Name your resource.',
      validate: function(input){
        if(input.length === 0){
          return "Please enter Name of your Resource!";
        }else{
          var done = this.async();
          done(null, true);
        }
      }
    }, {
      type: 'input',
      name: 'JSONFilePath',
      message: 'Please provide the file path to your JSON Object.',
      validate: function(input){
        if(input.length === 0){
          return "Please enter Path of your Resource!";
        }else{
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
      message: 'Which http methods you would like to generate:',
      choices: [
        {
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
        message: 'Would you like to have Fake Data for your API?'
    }, {
        when: function(response) {
            return response.requireFakeData;
        },
        name: 'numberOfFakeRecords',
        type: 'number',
        message: 'How many records would you like to have?'
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
