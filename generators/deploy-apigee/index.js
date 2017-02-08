'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');
var deployCommand = 'deploynodeapp ';
var writeYaml = require('write-yaml');

module.exports = yeoman.Base.extend({
  prompting: function () {
      var done = this.async();
      var allConfig = this.config.getAll();
      var prompts = [{
        type: 'input',
        name: 'apigeeApplicationName',
        message: 'Enter name of application to be deployed in apigee?',
        default: allConfig.APIOverviewProps.APIName
      }, {
        type: 'input',
        name: 'apigeeUsername',
        message: 'Enter your apigee username?',
        store : true
      }, {
        type: 'password',
        name: 'apigeePassword',
        message: 'Enter your apigee password?'
      }, {
        type: 'input',
        name: 'apigeeOrganization',
        message: 'Enter your apigee organization?',
        store : true
      }, {
        type: 'input',
        name: 'apigeeDeployment',
        message: 'Enter to which environment you would like to deploy?',
        default : 'test',
        store : true
      }];
      return this.prompt(prompts).then(function (props) {
        this.props = props;
        //deployCommand = ' -n '+props.apigeeApplicationName+' -d . -m index.js -o '+props.apigeeOrganization+' -e '+props.apigeeDeployment+' -u '+props.apigeeUsername+' -p '+props.apigeePassword;
        done();
      }.bind(this));
  },
  writing: function () {
     this.npmInstall([
      'apigeetool'
    ],{'save-dev': true});
  },
  end: function () {
    var props = this.props;
    process.chdir('./node_modules/.bin/');
    console.log('Deploying the microapp to Apigee');
    this.spawnCommandSync('apigeetool', ['deploynodeapp', '-n', props.apigeeApplicationName, '-d', '../../', '-o', props.apigeeOrganization, '-e', props.apigeeDeployment, '-u', props.apigeeUsername, '-p', props.apigeePassword, '-m', '../../index.js']);
    console.log('Creating Product in Apigee');
    this.spawnCommandSync('apigeetool', ['createProduct', '--productName', props.apigeeApplicationName+'Product', '--proxies', props.apigeeApplicationName, '-o', props.apigeeOrganization, '--environments', props.apigeeDeployment, '-u', props.apigeeUsername, '-p', props.apigeePassword, '--approvalType', 'Automatic']);
    process.chdir('../../');
    var cb=this.async();
    updateYamlForApigee(props.apigeeOrganization, props.apigeeDeployment, cb);
  }
});

var updateYamlForApigee = function(organizationName, deploymentName, cb){
  fs.readFile(path.resolve('swaggerConfig/input.json'), 'utf8', function (error, jsonObj) {
    if (error) {
      cb(error);
    }
    var inputJSON = JSON.parse(jsonObj);
    inputJSON.host = organizationName+'-'+deploymentName+'.apigee.net';
    fs.writeFile('swaggerConfig/apigee.json', JSON.stringify(inputJSON), function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('The Json file is saved!');
    /*
    **  Creating the Yaml file from the json
    */
      writeYaml('swaggerConfig/apigee.yaml', inputJSON, function (err) {
        if (err) {
          return console.log(err);
        }
        console.log('The Yaml file is saved!');
        cb();
      });
    });
  });

}
