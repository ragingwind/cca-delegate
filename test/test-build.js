'use strict';

import path from 'path';
import test from 'ava';
import mkdirp from 'mkdirp';
import ccad from '../';

const tmp = path.join(__dirname, 'tmp');

test.before(() => {
  ccad.options({
    verbose: false
  });

  mkdirp(tmp);
});

test.serial('should be built successfully', t => {
  process.chdir(path.join(tmp, 'myApp'));

  return ccad.build(['android'], {
    maxBuffer: 1000 * 1024,
    timeout: 0
  }).then(res => {
    t.true(res.params.build);
  }).catch(err => {
    t.is(false, err.toString());
  });
});
