/*global describe, it, before, beforeEach */
'use strict';

var assert = require('assert');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var path = require('path');
var ccad = require('../');

describe('cca delegate', function () {
  var tmp = path.join(__dirname, 'tmp');
  var cwd = process.cwd();

  before(function() {
    ccad.options({
      verbose: true
    });

    rimraf.sync(tmp);
    mkdirp(tmp);
  });

  beforeEach(function() {
    process.chdir(cwd);
  });

  var catcher = function(e) {
    assert(false, e.toString());
  };

  it('should be created a new project', function () {
    return ccad.create({
      directory: path.join(tmp, 'myApp'),
      name: 'com.company.myapp'
    }).then(function(res) {
      assert(res.params.created);
    }).catch(catcher);
  });

  it('android platform should be added', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.addPlatform('android').then(function(res) {
      assert(res.params.added);
    }).catch(catcher);
  });

  it('should added ios platform', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.addPlatform('ios').then(function(res) {
      assert(res.params.added);
    }).catch(catcher);
  });

  it('should returns platform list', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.getPlatform().then(function(res) {
      assert(res.params.platforms && res.params.platforms.length >= 0);
      assert(res.params.platforms[0].indexOf('android') !== -1);
    }).catch(catcher);
  });

  it('android platform should be updated to newer', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.updatePlatform('android').then(function(res) {
      assert(res.params.newVersion);
    }).catch(catcher);
  });

  it('should returns all of plug-ins', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.getPlugins().then(function(res) {
      assert(res.params.plugins);
      assert(res.params.plugins.length >= 0);
    }).catch(catcher);
  });

  it('should returns chromium plug-ins', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.searchPlugins('chromium').then(function(res) {
      assert(res.params.plugins);
      assert(res.params.plugins.length >= 0);
    }).catch(catcher);
  });

  it('should be built successfully', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.build(['android', 'ios'], {
      maxBuffer: 1000 * 1024,
      timeout:0
    }).then(function(res) {
      assert(res.params.build);
    }).catch(catcher);
  });
});
