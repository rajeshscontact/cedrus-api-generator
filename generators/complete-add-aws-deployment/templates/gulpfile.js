var gulp = require('gulp'),
    fs = require('fs'),
    AWS = require('aws-sdk'),
    runSequence = require('run-sequence'),
    zip = require('gulp-zip'),
    replace = require('gulp-replace'),
    jeditor = require("gulp-json-editor"),
    awsConfig = require('./aws/config.json'),
    gulpS3Upload = require('gulp-s3-upload')(awsConfig)
    inputConfig = require('./aws/parameters.json');

    AWS.config.update({accessKeyId:awsConfig.accessKeyId, secretAccessKey: awsConfig.secretAccessKey, region:awsConfig.region});

var s3 = new AWS.S3(),
    cloudformation = new AWS.CloudFormation(),
    apigateway = new AWS.APIGateway(),
    restAPIId;

    gulp.task('aws-deploy', function(callback) {
       runSequence('empty-s3-buckets',
                  'create-zip',
                  'upload-s3-client',
                  'create-or-update-stack',
                  'update-swagger-json',
                  'register-api',
                  'update-apiid-in-parameters',
                  'update-stack-with-api-details',
                  'deploy-api',
                   callback);
    });

    gulp.task('create-or-update-stack', function(callback){
      var params = {
        StackStatusFilter: [
          'CREATE_IN_PROGRESS',
          'CREATE_FAILED',
          'CREATE_COMPLETE',
          'ROLLBACK_IN_PROGRESS',
          'ROLLBACK_FAILED',
          'ROLLBACK_COMPLETE',
          'DELETE_IN_PROGRESS',
          'DELETE_FAILED',
          'UPDATE_IN_PROGRESS',
          'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS',
          'UPDATE_COMPLETE',
          'UPDATE_ROLLBACK_IN_PROGRESS',
          'UPDATE_ROLLBACK_FAILED',
          'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS',
          'UPDATE_ROLLBACK_COMPLETE',
          'REVIEW_IN_PROGRESS'
        ]
      };
      cloudformation.listStacks(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
        }
        else {
          var stackExists = false,
          stackParameters = {
            StackName: inputConfig.cloudformation.stackName,
            Capabilities: inputConfig.cloudformation.Capabilities,
            Parameters: [{
              ParameterKey: 'S3Bucket',
              ParameterValue: inputConfig.s3BucketName
            }],
            TemplateBody: JSON.stringify(require(inputConfig.cloudformation.templateLocation))
          };
          validateTemplate(stackParameters.TemplateBody, function(err, response){
            if(response){
              if(data.StackSummaries.length > 1){
                data.StackSummaries.forEach(function(stack){
                  if(stack.StackName === inputConfig.cloudformation.stackName){
                    stackExists = true;
                    updateStack(stackParameters, function(){
                      callback();
                    });
                  }
                });
              }
              if(!stackExists){
                createStack(stackParameters, function(){
                  callback();
                });
              }
            }
          });
        }
      });
    });

    function updateStack(parameters, cb){
      cloudformation.updateStack(parameters, function(err, data) {
        if (err){
          console.log(err, err.stack); // an error occurred
        }
        else{
          console.log(data);           // successful response
          cloudformation.waitFor('stackUpdateComplete', {StackName: parameters.StackName}, function(err, data) {
            if (err) {
              console.log(err, err.stack); // an error occurred
            }
            else {
              console.log(data); // successful response
              cb();
            }
          });
        }
      });
    };

    function createStack(parameters, cb){
      cloudformation.createStack(parameters, function(err, data) {
        if (err){
          console.log(err, err.stack); // an error occurred
        }
        else{
          console.log(data);           // successful response
          cloudformation.waitFor('stackCreateComplete', {StackName: parameters.StackName}, function(err, data) {
            if (err) {
              console.log(err, err.stack); // an error occurred
            }
            else {
              console.log(data); // successful response
              cb();
            }
          });
        }
      });
    };

    function validateTemplate(body, cb){
      var parameters = {
        TemplateBody: body
      }
      cloudformation.validateTemplate(parameters, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          cb(err);
        }
        else {
          //console.log(data);           // successful response
          cb(null, true);
        }
      });
    };

    function getLambdaArn(stackName, cb){
      var parameters = {
        StackName: stackName
      }
      cloudformation.describeStacks(parameters, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          cb(err);
        }
        else {
          console.log(data.Stacks[0].Outputs);           // successful response
          cb(false, data.Stacks[0].Outputs[0].OutputValue);
        }
      });
    }

    gulp.task('create-zip', function(){
      return gulp.src(['aws/**', '!./aws/**.zip', '!./aws/config.json', '!./aws/parameters.json', 'sampleData/**' ])
        .pipe(zip('lambda.zip'))
        .pipe(gulp.dest('aws'));
    });

    gulp.task('empty-s3-buckets', function(callback) {
      var bucketListFromConfig = [inputConfig.s3BucketName];
        clearS3(bucketListFromConfig, function(){
          callback();
        });
    });

    function clearS3(s3Array, cb){
      var count = 0;
      s3Array.forEach(function(s3BucketName){
        var params = {
          Bucket: s3BucketName
        };
        count ++;

        s3.listObjects(params, function(err, data){
          if(data !== null && data.Contents !== null){
            //console.log('DATA:', data.Contents);
            params.Delete = {Objects:[]};
            data.Contents.forEach(function(content) {
              params.Delete.Objects.push({Key: content.Key});
            });
            s3.deleteObjects(params, function(err, data){
              if(count === s3Array.length){
                cb();
              }
            });
          }
        });
      });
    }

    gulp.task('upload-s3-client', function(){
      return gulp.src(['./aws/**', '!./aws/config.json', '!./aws/parameters.json'])
        .pipe(gulpS3Upload({
            Bucket: inputConfig.s3BucketName, //  Required
            ACL:    'public-read'       //  Needs to be user-defined
        }, {
            maxRetries: 5
        }))
    });

    gulp.task('update-swagger-json', function(callback){
      getLambdaArn(inputConfig.cloudformation.stackName, function(err, resp){
        if(!err){
          gulp.src(inputConfig.swaggerJsonLocation)
          .pipe(replace('$AWSRegion', awsConfig.region))
          .pipe(replace('$LambdaArn', resp))
          .pipe(gulp.dest('./aws'))
          .on('end', function(){callback()});
        }
      });
    });

    gulp.task('register-api', function(callback){
      var parameters = {
        body: JSON.stringify(require(inputConfig.swaggerJsonLocation)),
        failOnWarnings: false
      }
      checkIfApiExists(function(apiAvailable){
        if(!apiAvailable){
          apigateway.importRestApi(parameters, function(err, data) {
            if (err) {
              console.log(err, err.stack); // an error occurred
            }
            else {
              console.log(data);           // successful response
              restAPIId = data.id;
              callback();
            }
          });
        } else {
          parameters.restApiId = inputConfig.apigateway.id;
          apigateway.importRestApi(parameters, function(err, data) {
            if (err) {
              console.log(err, err.stack); // an error occurred
            }
            else {
              console.log(data);           // successful response
              restAPIId = data.id;
              callback();
            }
          });
        }
      });
    });

    function checkIfApiExists(cb){
      var apiAvailable = false;
      if(inputConfig.apigateway.id === ""){
        cb(apiAvailable);
      }
      if(typeof inputConfig.apigateway.id !== 'undefined' && inputConfig.apigateway.id !== null){
        var parameters = {
          restApiId : inputConfig.apigateway.id
        };
        apigateway.getRestApi(parameters, function(err, data) {
          if (err) {
            console.log(err, err.stack);
            cb(apiAvailable);
          }
          else {
            console.log(data);
            apiAvailable = true;
            cb(apiAvailable);
          }
        });
      }
    }

    gulp.task('update-apiid-in-parameters', function(callback){
      if(typeof restAPIId !== 'undefined' && restAPIId !== null){
        gulp.src("./aws/parameters.json")
          .pipe(jeditor(function(json) {
            json.apigateway.url = inputConfig.apigateway.id+'.execute-api.'+awsConfig.region+'.amazonaws.com/'+inputConfig.apigateway.stage;
            json.apigateway.id = restAPIId;
            return json;
          }))
          .pipe(gulp.dest("./aws"))
          .on('end', function(){
            inputConfig.apigateway.id =  restAPIId;
            callback();
          });
      }else{
        callback();
      }
    });

    gulp.task('update-stack-with-api-details', function(callback){
      var stackParameters = {
        StackName: inputConfig.cloudformation.stackName,
        Capabilities: inputConfig.cloudformation.Capabilities,
        Parameters: [{
          ParameterKey: 'S3Bucket',
          UsePreviousValue: true
        },{
          ParameterKey: 'S3Key',
          UsePreviousValue: true
        },{
          ParameterKey: 'ApiId',
          ParameterValue: inputConfig.apigateway.id
        }],
        TemplateBody: JSON.stringify(require(inputConfig.cloudformation.templateLocation))
      };
      updateStack(stackParameters, function(){
        callback();
      });
    });

    gulp.task('deploy-api', function(callback){
      var parameters = {
        restApiId: inputConfig.apigateway.id,
        stageName: inputConfig.apigateway.stage
      }
      checkIfApiExists(function(apiAvailable){
        if(apiAvailable){
          apigateway.createDeployment(parameters, function(err, data) {
            if (err) {
              console.log(err, err.stack); // an error occurred
            }
            else {
              console.log(data);           // successful response.
              var basePathApi = inputConfig.apigateway.id+'.execute-api.'+awsConfig.region+'.amazonaws.com/'+inputConfig.apigateway.stage;
              console.log('You can access your api through the base path of -------->', basePathApi);
              callback();
            }
          });
        }else{
          return null;
        }
      });
    });
