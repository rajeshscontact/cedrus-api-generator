'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the hunky-dory ' + chalk.red('generator-cedrus-api') + ' generator!'
    ));

    var prompts = [{
      type: 'confirm',
      name: 'JSONSchema',
      message: 'Do you have a sample JSON object?',
      default: true
    }];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      console.log('props', props);
      this.config.set({"props": props})
      if (props.JSONSchema) {
        this.composeWith('cedrus-api:createJSONSchema');
      } else {
        this.composeWith('cedrus-api:startAPICreation')
      }
    }.bind(this));
  },

  install: function () {
    this.config.save();
    this.installDependencies();
  }
});
