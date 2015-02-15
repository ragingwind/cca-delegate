/*global describe, it */
'use strict';

var assert = require('assert');
var path = require('path');
var $ = require('../gadget');
var exec = require('../promised-exec');

describe('gadget', function () {
  it('should return current path ', function() {
    return exec('pwd', function(res, ack) {
      assert($.includes(res.stdout, path.resolve(__dirname, '../')));
      ack(null);
    });
  });

  it('should return current files ', function() {
    return exec(['ls', '-al'], function(res, ack) {
      assert($.includes(res.stdout, 'test'));
      assert(!$.includes(res.stdout, 'bower_component'));
      ack(null);
    });
  });

  it('should return current path ', function() {
    return exec('mymimy', function(res, ack) {
      assert($.includes(res.stderr, 'command not found'));
      assert(!$.includes(res.stderr, 'mimymi'));
      ack(null);
    });
  });

  it('should be passed test', function (done) {
    // package name
    assert.ok($.isPackageName('com.company.myapp'), 'valid package name');
    assert.equal(false, $.isPackageName('company.myapp'), 'not valid package name');

    // platform checking
    assert.ok($.isSupportedPlatform('android'), 'is valid platform');
    assert.ok($.isSupportedPlatform('ios'), 'is valid platform');
    assert.ok($.isSupportedPlatform('chrome'), 'is valid platform');
    assert.equal(false, $.isSupportedPlatform('bada'), 'is not valid platform');
    assert.ok($.isSupportedPlatform(['android', 'ios']), 'is valid platform');
    assert.equal(false, $.isSupportedPlatform(['androd', 'ios', 'bada']), 'is not valid platform');

    done();
  });
});
