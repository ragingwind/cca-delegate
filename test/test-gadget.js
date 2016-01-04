'use strict';

import test from 'ava';
import $ from '../gadget';

test('should be passed test', t => {
  // package name
  t.ok($.isPackageName('com.company.myapp'), 'valid package name');
  t.is(false, $.isPackageName('company.myapp'), 'not valid package name');

  // platform checking
  t.ok($.isSupportedPlatform('android'), 'is valid platform');
  t.ok($.isSupportedPlatform('ios'), 'is valid platform');
  t.ok($.isSupportedPlatform('chrome'), 'is valid platform');
  t.is(false, $.isSupportedPlatform('bada'), 'is not valid platform');
  t.ok($.isSupportedPlatform(['android', 'ios']), 'is valid platform');
  t.is(false, $.isSupportedPlatform(['androd', 'ios', 'bada']), 'is not valid platform');
});
