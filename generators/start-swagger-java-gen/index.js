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


module.exports = yeoman.Base.extend({
  prompting: function () {
    //console.log('START Swagger Gen for Java');
    var prompts = [{
      type: 'input',
      name: 'basePackage',
      message: 'Enter base package for your application?',
      default: 'io.cedrus.apigen'
    }, {
      type: 'list',
      name: 'framework',
      message: 'What framework would you like to be application generated in?',
      choices: [{
        name: 'Spring-Boot',
        value: ['spring', 'spring-boot']
      }, {
        name: 'Spring-MVC',
        value: ['spring', 'spring-mvc']
      }, {
        name: 'jaxrs',
        value: ['jaxrs', 'jaxrs']
      }]
    }, {
        when: function (response) {
          if(response.framework[1] === 'spring-boot'){
            return true;
          }else {
            return false;
          }
        },
        type: 'confirm',
        name: 'libertyProfile',
        message: 'Would you like your application to be liberty profile enabled?',
        default: true
    }];

    return this.prompt(prompts).then(function (props) {
      this.config.set({javaOptions: props});
    }.bind(this));
  },
  writing: function () {
  },
  end: function () {
    var cb = this.async();
    var thisFunc = this;
    var configOptions = this.config.getAll();
    runGen(configOptions.javaOptions, function(){
      copyTemplates(thisFunc, cb);
      thisFunc.composeWith('cedrus-api:copy-controllers-java');
    });
  }
});

var copyTemplates = function(thisFunc, cb){
  var configOptions = thisFunc.config.getAll();
  var javaOptions = configOptions.javaOptions;
  if(javaOptions.libertyProfile){
    var folderPath = (javaOptions.basePackage).split('.').join('/')
    //deleting existing files and replacing them with updated ones
    del(['./src/main/java/'+folderPath+'/Swagger2SpringBoot.java', './src/main/java/'+folderPath+'/config/HomeController.java', './pom.xml'], {force: true}).then(paths => {

        thisFunc.fs.copyTpl(
          thisFunc.templatePath('Swagger2SpringBoot.java'),
          thisFunc.destinationPath('./src/main/java/'+folderPath+'/Swagger2SpringBoot.java'), {
            basePackage: javaOptions.basePackage
          }
        );

        thisFunc.fs.copyTpl(
          thisFunc.templatePath('HomeController.java'),
          thisFunc.destinationPath('./src/main/java/'+folderPath+'/config/HomeController.java')
        );

        thisFunc.fs.copyTpl(
          thisFunc.templatePath('pom.xml'),
          thisFunc.destinationPath('./pom.xml'),{
            groupId: javaOptions.basePackage,
            artifactId: (configOptions.APIOverviewProps.APIName).split(' ').join('-'),
            appName: configOptions.APIOverviewProps.APIName,
            warContext: configOptions.APIOverviewProps.APIBasePath
          }
        );

      });

    //copying index.html
    thisFunc.fs.copyTpl(
      thisFunc.templatePath('index.html'),
      thisFunc.destinationPath('./src/main/webapp/index.html'), {
        basePath: configOptions.APIOverviewProps.APIBasePath,
        groupId: javaOptions.basePackage
      }
    );
    //copying ibm-web-ext.xml
    thisFunc.fs.copyTpl(
      thisFunc.templatePath('ibm-web-ext.xml'),
      thisFunc.destinationPath('./src/main/webapp/WEB-INF/ibm-web-ext.xml'), {
        basePath: configOptions.APIOverviewProps.APIBasePath
      }
    );
    //copying web.xml
    thisFunc.fs.copyTpl(
      thisFunc.templatePath('web.xml'),
      thisFunc.destinationPath('./src/main/webapp/WEB-INF/web.xml'), {
        basePath: configOptions.APIOverviewProps.APIBasePath,
        applicationName: configOptions.APIOverviewProps.APIDescription
      }
    );

    //copying server.xml
    thisFunc.fs.copyTpl(
      thisFunc.templatePath('server.xml'),
      thisFunc.destinationPath('./src/main/liberty/config/server.xml'), {
        applicationName: configOptions.APIOverviewProps.APIDescription
      }
    );
    cb();
  }else{
    cb();
  }
}

var runGen = function (javaOptions, cb) {
  fs.readFile(path.resolve('swaggerConfig/input.yaml'), 'utf8', function (error, yaml) {
    if (error) {
      throw error;
    }

    var swaggerObj = jsYaml.load(yaml);
    var language = javaOptions.framework[0];
    var postOptions = {
      basePackage: javaOptions.basePackage,
      configPackage: javaOptions.basePackage+'.config',
      apiPackage: javaOptions.basePackage+'.api',
      modelPackage: javaOptions.basePackage+'.model'
    }
    if(javaOptions.framework[0] === 'spring'){
      postOptions.library = javaOptions.framework[1];
    }

    var postBody = {
      spec: swaggerObj,
      options: postOptions
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

      // console.log('response', responseObj);

      request({
        url: responseObj.link,
        encoding: null
      }).pipe(unzip.Extract({path: '.'}))
        .on('close', function () {
          ncp.limit = 16;
          ncp('./'+javaOptions.framework[0]+'-server', './', function (err) {
            if (err) {
              return cb(err);
            }
            del(['./'+javaOptions.framework[0]+'-server'], {force: true}).then(paths => {
              console.log('Files and folders that would be deleted:\n', paths.join('\n'));
              cb();
            });
          });
        });
    });
  });
};
