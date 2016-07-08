'use strict';

import test from 'ava';
import globby from 'globby';
import ccad from '../';
import envs from './envs';

test.serial('should make a zip and copy apks', t => {
  return ccad.packageup(envs.packd(), {
    cwd: envs.appd()
  }).then(() => {
    const files = globby.sync(['**/*.zip', '**/*.apk'], {
      cwd: envs.packd()
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
  return ccad.packageup(envs.packd(), {
    version: '1.0.0',
    cwd: envs.appd()
  }).then(() => {
    var files = globby.sync(['**/*.zip', '**/*.apk'], {
      cwd: envs.packd()
    });

    t.not(files.indexOf('chrome/chromeapp-1.0.0.zip'), -1);
  }).catch(err => {
    t.fail(err.toString());
  });
});
