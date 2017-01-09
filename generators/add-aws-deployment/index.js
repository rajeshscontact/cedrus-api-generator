'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');

module.exports = yeoman.Base.extend({
  prompting: function () {
    console.log('START Aws deployment');
  },
  writing: function () {
    // this.copy('input.yaml', 'swaggerConfig/input.yaml');
  },
  end: function () {
    this.npmInstall(['gulp', 'aws-sdk', 'del', 'gulp-install', 'gulp-rename', 'gulp-zip', 'run-sequence'],{'save-dev': true});
  }
});
