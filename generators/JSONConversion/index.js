'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');

module.exports = yeoman.Base.extend({
  prompting: function () {
    console.log('JSON CONVERSION');
    var prompts = [{
      type: 'input',
      name: 'JSONObjectPath',
      message: 'Please provide the file path to your JSON Object.'
    }];
    return this.prompt(prompts).then(function (props) {
      console.log('props', props);
      this.config.set({JSONConversion: props});
      // Extract JSON from file path
      var content = fs.readFileSync(props.JSONObjectPath);
      console.log('Type : \n' + typeof content);
      console.log('Output Content : \n' + content);
    }.bind(this));
  }
});
