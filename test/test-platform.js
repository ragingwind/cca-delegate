'use strict';

import test from 'ava';
import rimraf from 'rimraf';
import path from 'path';
import mkdirp from 'mkdirp';
import ccad from '../';

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

test.serial('should be created a new project', t => {
  return ccad.create({
    directory: path.join(tmp, 'myApp'),
    name: 'com.company.myapp'
  }).then(res => {
    t.ok(res.params.created);
  });
});

test.serial('android platform should be added', t => {
  process.chdir(path.join(tmp, 'myApp'));

  return ccad.addPlatform('android').then(res => {
    t.ok(res.params.added);
  });
});

test.serial('should added ios platform', t => {
  process.chdir(path.join(tmp, 'myApp'));

  return ccad.addPlatform('ios').then(res => {
    t.ok(res.params.added);
  });
});

test.serial('should returns platform list', t => {
  process.chdir(path.join(tmp, 'myApp'));

  return ccad.getPlatform().then(res => {
    t.ok(res.params.platforms && res.params.platforms.length >= 0);
    t.ok(res.params.platforms[0].indexOf('android') !== -1);
  });
});

test.serial('android platform should be updated to newer', t => {
  process.chdir(path.join(tmp, 'myApp'));

  return ccad.updatePlatform('android').then(res => {
    t.ok(res.params.newVersion);
  });
});

test.serial('should returns all of plug-ins', t => {
  process.chdir(path.join(tmp, 'myApp'));

  return ccad.getPlugins().then(res => {
    t.ok(res.params.plugins);
    t.ok(res.params.plugins.length >= 0);
  });
});

test.serial('should returns chromium plug-ins', t => {
  process.chdir(path.join(tmp, 'myApp'));

  return ccad.searchPlugins('chromium').then(res => {
    t.ok(res.params.plugins);
    t.ok(res.params.plugins.length >= 0);
  });
});

test.serial('should be built successfully', t => {
  process.chdir(path.join(tmp, 'myApp'));

  return ccad.build(['android', 'ios'], {
    maxBuffer: 1000 * 1024,
    timeout: 0
  }).then(res => {
    t.ok(res.params.build);
  });
});
