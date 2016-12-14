'use strict';
var yeoman = require('yeoman-generator');

module.exports = yeoman.Base.extend({
  prompting: function () {
    console.log('DATA INPUT');
    var prompts = [{
      type: 'confirm',
      name: 'JSONAvailable',
      message: 'Do you have JSON object available to turn into your API?',
      default: true
    }];
    return this.prompt(prompts).then(function (props) {
      console.log('props DataInput', props);
      this.config.set({DataInput: props});
      if (props.JSONAvailable) {
        this.composeWith('cedrus-api:JSONConversion');
      } else {
        this.composeWith('cedrus-api:StartLoopback');
      }
    }.bind(this));
  }
});
