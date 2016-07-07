'use strict';

import test from 'ava';
import ccad from '../';

test.beforeEach(() => {
  process.chdir(process.cwd());
});

test('should return its version', t => {
  return ccad.version().then(function (res) {
    t.truthy(res.version, 'Probably, cca has not been installed');
  }).catch(err => {
    t.fail(err.stack);
  });
});

test('should be prepared', t => {
  return ccad.checkenv().then(function (res) {
    t.truthy(res.checkenv, 'You need to set up environments for cca');
  }).catch(err => {
    t.fail(err.stack);
  });
});
