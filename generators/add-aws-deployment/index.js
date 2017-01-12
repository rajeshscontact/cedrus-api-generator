'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');

module.exports = yeoman.Base.extend({
  prompting: function () {
    console.log('START Aws deployment');

      var done = this.async();
      var prompts = [{
        type: 'input',
        name: 'accessKeyId',
        message: 'Enter your AWS accessId?'
      }, {
        type: 'input',
        name: 'secretAccessKey',
        message: 'Enter your AWS secret access?'
      }, {
        type: 'input',
        name: 'region',
        message: 'Enter your AWS region?',
        default: 'us-east-1'
      }, {
        type: 'input',
        name: 'stackName',
        message: 'Enter your stack name?',
        default: 'SimpleApiCloudFormationStack'
      }, {
        type: 'input',
        name: 's3BucketName',
        message: 'Enter your bucket name?',
        default: 'myS3Bucket'
      }, {
        type: 'input',
        name: 'deploymentStageName',
        message: 'Enter your deployment stage name?',
        default: 'dev'
      }];
      return this.prompt(prompts).then(function (props) {
        this.props = props;
        if (!fs.existsSync('./aws')) {
          fs.mkdirSync('./aws');
        }
        done();
      }.bind(this));
  },
  writing: function () {
    this.fs.copyTpl(
      this.templatePath('config.json'),
      this.destinationPath('./aws/config.json'), {
        accessKeyId: this.props.accessKeyId,
        secretAccessKey: this.props.secretAccessKey,
        region: this.props.region
      }
    );
    this.fs.copyTpl(
      this.templatePath('parameters.json'),
      this.destinationPath('./aws/parameters.json'), {
        stackName: this.props.stackName,
        s3BucketName: this.props.s3BucketName,
        deploymentStageName: this.props.deploymentStageName
      }
    );
    this.fs.copyTpl(
      this.templatePath('template.json'),
      this.destinationPath('./aws/template.json')
    );
    this.fs.copyTpl(
      this.templatePath('index.js'),
      this.destinationPath('./aws/index.js')
    );
    this.fs.copyTpl(
      this.templatePath('gulpfile.js'),
      this.destinationPath('./gulpfile.js')
    );
  },
  end: function () {
    var configOptions = this.config.getAll();
    var apiPaths = configOptions.JSONExtraction;
    this.fs.copyTpl(
      this.templatePath('indexService.js'),
      this.destinationPath('./aws/indexService.js'), {
        apiPaths : apiPaths
      }
    );
    var cb = this.async();
    addAWSAPGatewayStuff(apiPaths, cb);
    this.npmInstall([
      'gulp',
      'aws-sdk',
      'gulp-install',
      'gulp-rename',
      'gulp-zip',
      'run-sequence',
      'gulp-json-editor',
      'gulp-replace',
      'gulp-s3-upload'
    ],{'save-dev': true});
  }
});

var addAWSAPGatewayStuff = function(apiPaths, cb){
  fs.readFile(path.resolve('swaggerConfig/input.json'), 'utf8', function (error, jsonObj) {
    if (error) {
      throw error;
    }
    var inputJSON = JSON.parse(jsonObj);
    apiPaths.forEach(function(apiPath){
      var httpMethods = apiPath.HTTPMethods;
      httpMethods.forEach(function(httpMethod){
        //console.log('++++++++++++++++++++++++++++++++++++', inputJSON.paths['/'+apiPath.resourceName+'s'][httpMethod]);
        var options = {
          "type": "aws",
          "uri": "arn:aws:apigateway:$AWSRegion:lambda:path/2015-03-31/functions/$LambdaArn/invocations",
          "httpMethod": 'POST',
          "requestTemplates": {
            "application/json": "{\"method\": \""+httpMethod+capitalizeFirstLetter(apiPath.resourceName)+"\"}"
          },
          "responses": {
            "default": {
              "statusCode": "200"
            }
          }
        };
        inputJSON.paths['/'+apiPath.resourceName+'s'][httpMethod]['x-amazon-apigateway-integration'] = options;
      });
    });
    fs.writeFile('aws/swagger.json', JSON.stringify(inputJSON), function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('The Json file is saved!');
      cb();
    });
  });
}

var capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
