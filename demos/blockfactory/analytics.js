/**
 * @license
 * Blockly Demos: Block Factory
 *
 * Copyright 2017 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Stubbed interface functions for analytics integration.
 */

goog.provide('BlocklyDevTools.Analytics');

BlocklyDevTools.Analytics.LOG_TO_CONSOLE = false;

/**
 * Initializes the analytics framework, including noting that the page/app was
 * opened.
 */
BlocklyDevTools.Analytics.init = function() {
  // stub
  this.LOG_TO_CONSOLE && console.log('Analytics.init');
};

/**
 * Event noting the user navigated to a specific view.
 * @param viewId {string} An identifier for the view state.
 */
BlocklyDevTools.Analytics.onNavigateTo = function(viewId) {
  // stub
  this.LOG_TO_CONSOLE && console.log('Analytics.onNavigateTo(' + viewId + ')');
};

/**
 * Event noting a project resource was saved. In the web Block Factory, this
 * means saved to localStorage.
 * @param typeId {string} An identifying string for the saved type.
 */
BlocklyDevTools.Analytics.onSave = function(typeId) {
  // stub
  this.LOG_TO_CONSOLE && console.log('Analytics.onSave(' + typeId + ')');
};

/**
 * Event noting the user attempted to import a resource file.
 * @param typeId {string} An identifying string for the imported type.
 */
BlocklyDevTools.Analytics.onImport = function(typeId) {
  // stub
  this.LOG_TO_CONSOLE && console.log('Analytics.onImport(' + typeId + ')');
};

/**
 * Event noting a project resource was saved. In the web Block Factory, this
 * means downloaded to the user's system.
 * @param typeId {string} An identifying string for the exported type.
 */
BlocklyDevTools.Analytics.onExport = function(typeId, optFormatId) {
  // stub
  this.LOG_TO_CONSOLE && console.log('Analytics.onExport(' + typeId +
      (optFormatId ? ', ' + optFormatId : '') + ')');
};

/**
 * Event noting the system encountered an error.
 * @param e {!Object} A value representing or describing the error.
 */
BlocklyDevTools.Analytics.onError = function(e) {
  // stub
  this.LOG_TO_CONSOLE && console.log('Analytics.onError("' + e.toString() + '")');
};

/**
 * Event noting the user was notified with a warning.
 * @param msg {strong} The warning message, or a description thereof.
 */
BlocklyDevTools.Analytics.onWarning = function(msg) {
  // stub
  this.LOG_TO_CONSOLE && console.log('Analytics.onWarning("' + msg + '")');
};

/**
 * Request the analytics framework to send any queued events to the server.
 */
BlocklyDevTools.Analytics.sendQueued = function() {
  // stub
  this.LOG_TO_CONSOLE && console.log('Analytics.sendQueued');
};

