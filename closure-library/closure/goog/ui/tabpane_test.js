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

goog.provide('goog.ui.TabPaneTest');
goog.setTestOnly('goog.ui.TabPaneTest');

goog.require('goog.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.TabPane');

var tabPane;
var page1;
var page2;
var page3;

function setUp() {
  goog.dom.getElement('testBody').innerHTML =
      '<div id="tabpane"></div>' +
      '<div id="page1Content">' +
      '  Content for page 1' +
      '</div>' +
      '<div id="page2Content">' +
      '  Content for page 2' +
      '</div>' +
      '<div id="page3Content">' +
      '  Content for page 3' +
      '</div>';

  tabPane = new goog.ui.TabPane(goog.dom.getElement('tabpane'));
  page1 = new goog.ui.TabPane.TabPage(goog.dom.getElement('page1Content'),
      'page1');
  page2 = new goog.ui.TabPane.TabPage(goog.dom.getElement('page2Content'),
      'page2');
  page3 = new goog.ui.TabPane.TabPage(goog.dom.getElement('page3Content'),
      'page3');

  tabPane.addPage(page1);
  tabPane.addPage(page2);
  tabPane.addPage(page3);
}

function tearDown() {
  tabPane.dispose();
}

function testAllPagesEnabledAndSelectable() {
  tabPane.setSelectedIndex(0);
  var selected = tabPane.getSelectedPage();
  assertEquals('page1 should be selected', 'page1', selected.getTitle());
  assertEquals('goog-tabpane-tab-selected',
               selected.getTitleElement().className);

  tabPane.setSelectedIndex(1);
  selected = tabPane.getSelectedPage();
  assertEquals('page2 should be selected', 'page2', selected.getTitle());
  assertEquals('goog-tabpane-tab-selected',
               selected.getTitleElement().className);

  tabPane.setSelectedIndex(2);
  selected = tabPane.getSelectedPage();
  assertEquals('page3 should be selected', 'page3', selected.getTitle());
  assertEquals('goog-tabpane-tab-selected',
               selected.getTitleElement().className);
}

function testDisabledPageIsNotSelectable() {
  page2.setEnabled(false);
  assertEquals('goog-tabpane-tab-disabled',
               page2.getTitleElement().className);

  tabPane.setSelectedIndex(0);
  var selected = tabPane.getSelectedPage();
  assertEquals('page1 should be selected', 'page1', selected.getTitle());
  assertEquals('goog-tabpane-tab-selected',
               selected.getTitleElement().className);

  tabPane.setSelectedIndex(1);
  selected = tabPane.getSelectedPage();
  assertEquals('page1 should remain selected, as page2 is disabled',
               'page1', selected.getTitle());
  assertEquals('goog-tabpane-tab-selected',
               selected.getTitleElement().className);

  tabPane.setSelectedIndex(2);
  selected = tabPane.getSelectedPage();
  assertEquals('page3 should be selected', 'page3', selected.getTitle());
  assertEquals('goog-tabpane-tab-selected',
               selected.getTitleElement().className);
}
