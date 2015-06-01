// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.events.FileDropHandlerTest');
goog.setTestOnly('goog.events.FileDropHandlerTest');

goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.events.FileDropHandler');
goog.require('goog.testing.jsunit');

var textarea;
var doc;
var handler;
var dnd;
var files;

function setUp() {
  textarea = new goog.events.EventTarget();
  doc = new goog.events.EventTarget();
  textarea.ownerDocument = doc;
  handler = new goog.events.FileDropHandler(textarea);
  dnd = false;
  files = null;
  goog.events.listen(handler, goog.events.FileDropHandler.EventType.DROP,
      function(e) {
        dnd = true;
        files =
            e.getBrowserEvent().dataTransfer.files;
      });
}

function tearDown() {
  textarea.dispose();
  doc.dispose();
  handler.dispose();
}

function testOneFile() {
  var preventDefault = false;
  var expectedfiles = [{ fileName: 'file1.jpg' }];
  var dt = { types: ['Files'], files: expectedfiles };

  // Assert that default actions are prevented on dragenter.
  textarea.dispatchEvent(new goog.events.BrowserEvent({
    preventDefault: function() { preventDefault = true; },
    type: goog.events.EventType.DRAGENTER,
    dataTransfer: dt
  }));
  assertTrue(preventDefault);
  preventDefault = false;

  // Assert that default actions are prevented on dragover.
  textarea.dispatchEvent(new goog.events.BrowserEvent({
    preventDefault: function() { preventDefault = true; },
    type: goog.events.EventType.DRAGOVER,
    dataTransfer: dt
  }));
  assertTrue(preventDefault);
  preventDefault = false;
  // Assert that the drop effect is set to 'copy'.
  assertEquals('copy', dt.dropEffect);

  // Assert that default actions are prevented on drop.
  textarea.dispatchEvent(new goog.events.BrowserEvent({
    preventDefault: function() { preventDefault = true; },
    type: goog.events.EventType.DROP,
    dataTransfer: dt
  }));
  assertTrue(preventDefault);

  // Assert that DROP has been fired.
  assertTrue(dnd);
  assertEquals(1, files.length);
  assertEquals(expectedfiles[0].fileName, files[0].fileName);
}

function testMultipleFiles() {
  var preventDefault = false;
  var expectedfiles = [{ fileName: 'file1.jpg' }, { fileName: 'file2.jpg' }];
  var dt = { types: ['Files', 'text'], files: expectedfiles };

  // Assert that default actions are prevented on dragenter.
  textarea.dispatchEvent(new goog.events.BrowserEvent({
    preventDefault: function() { preventDefault = true; },
    type: goog.events.EventType.DRAGENTER,
    dataTransfer: dt
  }));
  assertTrue(preventDefault);
  preventDefault = false;

  // Assert that default actions are prevented on dragover.
  textarea.dispatchEvent(new goog.events.BrowserEvent({
    preventDefault: function() { preventDefault = true; },
    type: goog.events.EventType.DRAGOVER,
    dataTransfer: dt
  }));
  assertTrue(preventDefault);
  preventDefault = false;
  // Assert that the drop effect is set to 'copy'.
  assertEquals('copy', dt.dropEffect);

  // Assert that default actions are prevented on drop.
  textarea.dispatchEvent(new goog.events.BrowserEvent({
    preventDefault: function() { preventDefault = true; },
    type: goog.events.EventType.DROP,
    dataTransfer: dt
  }));
  assertTrue(preventDefault);

  // Assert that DROP has been fired.
  assertTrue(dnd);
  assertEquals(2, files.length);
  assertEquals(expectedfiles[0].fileName, files[0].fileName);
  assertEquals(expectedfiles[1].fileName, files[1].fileName);
}

function testNoFiles() {
  var preventDefault = false;
  var dt = { types: ['text'] };

  // Assert that default actions are not prevented on dragenter.
  textarea.dispatchEvent(new goog.events.BrowserEvent({
    preventDefault: function() { preventDefault = true; },
    type: goog.events.EventType.DRAGENTER,
    dataTransfer: dt
  }));
  assertFalse(preventDefault);
  preventDefault = false;

  // Assert that default actions are not prevented on dragover.
  textarea.dispatchEvent(new goog.events.BrowserEvent({
    preventDefault: function() { preventDefault = true; },
    type: goog.events.EventType.DRAGOVER,
    dataTransfer: dt
  }));
  assertFalse(preventDefault);
  preventDefault = false;

  // Assert that default actions are not prevented on drop.
  textarea.dispatchEvent(new goog.events.BrowserEvent({
    preventDefault: function() { preventDefault = true; },
    type: goog.events.EventType.DROP,
    dataTransfer: dt
  }));
  assertFalse(preventDefault);

  // Assert that DROP has not been fired.
  assertFalse(dnd);
  assertNull(files);
}

function testDragEnter() {
  var preventDefault = false;

  // Assert that default actions are prevented on dragenter.
  // In Chrome the dragenter event has an empty file list and the types is
  // set to 'Files'.
  textarea.dispatchEvent(new goog.events.BrowserEvent({
    preventDefault: function() { preventDefault = true; },
    type: goog.events.EventType.DRAGENTER,
    dataTransfer: { types: ['Files'], files: [] }
  }));
  assertTrue(preventDefault);
  preventDefault = false;

  // Assert that default actions are prevented on dragenter.
  // In Safari 4 the dragenter event has an empty file list and the types is
  // set to 'public.file-url'.
  textarea.dispatchEvent(new goog.events.BrowserEvent({
    preventDefault: function() { preventDefault = true; },
    type: goog.events.EventType.DRAGENTER,
    dataTransfer: { types: ['public.file-url'], files: [] }
  }));
  assertTrue(preventDefault);
  preventDefault = false;

  // Assert that default actions are not prevented on dragenter
  // when the drag contains no files.
  textarea.dispatchEvent(new goog.events.BrowserEvent({
    preventDefault: function() { preventDefault = true; },
    type: goog.events.EventType.DRAGENTER,
    dataTransfer: { types: ['text'], files: [] }
  }));
  assertFalse(preventDefault);
}

function testPreventDropOutside() {
  var preventDefault = false;
  var dt = { types: ['Files'], files: [{ fileName: 'file1.jpg' }] };

  // Assert that default actions are not prevented on dragenter on the
  // document outside the text area.
  doc.dispatchEvent(new goog.events.BrowserEvent({
    preventDefault: function() { preventDefault = true; },
    type: goog.events.EventType.DRAGENTER,
    dataTransfer: dt
  }));
  assertFalse(preventDefault);
  preventDefault = false;

  // Assert that default actions are not prevented on dragover on the
  // document outside the text area.
  doc.dispatchEvent(new goog.events.BrowserEvent({
    preventDefault: function() { preventDefault = true; },
    type: goog.events.EventType.DRAGOVER,
    dataTransfer: dt
  }));
  assertFalse(preventDefault);
  preventDefault = false;

  handler.dispose();
  // Create a new FileDropHandler that prevents drops outside the text area.
  handler = new goog.events.FileDropHandler(textarea, true);

  // Assert that default actions are now prevented on dragenter on the
  // document outside the text area.
  doc.dispatchEvent(new goog.events.BrowserEvent({
    preventDefault: function() { preventDefault = true; },
    type: goog.events.EventType.DRAGENTER,
    dataTransfer: dt
  }));
  assertTrue(preventDefault);
  preventDefault = false;

  // Assert that default actions are now prevented on dragover on the
  // document outside the text area.
  doc.dispatchEvent(new goog.events.BrowserEvent({
    preventDefault: function() { preventDefault = true; },
    type: goog.events.EventType.DRAGOVER,
    dataTransfer: dt
  }));
  assertTrue(preventDefault);
  preventDefault = false;
  // Assert also that the drop effect is set to 'none'.
  assertEquals('none', dt.dropEffect);
}
