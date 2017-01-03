'use strict';
var yeoman = require('yeoman-generator');
var GenerateSchema = require('generate-schema');
var fs = require('fs');
var path = require('path');
var schemaObj;

module.exports = yeoman.Base.extend({
  prompting: function () {
    var done = this.async();
    var prompts = [{
      type: 'confirm',
      name: 'JSONAvailable',
      message: 'Do you have JSON object available to turn into your API?',
      // Defaults to the project's folder name if the input is skipped
      default: true
    }, {
      when: function (response) {
        return response.JSONAvailable;
      },
      name: 'dataType',
      message: 'Do you have a Data Object or a Data Schema?',
      type: 'list',
      choices: ['Data Object', 'Data Schema']
    }, {
      type: 'input',
      name: 'resourceName',
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
      when: function (response) {
        return response.requireFakeData;
      },
      name: 'numberOfFakeRecords',
      type: 'number',
      message: 'How many records would you like to have?'
    }];
    return this.prompt(prompts).then(function (props) {
      var contents = fs.readFileSync(path.resolve(props.JSONFilePath), 'utf8');
      if (props.dataType === 'Data Object') {
        try {
          schemaObj = GenerateSchema.json(props.resourceName, [JSON.parse(contents)]);
          delete schemaObj.$schema;
        } catch (error) {
          throw new Error('Your \'' + props.resourceName + '\' resource has a JSON error\n' + error.message);
        }
      } else {
        try {
          schemaObj = JSON.parse(contents);
        } catch (error) {
          throw new Error('Your \'' + props.resourceName + '\' resource has a JSON error\n' + error.message);
        }
      }
      props.JSONSchema = schemaObj;
      this.props = props;
      // Add resource to API ARRAY
      var temp = {
        resourceName: props.resourceName,
        JSONFilePath: props.JSONFilePath,
        JSONSchema: schemaObj,
        isPublic: props.isPublic,
        HTTPMethods: props.APIHttpMethods,
        requireFakeData: props.requireFakeData,
        numberOfFakeRecords: props.numberOfFakeRecords
      };
      var apis = this.config.getAll().JSONExtraction;
      apis.push(temp);
      this.config.set({JSONExtraction: apis});
      this.config.set({addResource: props});
      this.composeWith('cedrus-api:http-status-codes', {options: {runningThrough: 'AddResource'}});
      this.composeWith('cedrus-api:create-yaml');
      if (props.requireFakeData) {
        this.composeWith('cedrus-api:fake-data', {options: {runningThrough: 'AddResource'}});
      }
      done();
    }.bind(this));
  },
  writing: function () {
    if (this.props.isPublic) {
      // copying Resource to controllers
      this.fs.copyTpl(
        this.templatePath('resource.js'),
        this.destinationPath('./controllers/' + capitalizeFirstLetter(this.props.resourceName) + '.js'), {
          resourceName: capitalizeFirstLetter(this.props.resourceName),
          httpMethods: this.props.APIHttpMethods
        }
      );
      // copying ResourceService to controllers
      this.fs.copyTpl(
        this.templatePath('resourceService.js'),
        this.destinationPath('./controllers/' + capitalizeFirstLetter(this.props.resourceName) + 'Service.js'), {
          resourceName: capitalizeFirstLetter(this.props.resourceName),
          httpMethods: this.props.APIHttpMethods,
          fakeData: this.props.requireFakeData
        }
      );
    }
  },
  end: function () {
    var cb = this.async();
    cb();
  }
});

var updateYaml = function (cb) {
  fs.readFile(path.resolve('swaggerConfig/input.json'), 'utf8', function (error, jsonObj) {
    if (error) {
      throw error;
    }
    var inputJSON = JSON.parse(jsonObj);
    /*
    **  Creating the Yaml file from the json
    */
    writeYaml('swaggerConfig/input.yaml', inputJSON, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('The Yaml file is saved!');
      cb();
    });
  });
  cb();
};
var capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
