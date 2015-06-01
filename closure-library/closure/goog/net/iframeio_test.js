// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.net.IframeIoTest');
goog.setTestOnly('goog.net.IframeIoTest');

goog.require('goog.debug');
goog.require('goog.debug.DivConsole');
goog.require('goog.debug.LogManager');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.log');
goog.require('goog.log.Level');
goog.require('goog.net.IframeIo');
goog.require('goog.testing.events');
goog.require('goog.testing.events.Event');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

// MANUAL TESTS - The tests should be run in the browser from the Closure Test
// Server

// Set up a logger to track responses
goog.debug.LogManager.getRoot().setLevel(goog.log.Level.INFO);
var logconsole;
var testLogger = goog.log.getLogger('test');

function setUpPage() {
  var logconsole = new goog.debug.DivConsole(document.getElementById('log'));
  logconsole.setCapturing(true);
}


/** Creates an iframeIo instance and sets up the test environment */
function getTestIframeIo() {
  logconsole.addSeparator();
  logconsole.getFormatter().resetRelativeTimeStart();

  var io = new goog.net.IframeIo();
  io.setErrorChecker(checkForError);

  goog.events.listen(io, 'success', onSuccess);
  goog.events.listen(io, 'error', onError);
  goog.events.listen(io, 'ready', onReady);

  return io;
}


/**
 * Checks for error strings returned by the GSE and error variables that
 * the Gmail server and GFE set on certain errors.
 */
function checkForError(doc) {
  var win = goog.dom.getWindow(doc);
  var text = doc.body.textContent || doc.body.innerText || '';
  var gseError = text.match(/([^\n]+)\nError ([0-9]{3})/);
  if (gseError) {
    return '(Error ' + gseError[2] + ') ' + gseError[1];
  } else if (win.gmail_error) {
    return win.gmail_error + 700;
  } else if (win.rc) {
    return 600 + win.rc % 100;
  } else {
    return null;
  }
}


/** Logs the status of an iframeIo object */
function logStatus(i) {
  goog.log.fine(testLogger, 'Is complete/success/active: ' +
      [i.isComplete(), i.isSuccess(), i.isActive()].join('/'));
}

function onSuccess(e) {
  goog.log.warning(testLogger, 'Request Succeeded');
  logStatus(e.target);
}

function onError(e) {
  goog.log.warning(testLogger, 'Request Errored: ' + e.target.getLastError());
  logStatus(e.target);
}

function onReady(e) {
  goog.log.info(testLogger,
      'Test finished and iframe ready, disposing test object');
  e.target.dispose();
}



function simpleGet() {
  var io = getTestIframeIo();
  goog.events.listen(io, 'complete', onSimpleTestComplete);
  io.send('/iframeio/ping', 'GET');
}


function simplePost() {
  var io = getTestIframeIo();
  goog.events.listen(io, 'complete', onSimpleTestComplete);
  io.send('/iframeio/ping', 'POST');
}

function onSimpleTestComplete(e) {
  goog.log.info(testLogger, 'ResponseText: ' + e.target.getResponseText());
}

function abort() {
  var io = getTestIframeIo();
  goog.events.listen(io, 'complete', onAbortComplete);
  goog.events.listen(io, 'abort', onAbort);
  io.send('/iframeio/ping', 'GET');
  io.abort();
}

function onAbortComplete(e) {
  goog.log.info(testLogger, 'Hmm, request should have been aborted');
}

function onAbort(e) {
  goog.log.info(testLogger, 'Request aborted');
}


function errorGse404() {
  var io = getTestIframeIo();
  io.send('/iframeio/404', 'GET');
}

function jsonEcho(method) {
  var io = getTestIframeIo();
  goog.events.listen(io, 'complete', onJsonComplete);
  var data = {'p1': 'x', 'p2': 'y', 'p3': 'z', 'r': 10};
  io.send('/iframeio/jsonecho?q1=a&q2=b&q3=c&r=5', method, false, data);
}

function onJsonComplete(e) {
  goog.log.info(testLogger, 'ResponseText: ' + e.target.getResponseText());
  var json = e.target.getResponseJson();
  goog.log.info(testLogger,
      'ResponseJson:\n' + goog.debug.deepExpose(json, true));
}



function sendFromForm() {
  var io = getTestIframeIo();
  goog.events.listen(io, 'success', onUploadSuccess);
  goog.events.listen(io, 'error', onUploadError);
  io.sendFromForm(document.getElementById('uploadform'));
}

function onUploadSuccess(e) {
  goog.log.log(testLogger, goog.log.Level.SHOUT, 'Upload Succeeded');
  goog.log.info(testLogger, 'ResponseText: ' + e.target.getResponseText());
}

function onUploadError(e) {
  goog.log.log(testLogger, goog.log.Level.SHOUT, 'Upload Errored');
  goog.log.info(testLogger, 'ResponseText: ' + e.target.getResponseText());
}


function redirect1() {
  var io = getTestIframeIo();
  io.send('/iframeio/redirect', 'GET');
}

function redirect2() {
  var io = getTestIframeIo();
  io.send('/iframeio/move', 'GET');
}

function badUrl() {
  var io = getTestIframeIo();
  io.send('http://news.bbc.co.uk', 'GET');
}

function localUrl1() {
  var io = getTestIframeIo();
  goog.events.listen(io, 'complete', onLocalSuccess);
  io.send('c:\test.txt', 'GET');
}

function localUrl2() {
  var io = getTestIframeIo();
  goog.events.listen(io, 'success', onLocalSuccess);
  io.send('//test.txt', 'GET');
}

function onLocalSuccess(e) {
  goog.log.info(testLogger,
      'The file was found:\n' + e.target.getResponseText());
}

function getServerTime(noCache) {
  var io = getTestIframeIo();
  goog.events.listen(io, 'success', onTestCacheSuccess);
  io.send('/iframeio/datetime', 'GET', noCache);
}

function onTestCacheSuccess(e) {
  goog.log.info(testLogger, 'Date reported: ' + e.target.getResponseText());
}


function errorGmail() {
  var io = getTestIframeIo();
  goog.events.listen(io, 'error', onGmailError);
  io.send('/iframeio/gmailerror', 'GET');
}

function onGmailError(e) {
  goog.log.info(testLogger, 'Gmail error: ' + e.target.getLastError());
}


function errorGfe() {
  var io = getTestIframeIo();
  goog.events.listen(io, 'error', onGfeError);
  io.send('/iframeio/gfeerror', 'GET');
}

function onGfeError(e) {
  goog.log.info(testLogger, 'GFE error: ' + e.target.getLastError());
}



function incremental() {
  var io = getTestIframeIo();
  io.send('/iframeio/incremental', 'GET');
}

window['P'] = function(iframe, data) {
  var iframeIo = goog.net.IframeIo.getInstanceByName(iframe.name);
  goog.log.info(testLogger, 'Data recieved - ' + data);
};


function postForm() {
  var io = getTestIframeIo();
  goog.events.listen(io, 'complete', onJsonComplete);
  io.sendFromForm(document.getElementById('testfrm'));
}
// UNIT TESTS - to be run via the JsUnit testRunner

// TODO(user): How to unit test all of this?  Creating a MockIframe could
// help for the IE code path, but since the other browsers require weird
// behaviors this becomes very tricky.


function testGetForm() {
  var frm1 = goog.net.IframeIo.getForm_;
  var frm2 = goog.net.IframeIo.getForm_;
  assertEquals(frm1, frm2);
}


function testAddFormInputs() {
  var form = document.createElement(goog.dom.TagName.FORM);
  goog.net.IframeIo.addFormInputs_(form, {'a': 1, 'b': 2, 'c': 3});
  var inputs = form.getElementsByTagName(goog.dom.TagName.INPUT);
  assertEquals(3, inputs.length);
  for (var i = 0; i < inputs.length; i++) {
    assertEquals('hidden', inputs[i].type);
    var n = inputs[i].name;
    assertEquals(n == 'a' ? '1' : n == 'b' ? '2' : '3', inputs[i].value);
  }
}

function testNotIgnoringResponse() {
  // This test can't run in IE because we can't forge the check for
  // iframe.readyState = 'complete'.
  if (goog.userAgent.IE) {
    return;
  }
  var iframeIo = new goog.net.IframeIo();
  iframeIo.send('about:blank');
  // Simulate the frame finishing loading.
  goog.testing.events.fireBrowserEvent(new goog.testing.events.Event(
      goog.events.EventType.LOAD, iframeIo.getRequestIframe()));
  assertTrue(iframeIo.isComplete());
}

function testIgnoreResponse() {
  var iframeIo = new goog.net.IframeIo();
  iframeIo.setIgnoreResponse(true);
  iframeIo.send('about:blank');
  // Simulate the frame finishing loading.
  goog.testing.events.fireBrowserEvent(new goog.testing.events.Event(
      goog.events.EventType.LOAD, iframeIo.getRequestIframe()));
  // Although the request is complete, the IframeIo isn't paying attention.
  assertFalse(iframeIo.isComplete());
}
