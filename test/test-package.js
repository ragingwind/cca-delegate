'use strict';

import test from 'ava';
import rimraf from 'rimraf';
import path from 'path';
import globby from 'globby';
import ccad from '../';

const tmp = path.join(__dirname, 'tmp');

test.beforeEach(() => {
  ccad.options({
    verbose: true
  });

  rimraf.sync(path.join(tmp, 'package'));
});

test.cb('should make a zip and copy apks', t => {
  ccad.packageup(path.join(tmp, 'package'), {
    cwd: path.join(tmp, './myApp')
  }).then(function (err) {
    t.notOk(err);

    var files = globby.sync(['**/*.zip', '**/*.apk'], {
      cwd: path.join(tmp, 'package')
    });

    t.notSame(files.indexOf('chrome/chromeapp.zip'), -1);
    t.notSame(files.indexOf('android/android-armv7-debug-unaligned.apk'), -1);
    t.notSame(files.indexOf('android/android-armv7-debug.apk'), -1);
    t.notSame(files.indexOf('android/android-x86-debug-unaligned.apk'), -1);
    t.notSame(files.indexOf('android/android-x86-debug.apk'), -1);
    t.end();
  }).catch(e => {
    t.fail(e.toString());
    t.end();
  });
});

test.cb('should make a zip with version', t => {
  ccad.packageup(path.join(tmp, 'package'), {
    version: '1.0.0',
    cwd: path.join(tmp, './myApp')
  }).then(function (err) {
    t.notOk(err);

    var files = globby.sync(['**/*.zip', '**/*.apk'], {
      cwd: path.join(tmp, 'package')
    });

    t.notSame(files.indexOf('chrome/chromeapp-1.0.0.zip'), -1);
    t.end();
  }).catch(e => {
    t.fail(e.toString());
    t.end();
  });
});
