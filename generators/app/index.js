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
      type: 'input',
      name: 'APIName',
      message: 'What would you like to call your API?'
    },
      {
        type: 'input',
        name: 'APIDescription',
        message: 'Describe your API.'
      }];

    return this.prompt(prompts).then(function (props) {
      console.log('props APP', props);
      this.config.set({APIOverviewProps: props});
      this.composeWith('cedrus-api:DataInput');
    }.bind(this));
  },

  install: function () {
    this.config.save();
    // this.installDependencies();
  }
});
