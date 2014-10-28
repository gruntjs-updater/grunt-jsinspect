/*
 * grunt-jsinspect
 *
 *
 * Copyright (c) 2014 Stefan Judis
 * Licensed under the MIT license.
 */

'use strict';

var Inspector = require('jsinspect/lib/inspector');
var Reporter = require('jsinspect/lib/reporters');

module.exports = function(grunt) {

  grunt.registerMultiTask('jsinspect', 'Grunt task for jsinspect', function() {

    var options = this.options({
      threshold:   30,
      diff:        false,
      identifiers: false
    });

    var inspector = new Inspector(this.filesSrc, {
      threshold:   options.threshold,
      diff:        options.diff,
      identifiers: options.identifiers
    });

    var reporterType = new Reporter.default(inspector, options.diff);

    inspector.run();
  });
};