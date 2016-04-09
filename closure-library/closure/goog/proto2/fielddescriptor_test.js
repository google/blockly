// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.proto2.FieldDescriptorTest');
goog.setTestOnly('goog.proto2.FieldDescriptorTest');

goog.require('goog.proto2.FieldDescriptor');
goog.require('goog.proto2.Message');
goog.require('goog.testing.jsunit');

function testFieldDescriptorConstruction() {
  var messageType = {};
  var fieldDescriptor = new goog.proto2.FieldDescriptor(messageType, 10, {
    name: 'test',
    repeated: true,
    packed: true,
    fieldType: goog.proto2.FieldDescriptor.FieldType.INT32,
    type: Number
  });

  assertEquals(10, fieldDescriptor.getTag());
  assertEquals('test', fieldDescriptor.getName());

  assertEquals(true, fieldDescriptor.isRepeated());

  assertEquals(true, fieldDescriptor.isPacked());

  assertEquals(
      goog.proto2.FieldDescriptor.FieldType.INT32,
      fieldDescriptor.getFieldType());
  assertEquals(Number, fieldDescriptor.getNativeType());
  assertEquals(0, fieldDescriptor.getDefaultValue());
}

function testGetDefaultValueOfString() {
  var fieldDescriptor = new goog.proto2.FieldDescriptor({}, 10, {
    name: 'test',
    fieldType: goog.proto2.FieldDescriptor.FieldType.STRING,
    type: String
  });

  assertEquals('', fieldDescriptor.getDefaultValue());
}

function testGetDefaultValueOfBool() {
  var fieldDescriptor = new goog.proto2.FieldDescriptor({}, 10, {
    name: 'test',
    fieldType: goog.proto2.FieldDescriptor.FieldType.BOOL,
    type: Boolean
  });

  assertEquals(false, fieldDescriptor.getDefaultValue());
}

function testGetDefaultValueOfInt64() {
  var fieldDescriptor = new goog.proto2.FieldDescriptor({}, 10, {
    name: 'test',
    fieldType: goog.proto2.FieldDescriptor.FieldType.INT64,
    type: String
  });

  assertEquals('0', fieldDescriptor.getDefaultValue());
}

function testRepeatedField() {
  var messageType = {};
  var fieldDescriptor = new goog.proto2.FieldDescriptor(
      messageType, 10,
      {name: 'test', repeated: true, fieldType: 7, type: Number});

  assertEquals(true, fieldDescriptor.isRepeated());
  assertEquals(false, fieldDescriptor.isRequired());
  assertEquals(false, fieldDescriptor.isOptional());
}

function testRequiredField() {
  var messageType = {};
  var fieldDescriptor = new goog.proto2.FieldDescriptor(
      messageType, 10,
      {name: 'test', required: true, fieldType: 7, type: Number});

  assertEquals(false, fieldDescriptor.isRepeated());
  assertEquals(true, fieldDescriptor.isRequired());
  assertEquals(false, fieldDescriptor.isOptional());
}

function testOptionalField() {
  var messageType = {};
  var fieldDescriptor = new goog.proto2.FieldDescriptor(
      messageType, 10, {name: 'test', fieldType: 7, type: Number});

  assertEquals(false, fieldDescriptor.isRepeated());
  assertEquals(false, fieldDescriptor.isRequired());
  assertEquals(true, fieldDescriptor.isOptional());
}

function testContaingType() {
  var MessageType = function() { MessageType.base(this, 'constructor'); };
  goog.inherits(MessageType, goog.proto2.Message);

  MessageType.getDescriptor = function() {
    if (!MessageType.descriptor_) {
      // The descriptor is created lazily when we instantiate a new instance.
      var descriptorObj = {
        0: {name: 'test_message', fullName: 'this.is.a.test_message'},
        10: {name: 'test', fieldType: 7, type: Number}
      };
      MessageType.descriptor_ =
          goog.proto2.Message.createDescriptor(MessageType, descriptorObj);
    }
    return MessageType.descriptor_;
  };
  MessageType.prototype.getDescriptor = MessageType.getDescriptor;

  var descriptor = MessageType.getDescriptor();
  var fieldDescriptor = descriptor.getFields()[0];
  assertEquals('10', fieldDescriptor.getTag());
  assertEquals(descriptor, fieldDescriptor.getContainingType());
}
