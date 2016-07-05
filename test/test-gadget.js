'use strict';

import test from 'ava';
import $ from '../gadget';

test('should be passed test', t => {
  // package name
  t.true($.isPackageName('com.company.myapp'), 'valid package name');
  t.is(false, $.isPackageName('company.myapp'), 'not valid package name');

  // platform checking
  t.true($.isSupportedPlatform('android'), 'is valid platform');
  t.true($.isSupportedPlatform('ios'), 'is valid platform');
  t.true($.isSupportedPlatform('chrome'), 'is valid platform');
  t.is(false, $.isSupportedPlatform('bada'), 'is not valid platform');
  t.true($.isSupportedPlatform(['android', 'ios']), 'is valid platform');
  t.is(false, $.isSupportedPlatform(['androd', 'ios', 'bada']), 'is not valid platform');
});
