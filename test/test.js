/*global describe, it */
'use strict';

var assert = require('assert');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var path = require('path');
var ccad = require('../');

require("mocha-as-promised")();

describe('ccad', function () {
  var tmp = path.join(__dirname, 'tmp');
  var cwd = process.cwd();

  before(function() {
    rimraf.sync(tmp);
    mkdirp(tmp);
  });

  beforeEach(function() {
    process.chdir(cwd);
  })

  it('should return its version', function () {
    return ccad.version().then(function(res) {
      console.log('cca version is', res.version);
      assert(true);
    }).catch(function(res) {
      assert(false, res.err && res.err.toString());
    });
  });

  it('should be prepared', function () {
    return ccad.checkenv().then(function(res) {
      assert(true);
    }).catch(function(res) {
      assert(false, res.err && res.err.toString());
    });
  });

  it('should be created a new project', function () {
    return ccad.create({
      directory: path.join(tmp, 'myApp'),
      name: 'com.company.myapp'
    }).then(function(res) {
      assert(true);
    }).catch(function(res) {
      assert(false, res.err && res.err.toString());
    });
  });

  it('should be failed to create a new project', function () {
    return ccad.create({
      directory: path.join(tmp, 'myApp'),
      name: 'com.company.myapp',
    }).then(function(res) {
      assert(false, res.err && res.err.toString());
    }).catch(function(res) {
      assert(true);
    });
  });

  it('should be failed to create another project', function () {
    return ccad.create({
      directory: path.join(tmp, 'myApp1'),
      name: 'com.do.1app'
    }).then(function(res) {
      assert(false, res.err.toString());
    }).catch(function(res) {
      assert(true);
    });
  });

  it('should be added a new platform', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.addPlatform('android').then(function(res) {
      assert(true);
    }).catch(function(res) {
      assert(false, res.err && res.err.toString());
    });
  });

  it('should returns platform list', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.getPlatform().then(function(res) {
      assert(res.platforms && res.platforms.length >= 0);
      assert(res.platforms[0].indexOf('android') !== -1);
    }).catch(function(res) {
      console.log(res);
      assert(false, res.err && res.err.toString());
    });
  });

  it('should update the platform to newer', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.updatePlatform('android').then(function(res) {
      assert(res.newVersion);
    }).catch(function(res) {
      console.log(res);
      assert(false, res.err && res.err.toString());
    });
  });

  it('should return plug-ins', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.getPlugins().then(function(res) {
      assert(res.plugins);
      assert(res.plugins.length >= 0);
    }).catch(function(res) {
      console.log(res);
      assert(false, res.err && res.err.toString());
    });
  });

  it('should remove the platform', function () {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.removePlatform('android').then(function(res) {
      assert(true);
    }).catch(function(res) {
      assert(false, res.err && res.err.toString());
    });
  });
});
