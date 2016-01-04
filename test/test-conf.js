'use strict';

import test from 'ava';
import ccad from '../';

var cwd = process.cwd();

test.before(() => {
  ccad.options({
    verbose: true
  });
});

test.beforeEach(() => {
  process.chdir(cwd);
});

test('should return its version', t => {
  return ccad.version().then(function (res) {
    t.ok(res.params.version, 'Probably, cca has not been installed');
  }).catch(e => {
    t.is(false, e.toString());
  });
});

test('should be prepared', t => {
  return ccad.checkenv().then(function (res) {
    t.ok(res.params.checkenv, 'You need to set up environments for cca');
  }).catch(e => {
    t.is(false, e.toString());
  });
});
