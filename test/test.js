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

  it('cca should return its version', function (done) {
    return ccad.version().then(function(res) {
      console.log('cca version is', res.version);
      assert(true);
    }).catch(function(res) {
      assert(false, res.err.toString());
    });
  });

  it('Environments should be prepared', function (done) {
    return ccad.checkenv().then(function(res) {
      assert(true);
    }).catch(function(res) {
      assert(false, res.err.toString());
    });
  });

  it('New project should be created', function (done) {
    return ccad.create({
      directory: path.join(tmp, 'myApp'),
      name: 'com.company.myapp'
    }).then(function(res) {
      assert(true);
    }).catch(function(res) {
      assert(false, res.err.toString());
    });
  });

  it('New project should be failed', function (done) {
    return ccad.create({
      directory: path.join(tmp, 'myApp'),
      name: 'com.company.myapp',
    }).then(function(res) {
      assert(false, res.err.toString());
    }).catch(function(res) {
      assert(true);
    });
  });

  it('New project should be failed', function (done) {
    return ccad.create({
      directory: path.join(tmp, 'myApp1'),
      name: 'com.do.1app'
    }).then(function(res) {
      assert(false, res.err.toString());
    }).catch(function(res) {
      assert(true);
    });
  });

  it('Platform should be added', function (done) {
    var target = path.join(tmp, 'myApp2');
    return ccad.create({
      directory: target,
      name: 'com.company.myap2',
    }).then(function() {
      process.chdir(target);
      return ccad.addPlatform('android');
    }).then(function(res) {
      assert(true);
    }).catch(function(res) {
      assert(false, res.err.toString());
    });
  });
});
