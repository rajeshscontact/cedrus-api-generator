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
    // console.log('Type : \n' + typeof contents);
    // console.log('Output Content : \n' + contents);
    console.log('apis', apis);
    //
    // Create temp object to push to API array
    //
    var temp = {
      resourceName: props.resource,
      JSONFilePath: props.JSONFilePath,
      JSONSchema: schemaObj,
      HTTPMethods: props.APIHttpMethods
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
      message: 'Name your resource.'
    }, {
      type: 'input',
      name: 'JSONFilePath',
      message: 'Please provide the file path to your JSON Object.'
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
