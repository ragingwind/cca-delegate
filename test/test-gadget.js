/*global describe, it */
'use strict';

var assert = require('assert');
var path = require('path');
var $ = require('../gadget');

describe('gadget', function () {
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
