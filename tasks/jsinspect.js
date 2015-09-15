/*
 * grunt-jsinspect
 *
 * Copyright (c) Stefan Judis and Juga Paazmaya
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var Inspector = require('jsinspect/lib/inspector');
var Reporter = require('jsinspect/lib/reporters');

module.exports = function(grunt) {

  grunt.registerMultiTask('jsinspect', 'Grunt task for jsinspect', function() {
    var done = this.async();
    var taskSucceeded = true;
    var nbOfMatches = 0;

    var options = this.options({
      threshold:   30,
      diff:        true,
      identifiers: false,
      failOnMatch: true,
      suppress:    100,
      reporter:    'default'
    });

    var inspector = new Inspector(this.filesSrc, {
      threshold:   options.threshold,
      diff:        options.diff,
      identifiers: options.identifiers
    });

    if (!Reporter.hasOwnProperty(options.reporter) ||
        typeof Reporter[options.reporter] !== 'function') {
      grunt.log.error('Sorry but the configured reporter "' + options.reporter +
        '" does not exist, thus exiting');
      done(false);

      return;
    }

    var writableStream;
    if (typeof options.outputPath === 'string') {
      // The user wants the output to be written to a file, so pass a writable stream as an option to the reporter.
      writableStream = fs.createWriteStream(options.outputPath, {encoding: 'utf8', flags: 'w'});
    }

    this.reporterType = new Reporter[options.reporter](inspector, {
      writableStream: writableStream,
      diff: options.diff,
      suppress: options.suppress
    });

    if (typeof options.failOnMatch === 'number') {
      // Handle failOnMatch threshold.
      inspector.on('match', function() {
        nbOfMatches++;
        if (nbOfMatches >= options.failOnMatch) {
          taskSucceeded = false;
        }
      });
    } else if (options.failOnMatch === true) {
      // Handle failOnMatch boolean.
      inspector.on('match', function() {
        taskSucceeded = false;
      });
    }

    if (writableStream) {
      writableStream.on('finish', function() {
        done(taskSucceeded);
      });
    } else {
      inspector.on('end', function() {
        done(taskSucceeded);
      });
    }

    inspector.run();

  });
};
