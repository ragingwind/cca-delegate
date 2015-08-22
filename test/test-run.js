/*global describe, it, before, beforeEach */
'use strict';

var assert = require('assert');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var path = require('path');
var ccad = require('../');
var target = process.env.TARGET;
var platform = process.env.PLATFORM || 'android';

if (!/^android?|^ios?|^chrome?/.test(platform)) {
  console.error('Invalid platform has been passed', platform);
  process.exit(-1);
}

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

  if (platform !== 'chrome') {
    it('android platform should be added', function () {
      process.chdir(path.join(tmp, 'myApp'));

      return ccad.addPlatform(platform).then(function(res) {
        assert(res.params.added);
      }).catch(catcher);
    });

    it('should be built successfully', function () {
      process.chdir(path.join(tmp, 'myApp'));

      return ccad.build([platform], {
        maxBuffer: 1000 * 1024,
        timeout:0
      }).then(function(res) {
        assert(res.params.build);
      }).catch(catcher);
    });
  }


  it('should be running successfully', function () {
    process.chdir(path.join(tmp, 'myApp'));

    var opts = {
      platform: platform,
    };

    if (target) {
      opts.target = target;
    } else if (platform !== 'chrome') {
      opts.emulate = true;
    }

    return ccad.run(opts).then(function(res) {
      assert(res.params.running);
    }).catch(catcher);
  });
});
