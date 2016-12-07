'use strict';
var yeoman = require('yeoman-generator');

module.exports = yeoman.Base.extend({
  prompting: function () {
  console.log('prompting - zap');
  this.config.set({"package": {
    bondPackageNumber: '',
    bondPackageName: '',
    bondPackageDescription: '',
    bondPackageEffectiveDate: '',
    bondPackageTerminationDate: '',
    documentId: '',
    bondPackageType: '',
    bondPackageStatus: '',
    bondPackageUsage: ''}
})

this.config.save();

  }

});
