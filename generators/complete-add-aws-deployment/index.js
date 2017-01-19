'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');

module.exports = yeoman.Base.extend({
  prompting: function () {
      var done = this.async();
      var allConfig = this.config.getAll();
      var prompts = [{
        when: function () {
          if(allConfig.DataInput.accessKeyId !== undefined){
            return false;
          }else {
            return true;
          }
        },
        type: 'input',
        name: 'accessKeyId',
        message: 'Enter your AWS accessId?',
        store: true
      }, {
        when: function () {
          if(allConfig.DataInput.secretAccessKey !== undefined){
            return false;
          }else {
            return true;
          }
        },
        type: 'input',
        name: 'secretAccessKey',
        message: 'Enter your AWS secret access?',
        store: true
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
        when: function () {
          if(allConfig.DataInput.s3BucketName !== undefined){
            return false;
          }else {
            return true;
          }
        },
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
    var allConfig = this.config.getAll();
    this.fs.copyTpl(
      this.templatePath('config.json'),
      this.destinationPath('./aws/config.json'), {
        accessKeyId: this.props.accessKeyId || allConfig.DataInput.accessKeyId,
        secretAccessKey: this.props.secretAccessKey || allConfig.DataInput.secretAccessKey,
        region: this.props.region
      }
    );
    this.fs.copyTpl(
      this.templatePath('parameters.json'),
      this.destinationPath('./aws/parameters.json'), {
        stackName: this.props.stackName,
        s3BucketName: this.props.s3BucketName || allConfig.DataInput.s3BucketName,
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
            "application/json":{}
            //"application/json": "{\"method\": \""+httpMethod+capitalizeFirstLetter(apiPath.resourceName)+"\"}"
          },
          "responses": {
            "default": {
              "statusCode": "200",
              "responseParameters": {
                "method.response.header.Access-Control-Allow-Origin" : "'*'"
              }
            }
          }
        };
        if(httpMethod === 'get'){
          options.requestTemplates["application/json"] = "{\"method\": \""+httpMethod+capitalizeFirstLetter(apiPath.resourceName)+"\"}";
        }
        /*else if(httpMethod === 'post'){
          options.requestTemplates["application/json"] = "{\"method\": \""+httpMethod+capitalizeFirstLetter(apiPath.resourceName)+"\", \"body\": $input.json('$')}";
          options.responses.default.statusCode = "201";
        }*/
        else {
            options.requestTemplates["application/json"] = "{\"method\": \""+httpMethod+capitalizeFirstLetter(apiPath.resourceName)+"\", \"body\": $input.json('$')}";
            options.responses.default.statusCode = "204";
        }
        apiPath.httpStatusCodes.forEach(function (httpStatusCode) {
          if(httpMethod === 'get' && httpStatusCode === '204'){
            inputJSON.paths['/'+apiPath.resourceName+'s'][httpMethod]["responses"]["200"].headers = {
              "Access-Control-Allow-Origin": {
                "type": "string"
              }
            }
          }else{
            inputJSON.paths['/'+apiPath.resourceName+'s'][httpMethod]["responses"][httpStatusCode]["headers"] = {
              "Access-Control-Allow-Origin": {
                "type": "string"
              }
            }
          }

        });
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
