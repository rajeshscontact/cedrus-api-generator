'use strict';
var yeoman = require('yeoman-generator');

module.exports = yeoman.Base.extend({
  prompting: function () {
  },
  end: function () {
    this.spawnCommand('gulp', ['aws-deploy']);
  }
});
