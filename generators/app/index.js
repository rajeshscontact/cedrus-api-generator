'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the Cedrus ' + chalk.red('generator-cedrus-api') + ' generator!'
    ));

    var prompts = [{
      type: 'input',
      name: 'APIName',
      message: 'What would you like to call your API?',
      default: 'Sample API'
    }, {
      type: 'input',
      name: 'APIDescription',
      message: 'Describe your API.',
      default: 'This is sample API being generated by cedrus-api generator'
    }, {
      type: 'input',
      name: 'APIBasePath',
      message: 'Enter Base Path of your api.',
      default: '/api'
    }, {
      type: 'checkbox',
      name: 'APIConsumes',
      message: 'which type of files api consumes',
      choices: [
        {
          name: 'JSON',
          value: 'application/json',
          checked: true
        },
        {
          name: 'XML',
          value: 'application/xml'
        },
        {
          name: 'TEXT XML',
          value: 'text/xml'
        },
        {
          name: 'TEXT HTML',
          value: 'text/html'
        }
      ]
    }, {
      type: 'checkbox',
      name: 'APIProduces',
      message: 'which type of files api produces',
      choices: [
        {
          name: 'JSON',
          value: 'application/json',
          checked: true
        },
        {
          name: 'XML',
          value: 'application/xml'
        },
        {
          name: 'TEXT XML',
          value: 'text/xml'
        },
        {
          name: 'TEXT HTML',
          value: 'text/html'
        }
      ]
    }];

    return this.prompt(prompts).then(function (props) {
      // console.log('props APP', props);
      this.config.set({APIOverviewProps: props});
      this.composeWith('cedrus-api:data-input');
    }.bind(this));
  },

  install: function () {
    this.config.save();
  }
});
