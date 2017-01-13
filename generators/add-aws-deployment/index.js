'use strict';
var yeoman = require('yeoman-generator');

module.exports = yeoman.Base.extend({
  prompting: function () {
    // console.log('DATA INPUT');
    var prompts = [{
      type: 'confirm',
      name: 's3BucketAvailable',
      message: 'Do you have an existing S3 bucket?',
      default: true
    }];
    return this.prompt(prompts).then(function (props) {
      // console.log('props DataInput', props);
      this.config.set({DataInput: props});
      if (props.s3BucketAvailable) {
        this.composeWith('cedrus-api:complete-add-aws-deployment');
      } else {
        console.log('Please follow the steps below to create a bucketin AWS');
        console.log('1. Sign into the AWS Management Console and open the Amazon S3 console at https://console.aws.amazon.com/s3.');
        console.log('2. Click Create Bucket.');
        console.log('3. In the Create a Bucket dialog box, in the Bucket Name box, enter a bucket name.');
        console.log('4. In the Region box, select a region.');
        console.log('5. Click Create.');
        console.log('Please execute "yo cedrus-api:add-aws-deployment" after completing above steps');
      }
    }.bind(this));
  }
});
