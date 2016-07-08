'use strict';

import test from 'ava';
import ccad from '../';
import envs from './envs';

test.serial('should be created a new project', t => {
  return ccad.create({
    directory: envs.appd(),
    name: 'com.company.myapp'
  }).then(res => {
    t.true(res.created);
  });
});

test.serial('android platform should be added', t => {
  envs.chappd();
  return ccad.addPlatform({platform: 'android'}).then(res => {
    t.true(res.added);
  });
});

test.serial('should added ios platform', t => {
  return ccad.addPlatform({platform: 'ios'}).then(res => {
    t.true(res.added);
  });
});

test.serial('should returns platform list', t => {
  return ccad.getPlatform().then(res => {
    t.true(res.platforms && res.platforms.length >= 0);
    t.true(res.platforms[0].indexOf('android') !== -1);
  });
});

test.serial('android platform should be updated to newer', t => {
  return ccad.updatePlatform({platform: 'android'}).then(res => {
    t.truthy(res.newVersion);
  });
});

test.serial('should returns all of plug-ins', t => {
  return ccad.getPlugins().then(res => {
    t.truthy(res.plugins);
    t.true(res.plugins.length >= 0);
  });
});
