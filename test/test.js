/*global describe, it */
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
  })

  var catcher = function(e) {
    assert(false, e.toString());
  };

  it('should return its version', function () {
    return ccad.version().then(function(res) {
        assert(res.params.version);
      }).catch(catcher);
  });

  it('should be prepared', function () {
    return ccad.checkenv().then(function(res) {
        assert(res.params.checkenv);
      }).catch(catcher);
  });

  it('should be failed to create a new project', function () {
    return ccad.create({
      directory: path.join(tmp, 'doApp'),
      name: 'com.do.app',
    }).then(function(res) {
      assert(!res.params.created, res.params.err.toString());
    }).catch(catcher);
  });

  it('should be created a new project', function () {
    return ccad.create({
      directory: path.join(tmp, 'myApp'),
      name: 'com.company.myapp'
    }).then(function(res) {
      assert(res.params.created);
    }).catch(catcher);
  });

  it('should added android', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.addPlatform('android').then(function(res) {
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

  it('should updated the platform to newer', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.updatePlatform('android').then(function(res) {
      assert(res.params.newVersion);
    }).catch(catcher);
  });

  it('should return plug-ins', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.getPlugins().then(function(res) {
      assert(res.params.plugins);
      assert(res.params.plugins.length >= 0);
    }).catch(catcher);
  });

  it('should returns plug-ins', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.searchPlugins('chromium').then(function(res) {
      assert(res.params.plugins);
      assert(res.params.plugins.length >= 0);
    }).catch(catcher);
  });

  it('should be built unsuccessfully', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.build(['android', 'ios'], {
      maxBuffer: 1000 * 1024,
      timeout:0
    }).then(function(res) {
      assert(!res.params.build);
    }).catch(catcher);
  });

  it('should added ios platform', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.addPlatform('ios').then(function(res) {
      assert(res.params.added);
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

  it('should removed the platform', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.removePlatform('ios').then(function(res) {
      assert(res.params.removed);
    }).catch(catcher);
  });

  it('should run it on emulator', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.run({
      platform: 'android',
      emulate: true
    }).then(function(res) {
      assert(res.params.running);
    }).catch(catcher);
  });

  it('should run it on chrome', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.run({
      platform: 'chrome'
    }).then(function(res) {
      assert(res.params.running);
    }).catch(catcher);
  });

  it('should push it to target', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.push({
      target: '192.168.0.30'
    }).then(function(res) {
      assert(res.params.pushed);
    }).catch(catcher);
  });
});
