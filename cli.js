#!/usr/bin/env node
'use strict';
var meow = require('meow');
var ccad = require('./');

var cli = meow({
  help: [
    'Usage',
    '  ccad <input>',
    '',
    'Example',
    '  ccad Unicorn'
  ].join('\n')
});

ccad(cli.input[0]);
