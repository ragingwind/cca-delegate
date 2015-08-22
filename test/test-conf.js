/*global describe, it, before, beforeEach */
'use strict';

var assert = require('assert');
var ccad = require('../');

describe('cca delegate test for configure api', function () {
  var cwd = process.cwd();

  before(function() {
    ccad.options({
      verbose: true
    });
  });

  beforeEach(function() {
    process.chdir(cwd);
  });

  var catcher = function(e) {
    assert(false, e.toString());
  };

  it('should return its version', function () {
    return ccad.version().then(function(res) {
        assert(res.params.version, 'Probably, cca has not been installed');
      }).catch(catcher);
  });

  it('should be prepared', function () {
    return ccad.checkenv().then(function(res) {
        assert(res.params.checkenv, 'You need to set up environments for cca');
      }).catch(catcher);
  });
});
