// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.string.pathTest');
goog.setTestOnly('goog.string.pathTest');

goog.require('goog.string.path');
goog.require('goog.testing.jsunit');

// Some test data comes from Python's posixpath tests.
// See http://svn.python.org/view/python/trunk/Lib/test/test_posixpath.py

function testBasename() {
  assertEquals('bar', goog.string.path.baseName('/foo/bar'));
  assertEquals('', goog.string.path.baseName('/'));
  assertEquals('foo', goog.string.path.baseName('foo'));
  assertEquals('foo', goog.string.path.baseName('////foo'));
  assertEquals('bar', goog.string.path.baseName('//foo//bar'));
}

function testDirname() {
  assertEquals('/foo', goog.string.path.dirname('/foo/bar'));
  assertEquals('/', goog.string.path.dirname('/'));
  assertEquals('', goog.string.path.dirname('foo'));
  assertEquals('////', goog.string.path.dirname('////foo'));
  assertEquals('//foo', goog.string.path.dirname('//foo//bar'));
}

function testJoin() {
  assertEquals('/bar/baz',
      goog.string.path.join('/foo', 'bar', '/bar', 'baz'));
  assertEquals('/foo/bar/baz',
      goog.string.path.join('/foo', 'bar', 'baz'));
  assertEquals('/foo/bar/baz',
      goog.string.path.join('/foo/', 'bar', 'baz'));
  assertEquals('/foo/bar/baz/',
      goog.string.path.join('/foo/', 'bar/', 'baz/'));
}

function testNormalizePath() {
  assertEquals('.', goog.string.path.normalizePath(''));
  assertEquals('.', goog.string.path.normalizePath('./'));
  assertEquals('/', goog.string.path.normalizePath('/'));
  assertEquals('//', goog.string.path.normalizePath('//'));
  assertEquals('/', goog.string.path.normalizePath('///'));
  assertEquals('/foo/bar',
               goog.string.path.normalizePath('///foo/.//bar//'));
  assertEquals('/foo/baz',
               goog.string.path.normalizePath('///foo/.//bar//.//..//.//baz'));
  assertEquals('/foo/bar',
               goog.string.path.normalizePath('///..//./foo/.//bar'));
  assertEquals('../../cat/dog',
               goog.string.path.normalizePath('../../cat/dog/'));
  assertEquals('../dog',
               goog.string.path.normalizePath('../cat/../dog/'));
  assertEquals('/cat/dog',
               goog.string.path.normalizePath('/../cat/dog/'));
  assertEquals('/dog',
               goog.string.path.normalizePath('/../cat/../dog'));
  assertEquals('/dog',
               goog.string.path.normalizePath('/../../../dog'));
}

function testSplit() {
  assertArrayEquals(['/foo', 'bar'], goog.string.path.split('/foo/bar'));
  assertArrayEquals(['/', ''], goog.string.path.split('/'));
  assertArrayEquals(['', 'foo'], goog.string.path.split('foo'));
  assertArrayEquals(['////', 'foo'], goog.string.path.split('////foo'));
  assertArrayEquals(['//foo', 'bar'], goog.string.path.split('//foo//bar'));
}

function testExtension() {
  assertEquals('jpg', goog.string.path.extension('././foo/bar/baz.jpg'));
  assertEquals('jpg', goog.string.path.extension('././foo bar/baz.jpg'));
  assertEquals('jpg', goog.string.path.extension(
      'foo/bar/baz/blah blah.jpg'));
  assertEquals('', goog.string.path.extension('../../foo/bar/baz baz'));
  assertEquals('', goog.string.path.extension('../../foo bar/baz baz'));
  assertEquals('', goog.string.path.extension('foo/bar/.'));
  assertEquals('', goog.string.path.extension('  '));
  assertEquals('', goog.string.path.extension(''));
  assertEquals('', goog.string.path.extension('/home/username/.bashrc'));

  // Tests cases taken from python os.path.splitext().
  assertEquals('bar', goog.string.path.extension('foo.bar'));
  assertEquals('bar', goog.string.path.extension('foo.boo.bar'));
  assertEquals('bar', goog.string.path.extension('foo.boo.biff.bar'));
  assertEquals('rc', goog.string.path.extension('.csh.rc'));
  assertEquals('', goog.string.path.extension('nodots'));
  assertEquals('', goog.string.path.extension('.cshrc'));
  assertEquals('', goog.string.path.extension('...manydots'));
  assertEquals('ext', goog.string.path.extension('...manydots.ext'));
  assertEquals('', goog.string.path.extension('.'));
  assertEquals('', goog.string.path.extension('..'));
  assertEquals('', goog.string.path.extension('........'));
  assertEquals('', goog.string.path.extension(''));
}
