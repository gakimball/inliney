/* eslint-env mocha */

'use strict';

const fs = require('fs');
const path = require('path');
const execFile = require('child_process').execFile;
const expect = require('chai').expect;
const tempy = require('tempy');

describe('inline-css', () => {
  const execPath = path.join(__dirname, 'index.js');

  it('inlines CSS into HTML', done => {
    const testDir = tempy.directory();

    execFile(execPath, ['fixtures/*.html', testDir], err => {
      if (err) {
        done(err);
      } else {
        const contents = fs.readFileSync(path.join(testDir, 'index.html')).toString();
        expect(contents).to.contain('<div id="hi" style="color:red">');
        done();
      }
    });
  });

  it('compresses HTML', done => {
    const testDir = tempy.directory();

    execFile(execPath, ['fixtures/*.html', testDir], err => {
      if (err) {
        done(err);
      } else {
        const contents = fs.readFileSync(path.join(testDir, 'index.html')).toString();
        expect(contents).to.contain('<!doctype html><html><head>');
        done();
      }
    });
  });

  it('counts the number of files processed', done => {
    const testDir = tempy.directory();

    execFile(execPath, ['fixtures/*.html', testDir], (err, stdout) => {
      if (err) {
        done(err);
      } else {
        expect(stdout).to.contain('1 files');
        done();
      }
    });
  });

  it('exits with code 1 if not all options are provided', done => {
    execFile(execPath).on('close', code => {
      expect(code).to.equal(1);
      done();
    });
  });
});
