// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.debug.FormatterTest');
goog.setTestOnly('goog.debug.FormatterTest');

goog.require('goog.debug.HtmlFormatter');
goog.require('goog.debug.LogRecord');
goog.require('goog.debug.Logger');
goog.require('goog.html.SafeHtml');
goog.require('goog.testing.jsunit');


var EXPECTED_RECORD_HTML_RE =
    '^prefix \\[.*?\\] \\[ &#160;.*?s\\] \\[loggerName\\] ' +
        '<span class="dbg-f">mess<br> &#160;age<br>Message:';
var logRecord;


function setUp() {
  logRecord = new goog.debug.LogRecord(
      goog.debug.Logger.Level.CONFIG, 'mess\n  age', 'loggerName', 1, 100);
  // Exception needs to be present for exception text to get printed
  // by HtmlFormatter.
  logRecord.setException(new Error('exc\n  eption'));
}


function testHtmlFormatter_formatRecord() {
  var formatter = new goog.debug.HtmlFormatter('prefix');
  var actual = formatter.formatRecord(logRecord);
  assertRegExp(EXPECTED_RECORD_HTML_RE, actual);
}


function testHtmlFormatter_formatRecordAsHtml() {
  var formatter = new goog.debug.HtmlFormatter('prefix');
  var actual = formatter.formatRecordAsHtml(logRecord);
  assertRegExp(EXPECTED_RECORD_HTML_RE, goog.html.SafeHtml.unwrap(actual));
}
