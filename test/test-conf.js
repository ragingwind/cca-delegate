'use strict';

import test from 'ava';
import ccad from '../';

var cwd = process.cwd();

test.before(() => {
  ccad.options({
    verbose: false
  });
});

test.beforeEach(() => {
  process.chdir(cwd);
});

test('should return its version', t => {
  return ccad.version().then(function (res) {
    t.truthy(res.params.version, 'Probably, cca has not been installed');
  }).catch(err => {
    t.is(false, err.toString());
  });
});

test('should be prepared', t => {
  return ccad.checkenv().then(function (res) {
    t.truthy(res.params.checkenv, 'You need to set up environments for cca');
  }).catch(err => {
    t.is(false, err.toString());
  });
});
