'use strict';

import test from 'ava';
import ccad from '../';
import envs from './envs';

test.serial('should be built successfully', t => {
  envs.chappd();

  return ccad.build(['android']).then(res => {
    t.true(res.build);
  }).catch(err => {
    t.fail(err.toString());
  });
});
