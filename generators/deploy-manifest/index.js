'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var fs = require('fs');
var path = require('path');
var writeYaml = require('write-yaml');

module.exports = yeoman.Base.extend({

  prompting: function () {
    var done = this.async();
    // Have Yeoman greet the user.
    // this.log(yosay(
    //   'Welcome to the prime ' + chalk.red('generator-soju') + ' generator!'
    // ));
    this.log('Welcome to ' + chalk.red('generator-cedrus-api') + ' v 1.0.0');
    this.log()

    var prompts = [{
      type: 'input',
      name: 'name',
      message: 'What is the name of your application?'
    }, {
      type: 'list',
      name: 'memory',
      message: 'How much memory do you want to set for this app?',
      choices: [ '256M', '512M' ]
    }];

    return this.prompt(prompts).then(function (props) {
      this.appName = props.name;
      this.appMemory = props.memory;
      done();
    }.bind(this));
  },

  writing: function () {
    var context = {
      appName: this.appName,
      appMemory: this.appMemory
    };
    this.template("manifest.yml", "manifest.yml", context);
    this.copy(".cfignore", ".cfignore");
    var cb=this.async();
    updateYamlForBluemix(this.appName, cb);
  }

 });

var updateYamlForBluemix = function(appName, cb){
  fs.readFile(path.resolve('swaggerConfig/input.json'), 'utf8', function (error, jsonObj) {
    if (error) {
      cb(error);
    }
    var inputJSON = JSON.parse(jsonObj);
    var index = inputJSON.schemes.indexOf('http');
    if (index > -1) {
      inputJSON.schemes.splice(index, 1);
    }
    inputJSON.host = '$(catalog.host)';
    inputJSON['x-ibm-configuration'].assembly.execute[0].invoke['target-url'] = 'https://'+appName.toLowerCase()+'.mybluemix.net$(request.path)$(request.search)';
    fs.writeFile('swaggerConfig/bluemix.json', JSON.stringify(inputJSON), function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('The Json file is saved!');
    /*
    **  Creating the Yaml file from the json
    */
      writeYaml('swaggerConfig/bluemix.yaml', inputJSON, function (err) {
        if (err) {
          return console.log(err);
        }
        console.log('The Yaml file is saved!');
        cb();
      });
    });
  });

}
