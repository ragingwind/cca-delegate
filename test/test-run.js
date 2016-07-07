'use strict';

import test from 'ava';
import ccad from '../';
import envs from './envs';

const target = process.env.TARGET;
const platform = process.env.PLATFORM || 'android';

if (!/^android?|^ios?|^chrome?/.test(platform)) {
  throw new Error('Invalid platform has been passed ' + platform);
}

test('should be running successfully', t => {
  envs.chappd();

  var opts = {
    platform: platform
  };

  if (target) {
    opts.target = target;
  } else if (platform !== 'chrome') {
    opts.emulate = true;
  }

  return ccad.run(opts).then(res => {
    t.true(res.running);
  }).catch(err => {
    t.fail(err.stack);
  });
});
