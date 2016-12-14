'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var self;
var cb;
var apis = [];

var promptMe = function (prompts, cb) {
  console.log('wemade it in hre', prompts);
  self.prompt(prompts).then(function (props) {
    console.log('props JSONVONVERSIOn', props);
    var content = fs.readFileSync(props.JSONObjectPath);
    console.log('Type : \n' + typeof content);
    console.log('Output Content : \n' + content);
    console.log('apisssss', apis);
    var temp = {
      resourceName: props.resource,
      JSONObjectPath: props.JSONObjectPath,
      JSONObject: content
    };
    apis.push(temp);
    if (props.ContinueBoolean) {
      promptMe(prompts, cb);
    } else {
      self.config.set({JSONExtraction: apis});
      cb();
    }
  });
};

module.exports = yeoman.Base.extend({
  prompting: function () {
    self = this;
    cb = this.async();
    var prompts = [{
      type: 'input',
      name: 'resource',
      message: 'Name your resource.'
    }, {
      type: 'input',
      name: 'JSONObjectPath',
      message: 'Please provide the file path to your JSON Object.'
    }, {
      type: 'confirm',
      name: 'ContinueBoolean',
      message: 'Do you have more resources?'
    }];

    return promptMe(prompts, function () {
      console.log('doneeee');
      cb();
    });
  }
});

