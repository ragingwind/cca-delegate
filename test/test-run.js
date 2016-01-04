'use strict';

import test from 'ava';
import path from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import ccad from '../';

const target = process.env.TARGET;
const platform = process.env.PLATFORM || 'android';

if (!/^android?|^ios?|^chrome?/.test(platform)) {
  console.error('Invalid platform has been passed', platform);
  process.exit(-1);
}

const tmp = path.join(__dirname, 'tmp');
const cwd = process.cwd();

test.before(() => {
  ccad.options({
    verbose: true
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
    t.ok(res.params.created);
  }).catch(e => {
    t.is(false, e.toString());
  });
});

if (platform !== 'chrome') {
  test('android platform should be added', t => {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.addPlatform(platform).then(res => {
      t.ok(res.params.added);
    }).catch(e => {
      t.is(false, e.toString());
    });
  });

  test('should be built successfully', t => {
    process.chdir(path.join(tmp, 'myApp'));

    return ccad.build([platform], {
      maxBuffer: 1000 * 1024,
      timeout: 0
    }).then(res => {
      t.ok(res.params.build);
    }).catch(e => {
      t.is(false, e.toString());
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
    t.ok(res.params.running);
  }).catch(e => {
    t.is(false, e.toString());
  });
});
