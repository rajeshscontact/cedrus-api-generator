'use strict';
var yeoman = require('yeoman-generator');
var self;
var cb;
var relationships = [];

var promptMe = function (prompts, cb) {
  self.prompt(prompts).then(function (props) {
    //
    // Create temp object to push to Relationship array
    //
    var temp = {
      FromResource: props.FromResource,
      Relationship: props.Relationship,
      ToResource: props.ToResource
    };
    relationships.push(temp);
    //
    // If client has more relationships continue asking questions if not save and break
    //
    if (props.ContinueBoolean) {
      promptMe(prompts, cb);
    } else {
      self.config.set({APIRelationships: relationships});
      cb();
    }
  });
};

module.exports = yeoman.Base.extend({
  prompting: function () {
    console.log('ADD Relationships');
    var apiPaths = this.config.getAll().JSONExtraction;
    var resourceNames = [];
    self = this;
    cb = this.async();
    for (var i = 0; i < apiPaths.length; i++) {
      resourceNames.push(apiPaths[i].resourceName);
    }
    var prompts = [{
      type: 'list',
      name: 'FromResource',
      message: 'Which resource would you like to add a relationship to?',
      choices: resourceNames,
      default: true
    }, {
      type: 'list',
      name: 'Relationship',
      message: 'What type of relationship?',
      choices: ['BelongsTo', 'HasMany'],
      default: true
    }, {
      type: 'list',
      name: 'ToResource',
      message: 'Which resource do you want to attach to?',
      choices: resourceNames,
      default: true
    }, {
      type: 'confirm',
      name: 'ContinueBoolean',
      message: 'Do you want to add more relationships?',
      default: false
    }];
    promptMe(prompts, function () {
      console.log('done');
      cb();
    });
  },
  end: function () {
    this.composeWith('cedrus-api:http-status-codes-yaml');
  }
});
