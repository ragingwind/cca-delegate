/*global describe, it */
'use strict';

var assert = require('assert');
var ccad = require('../');

require("mocha-as-promised")();

describe('ccad', function () {
  it('cca should return its version', function (done) {
    return ccad.cca().then(function(res) {
      assert(true);
    }).catch(function(res) {
      assert(false, 'cca ' + res.err.toString());
    });
  });
  // it('checkenv should has no error', function (done) {
  //   return ccad.checkenv().then(function(res) {
  //     assert(true);
  //   }).catch(function(res) {
  //     assert(false, 'checkenv ' + res.err.toString());
  //   });
  // });
});
