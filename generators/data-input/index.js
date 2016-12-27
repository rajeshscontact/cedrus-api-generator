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
      // console.log('props DataInput', props);
      this.config.set({DataInput: props});
      if (props.JSONAvailable) {
        this.composeWith('cedrus-api:json-extraction');
        this.composeWith('cedrus-api:json-input');
        this.composeWith('cedrus-api:http-status-codes');
        this.composeWith('cedrus-api:add-parameters');
        this.composeWith('cedrus-api:query-api');
        this.composeWith('cedrus-api:create-yaml');
        this.composeWith('cedrus-api:start-swagger-gen');
        this.composeWith('cedrus-api:fake-data', {options: {runningThrough: 'generator'}});
      } else {
        this.composeWith('cedrus-api:create-yaml');
        this.composeWith('cedrus-api:start-swagger-gen');
      }
    }.bind(this));
  }
});
