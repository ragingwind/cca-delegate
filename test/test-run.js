'use strict';

import path from 'path';
import test from 'ava';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import ccad from '../';

const target = process.env.TARGET;
const platform = process.env.PLATFORM || 'android';

if (!/^android?|^ios?|^chrome?/.test(platform)) {
  throw new Error('Invalid platform has been passed ' + platform);
}

const tmp = path.join(__dirname, 'tmp');
const cwd = process.cwd();

test.before(() => {
  ccad.options({
    verbose: false
  });

  rimraf.sync(tmp);
  mkdirp(tmp);
});

test.beforeEach(() => {
  process.chdir(cwd);
});

test('should be created a new project', t => {
  return ccad.create({
    directory: path.join(tmp, 'myApp'),
    name: 'com.company.myapp'
  }).then(res => {
    t.true(res.params.created);
  }).catch(err => {
    t.is(false, err.toString());
  });
});

if (platform !== 'chrome') {
  test('android platform should be added', t => {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.addPlatform(platform).then(res => {
      t.true(res.params.added);
    }).catch(err => {
      t.is(false, err.toString());
    });
  });

  test('should be built successfully', t => {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.build([platform], {
      maxBuffer: 1000 * 1024,
      timeout: 0
    }).then(res => {
      t.true(res.params.build);
    }).catch(err => {
      t.is(false, err.toString());
    });
  });
}

test('should be running successfully', t => {
  process.chdir(path.join(tmp, 'myApp'));

  var opts = {
    platform: platform
  };

  if (target) {
    opts.target = target;
  } else if (platform !== 'chrome') {
    opts.emulate = true;
  }

  return ccad.run(opts).then(res => {
    t.true(res.params.running);
  }).catch(err => {
    t.is(false, err.toString());
  });
});
