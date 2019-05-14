const requireSoSlow = require('require-so-slow');
const path = require('path');

// load stuff, run stuff.
require(path.resolve(process.cwd(), './lib/commands/create.js'));
// require('inquirer');
// require('enquirer');

// Write a trace file at some point.
requireSoSlow.write('require-trace.trace');

