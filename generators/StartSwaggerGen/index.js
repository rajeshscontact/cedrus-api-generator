'use strict';
var yeoman = require('yeoman-generator');
var fs = require('fs');
var path = require('path');
var jsYaml = require('js-yaml');
var request = require('request');
var unzip = require('unzip2');
var ncp = require('ncp').ncp;
var del = require('del');

var codeGenEndpoint = 'http://generator.swagger.io/api/gen/servers';
var language = 'nodejs-server';

module.exports = yeoman.Base.extend({
  prompting: function () {
    console.log('START Swagger Gen');
  },
  writing: function () {
    // this.copy('input.yaml', 'swaggerConfig/input.yaml');
  },
  end: function () {
    var cb = this.async();
    runGen(cb);
    this.npmInstall();
  }
});

var runGen = function (cb) {
  fs.readFile(path.resolve('swaggerConfig/input.yaml'), 'utf8', function (error, yaml) {
    if (error) {
      throw error;
    }

    var swaggerObj = jsYaml.load(yaml);

    var postBody = {
      spec: swaggerObj,
      options: {
        modelPropertyNaming: 'camelCase',
        apiPackage: 'api.servers.settings',
        modelPackage: 'api.servers.settings'
      }
    };

    request.post({
      url: codeGenEndpoint + '/' + language,
      body: JSON.stringify(postBody),
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (error, response, body) {
      if (error) {
        throw error;
      }

      if (response.statusCode !== 200) {
        throw new Error('Response code was not 200. ' + body);
      }

      var responseObj = JSON.parse(body);

      //console.log('response', responseObj);

      request({
        url: responseObj.link,
        encoding: null
      }).pipe(unzip.Extract({path: '.'}))
        .on('close', function(){
          ncp.limit = 16;
          ncp('./nodejs-server-server', './', function (err) {
            if (err) {
              return console.error(err);
            }
            del(['./nodejs-server-server']);
            cb();
          });
        });
    });
  });
};
