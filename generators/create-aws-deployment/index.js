'use strict';
var yeoman = require('yeoman-generator'),
  AWS = require('aws-sdk'),
  s3 = new AWS.S3();

module.exports = yeoman.Base.extend({
  prompting: function () {
    // console.log('DATA INPUT');
    var prompts = [{
      type: 'confirm',
      name: 's3BucketAvailable',
      message: 'Do you have an existing S3 bucket?',
      default: true
    }, {
      when: function(response){
        if(! response.s3BucketAvailable){
          return true;
        }else {
          return false;
        }
      },
      type: 'confirm',
      name: 'createS3Bucket',
      message: 'Do you want generator to create s3 bucket?',
      default: true
    }, {
      when: function (response) {
        if((!response.s3BucketAvailable) && response.createS3Bucket){
          return true;
        }else {
          return false;
        }
      },
      type: 'input',
      name: 'accessKeyId',
      message: 'Enter your AWS accessId?',
      store: true
    }, {
      when: function (response) {
        if((!response.s3BucketAvailable) && response.createS3Bucket){
          return true;
        }else {
          return false;
        }
      },
      type: 'input',
      name: 'secretAccessKey',
      message: 'Enter your AWS secret access?',
      store: true
    }, {
      when: function (response) {
        if((!response.s3BucketAvailable) && response.createS3Bucket){
          return true;
        }else {
          return false;
        }
      },
      type: 'input',
      name: 's3BucketName',
      message: 'Enter your bucket name?',
      default: 'myS3Bucket'
    }];
    return this.prompt(prompts).then(function (props) {
      // console.log('props DataInput', props);
      var DataToSaveInYo = props;
      if(props.s3BucketAvailable){
        this.composeWith('cedrus-api:complete-add-aws-deployment');
      }else if(props.createS3Bucket){
        var allConfig = this.config.getAll();
        var bucketName = props.s3BucketName + '-' +(allConfig.APIOverviewProps.APIName).split(' ').join('-')+ '-' +Date.now();
        DataToSaveInYo.s3BucketName = bucketName.toLowerCase();
        var thisFunc = this;
        var params = {
          Bucket : bucketName.toLowerCase()
        }
        s3.createBucket(params, function(err, data) {
          if (err) {
            console.log(err.message);
            console.log('Please follow the steps below to create a bucketin AWS');
            console.log('1. Sign into the AWS Management Console and open the Amazon S3 console at https://console.aws.amazon.com/s3.');
            console.log('2. Click Create Bucket.');
            console.log('3. In the Create a Bucket dialog box, in the Bucket Name box, enter a bucket name.');
            console.log('4. In the Region box, select a region.');
            console.log('5. Click Create.');
            console.log('Please execute "yo cedrus-api:add-aws-deployment" after completing above steps');
          }
          else {
            console.log('Your bucket has been created ',bucketName);
            thisFunc.composeWith('cedrus-api:complete-add-aws-deployment');
          }
        });
      }else {
        console.log('Please follow the steps below to create a bucketin AWS');
        console.log('1. Sign into the AWS Management Console and open the Amazon S3 console at https://console.aws.amazon.com/s3.');
        console.log('2. Click Create Bucket.');
        console.log('3. In the Create a Bucket dialog box, in the Bucket Name box, enter a bucket name.');
        console.log('4. In the Region box, select a region.');
        console.log('5. Click Create.');
        console.log('Please execute "yo cedrus-api:add-aws-deployment" after completing above steps');
      }
      this.config.set({DataInput: DataToSaveInYo});
    }.bind(this));
  }
});
