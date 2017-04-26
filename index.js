#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const meow = require('meow');
const inlineCss = require('inline-css');
const pify = require('pify');
const globParent = require('glob-parent');
const chalk = require('chalk');
const mkdirp = require('mkdirp-promise');
const glob = pify(require('glob'));
const cwd = require('prepend-cwd');
const htmlMinifier = require('html-minifier').minify;

const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);

const cli = meow(`
  Usage
    $ inliney <input> <output>

  Examples
    $ inliney pages/*.html output
`);

if (cli.input.length < 2) {
  cli.showHelp(1);
}

const input = cwd(cli.input[0]);
const output = cwd(cli.input[1]);
const baseFolder = globParent(input);

// Generate the output path for a file
const outputPath = p => {
  const o = path.join(output, path.relative(baseFolder, p));
  console.log(o);
  return o;
};

// Read a file, inline its CSS, then write it to disk
const compile = file => readFile(file)
  .then(contents => contents.toString())
  .then(contents => inlineCss(contents, {url: `file://${file}`}))
  .then(html => htmlMinifier(html, {
    collapseWhitespace: true,
    minifyCSS: true
  }))
  .then(html => writeFile(outputPath(file), html))
  .then(() => true);

// Compile all input files found
mkdirp(output)
  .then(() => glob(input))
  .then(files => Promise.all(files.map(compile)))
  .then(count => console.log(chalk.green(`${count.length} files inlined.`)));
