// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.dom.datasetTest');
goog.setTestOnly('goog.dom.datasetTest');

goog.require('goog.dom');
goog.require('goog.dom.dataset');
goog.require('goog.testing.jsunit');

var $ = goog.dom.getElement;
var dataset = goog.dom.dataset;


function setUp() {
  var el = $('el2');
  el.setAttribute('data-dynamic-key', 'dynamic');
}


function testHas() {
  var el = $('el1');

  assertTrue('Dataset should have an existing key',
             dataset.has(el, 'basicKey'));
  assertTrue('Dataset should have an existing (unusual) key',
             dataset.has(el, 'UnusualKey1'));
  assertTrue('Dataset should have an existing (unusual) key',
             dataset.has(el, 'unusual-Key2'));
  assertTrue('Dataset should have an existing (bizarre) key',
             dataset.has(el, '-Bizarre--Key'));
  assertFalse('Dataset should not have a non-existent key',
              dataset.has(el, 'bogusKey'));
}


function testGet() {
  var el = $('el1');

  assertEquals('Dataset should return the proper value for an existing key',
               dataset.get(el, 'basicKey'), 'basic');
  assertEquals('Dataset should have an existing (unusual) key',
               dataset.get(el, 'UnusualKey1'), 'unusual1');
  assertEquals('Dataset should have an existing (unusual) key',
               dataset.get(el, 'unusual-Key2'), 'unusual2');
  assertEquals('Dataset should have an existing (bizarre) key',
               dataset.get(el, '-Bizarre--Key'), 'bizarre');
  assertFalse(
      'Dataset should return null or an empty string for a non-existent key',
      !!dataset.get(el, 'bogusKey'));

  el = $('el2');
  assertEquals('Dataset should return the proper value for an existing key',
               dataset.get(el, 'dynamicKey'), 'dynamic');
}


function testSet() {
  var el = $('el2');

  dataset.set(el, 'newKey', 'newValue');
  assertTrue('Dataset should have a newly created key',
             dataset.has(el, 'newKey'));
  assertEquals('Dataset should return the proper value for a newly created key',
               dataset.get(el, 'newKey'), 'newValue');

  dataset.set(el, 'dynamicKey', 'customValue');
  assertTrue('Dataset should have a modified, existing key',
             dataset.has(el, 'dynamicKey'));
  assertEquals('Dataset should return the proper value for a modified key',
               dataset.get(el, 'dynamicKey'), 'customValue');
}


function testRemove() {
  var el = $('el2');

  dataset.remove(el, 'dynamicKey');
  assertFalse('Dataset should not have a removed key',
              dataset.has(el, 'dynamicKey'));
  assertFalse('Dataset should return null or an empty string for removed key',
              !!dataset.get(el, 'dynamicKey'));
}


function testGetAll() {
  var el = $('el1');
  var expectedDataset = {
    'basicKey': 'basic',
    'UnusualKey1': 'unusual1',
    'unusual-Key2': 'unusual2',
    '-Bizarre--Key': 'bizarre'
  };
  assertHashEquals('Dataset should have basicKey, UnusualKey1, ' +
                   'unusual-Key2, and -Bizarre--Key',
                   expectedDataset, dataset.getAll(el));
}
