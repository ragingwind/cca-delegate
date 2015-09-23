/*global describe, it, before, beforeEach */
'use strict';

var assert = require('assert');
var rimraf = require('rimraf');
var path = require('path');
var ccad = require('../');
var globby = require('globby');

describe('cca package', function () {
  var tmp = path.join(__dirname, 'tmp');

  beforeEach(function() {
    ccad.options({
      verbose: true
    });

    rimraf.sync(path.join(tmp, 'package'));
  });

  it('should make a zip and copy apks', function (done) {
    ccad.packageup(path.join(tmp, 'package'), {
      cwd: path.join(tmp, './myApp'),
    }).then(function (err) {
      assert(!err);

      var files = globby.sync(['**/*.zip', '**/*.apk'], {
        cwd: path.join(tmp, 'package')
      });

      assert.notEqual(files.indexOf('chrome/chromeapp.zip'), -1);
      assert.notEqual(files.indexOf('android/android-armv7-debug-unaligned.apk'), -1);
      assert.notEqual(files.indexOf('android/android-armv7-debug.apk'), -1);
      assert.notEqual(files.indexOf('android/android-x86-debug-unaligned.apk'), -1);
      assert.notEqual(files.indexOf('android/android-x86-debug.apk'), -1);

      done();
    }).catch(function (err) {
      console.err(err);

      assert(false);
      done();
    });
  });

  it('should make a zip with version', function (done) {
    ccad.packageup(path.join(tmp, 'package'), {
      version: '1.0.0',
      cwd: path.join(tmp, './myApp'),
    }).then(function (err) {
      assert(!err);

      var files = globby.sync(['**/*.zip', '**/*.apk'], {
        cwd: path.join(tmp, 'package')
      });

      assert.notEqual(files.indexOf('chrome/chromeapp-1.0.0.zip'), -1);

      done();
    }).catch(function (err) {
      console.err(err);

      assert(false);
      done();
    });
  });
});
