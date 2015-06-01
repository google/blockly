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

goog.provide('goog.ds.ExprTest');
goog.setTestOnly('goog.ds.ExprTest');

goog.require('goog.ds.DataManager');
goog.require('goog.ds.Expr');
goog.require('goog.ds.JsDataSource');
goog.require('goog.testing.jsunit');

var jsDs;
var jsObj = {
  Success: true,
  Errors: [],
  Body: {
    Contacts: [
      {
        Name: 'John Doe',
        Email: 'john@gmail.com',
        EmailCount: 300
      },
      {
        Name: 'Jane Doh',
        Email: 'jane@gmail.com'
      },
      {
        Name: 'Steve Smith',
        Email: 'steve@gmail.com',
        EmailCount: 305
      },
      {
        Name: 'John Smith',
        Email: 'smith@gmail.com'
      },
      {
        Name: 'Homer Simpson',
        Email: 'homer@gmail.com'
      },
      {
        Name: 'Bart Simpson',
        Email: 'bart@gmail.com'
      }
    ]
  }
};

function setUp() {
  jsDs = new goog.ds.JsDataSource(jsObj, 'JS', null);
  var dm = goog.ds.DataManager.getInstance();
  dm.addDataSource(jsDs, true);
}

function testBasicStuff() {
  assertNotNull('Get Body', goog.ds.Expr.create('$JS/Body').getNode());
}

function testArrayExpressions() {
  assertEquals(6,
      goog.ds.Expr.create('$JS/Body/Contacts/*').getNodes().getCount());
  assertEquals('John Doe',
      goog.ds.Expr.create('$JS/Body/Contacts/[0]/Name').getValue());
  assertEquals(305,
      goog.ds.Expr.create('$JS/Body/Contacts/[2]/EmailCount').getValue());
  assertEquals(6,
      goog.ds.Expr.create('$JS/Body/Contacts/*/count()').getValue());
  assertEquals(0, goog.ds.Expr.create('$JS/Errors/*/count()').getValue());
}

function testCommonExpressions() {
  assertTrue(goog.ds.Expr.create('.').isCurrent_);
  assertFalse(goog.ds.Expr.create('Bob').isCurrent_);
  assertTrue(goog.ds.Expr.create('*|text()').isAllChildNodes_);
  assertFalse(goog.ds.Expr.create('Bob').isAllChildNodes_);
  assertTrue(goog.ds.Expr.create('@*').isAllAttributes_);
  assertFalse(goog.ds.Expr.create('Bob').isAllAttributes_);
  assertTrue(goog.ds.Expr.create('*').isAllElements_);
  assertFalse(goog.ds.Expr.create('Bob').isAllElements_);
}

function testIndexExpressions() {
  assertEquals(goog.ds.Expr.create('node/[5]').getNext().size_, 1);
  assertEquals(goog.ds.Expr.create('node/[5]').getNext().parts_[0], '[5]');
}
