// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.testing.proto2Test');
goog.setTestOnly('goog.testing.proto2Test');

goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.proto2');
goog.require('proto2.TestAllTypes');

function setUp() {
  // TODO(b/25875505): Fix unreported assertions (go/failonunreportedasserts).
  goog.testing.TestCase.getActiveTestCase().failOnUnreportedAsserts = false;
}

function testAssertEquals() {
  var assertProto2Equals = goog.testing.proto2.assertEquals;
  assertProto2Equals(new proto2.TestAllTypes, new proto2.TestAllTypes);
  assertProto2Equals(new proto2.TestAllTypes, new proto2.TestAllTypes, 'oops');

  var ex = assertThrows(
      goog.partial(
          assertProto2Equals, new proto2.TestAllTypes,
          new proto2.TestAllTypes.NestedMessage));
  assertEquals(
      'Message type mismatch: TestAllTypes != TestAllTypes.NestedMessage',
      ex.message);

  var message = new proto2.TestAllTypes;
  message.setOptionalInt32(1);
  ex = assertThrows(
      goog.partial(assertProto2Equals, new proto2.TestAllTypes, message));
  assertEquals('optional_int32 should not be present', ex.message);

  ex = assertThrows(
      goog.partial(
          assertProto2Equals, new proto2.TestAllTypes, message, 'oops'));
  assertEquals('oops\noptional_int32 should not be present', ex.message);
}

function testFindDifferences_EmptyMessages() {
  assertEquals(
      '', goog.testing.proto2.findDifferences_(
              new proto2.TestAllTypes, new proto2.TestAllTypes, ''));
}

function testFindDifferences_FieldNotPresent() {
  var message = new proto2.TestAllTypes;
  message.setOptionalInt32(0);
  var empty = new proto2.TestAllTypes;
  assertEquals(
      'optional_int32 should not be present',
      goog.testing.proto2.findDifferences_(empty, message, ''));
  assertEquals(
      'optional_int32 should be present',
      goog.testing.proto2.findDifferences_(message, empty, ''));
  assertEquals(
      'path/optional_int32 should be present',
      goog.testing.proto2.findDifferences_(message, empty, 'path'));
}

function testFindDifferences_IntFieldDiffers() {
  var message1 = new proto2.TestAllTypes;
  message1.setOptionalInt32(1);
  var message2 = new proto2.TestAllTypes;
  message2.setOptionalInt32(2);
  assertEquals(
      'optional_int32 should be 1, but was 2',
      goog.testing.proto2.findDifferences_(message1, message2, ''));
}

function testFindDifferences_NestedIntFieldDiffers() {
  var message1 = new proto2.TestAllTypes;
  var nested1 = new proto2.TestAllTypes.NestedMessage();
  nested1.setB(1);
  message1.setOptionalNestedMessage(nested1);
  var message2 = new proto2.TestAllTypes;
  var nested2 = new proto2.TestAllTypes.NestedMessage();
  nested2.setB(2);
  message2.setOptionalNestedMessage(nested2);
  assertEquals(
      'optional_nested_message/b should be 1, but was 2',
      goog.testing.proto2.findDifferences_(message1, message2, ''));
}

function testFindDifferences_RepeatedFieldLengthDiffers() {
  var message1 = new proto2.TestAllTypes;
  message1.addRepeatedInt32(1);
  var message2 = new proto2.TestAllTypes;
  message2.addRepeatedInt32(1);
  message2.addRepeatedInt32(2);
  assertEquals(
      'repeated_int32 should have 1 items, but has 2',
      goog.testing.proto2.findDifferences_(message1, message2, ''));
}

function testFindDifferences_RepeatedFieldItemDiffers() {
  var message1 = new proto2.TestAllTypes;
  message1.addRepeatedInt32(1);
  var message2 = new proto2.TestAllTypes;
  message2.addRepeatedInt32(2);
  assertEquals(
      'repeated_int32[0] should be 1, but was 2',
      goog.testing.proto2.findDifferences_(message1, message2, ''));
}

function testFindDifferences_RepeatedNestedMessageDiffers() {
  var message1 = new proto2.TestAllTypes;
  var nested1 = new proto2.TestAllTypes.NestedMessage();
  nested1.setB(1);
  message1.addRepeatedNestedMessage(nested1);
  var message2 = new proto2.TestAllTypes;
  var nested2 = new proto2.TestAllTypes.NestedMessage();
  nested2.setB(2);
  message2.addRepeatedNestedMessage(nested2);
  assertEquals(
      'repeated_nested_message[0]/b should be 1, but was 2',
      goog.testing.proto2.findDifferences_(message1, message2, ''));
}

function testFromObject() {
  var nested = new proto2.TestAllTypes.NestedMessage();
  nested.setB(1);
  var message = new proto2.TestAllTypes;
  message.addRepeatedNestedMessage(nested);
  message.setOptionalInt32(2);
  // Successfully deserializes simple as well as message fields.
  assertObjectEquals(
      message,
      goog.testing.proto2.fromObject(
          proto2.TestAllTypes,
          {'optional_int32': 2, 'repeated_nested_message': [{'b': 1}]}));
  // Fails if the field name is not recognized.
  assertThrows(function() {
    goog.testing.proto2.fromObject(proto2.TestAllTypes, {'unknown': 1});
  });
  // Fails if the value type is wrong in the JSON object.
  assertThrows(function() {
    goog.testing.proto2.fromObject(
        proto2.TestAllTypes, {'optional_int32': '1'});
  });
}
