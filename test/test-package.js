'use strict';

import path from 'path';
import test from 'ava';
import globby from 'globby';
import ccad from '../';

const tmp = path.join(__dirname, 'tmp');

test.beforeEach.serial(() => {
  ccad.options({
    verbose: true
  });
});

test.serial('should make a zip and copy apks', t => {
  return ccad.packageup(path.join(tmp, 'package'), {
    cwd: path.join(tmp, './myApp')
  }).then(() => {
    var files = globby.sync(['**/*.zip', '**/*.apk'], {
      cwd: path.join(tmp, 'package')
    });
    t.not(files.indexOf('chrome/chromeapp.zip'), -1);
    t.not(files.indexOf('android/android-armv7-debug-unaligned.apk'), -1);
    t.not(files.indexOf('android/android-armv7-debug.apk'), -1);
    t.not(files.indexOf('android/android-x86-debug-unaligned.apk'), -1);
    t.not(files.indexOf('android/android-x86-debug.apk'), -1);
  }).catch(err => {
    t.fail(err);
  });
});

test.serial('should make a zip with version', t => {
  return ccad.packageup(path.join(tmp, 'package'), {
    version: '1.0.0',
    cwd: path.join(tmp, './myApp')
  }).then(() => {
    var files = globby.sync(['**/*.zip', '**/*.apk'], {
      cwd: path.join(tmp, 'package')
    });

    t.not(files.indexOf('chrome/chromeapp-1.0.0.zip'), -1);
  }).catch(err => {
    t.fail(err.toString());
  });
});
