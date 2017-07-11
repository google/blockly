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
 * An import/export type id for a library of BlockFactory's original block
 * save files (each a serialized workspace of block definition blocks).
 */
BlocklyDevTools.Analytics.BLOCK_FACTORY_LIBRARY = "Block Factory library";
/**
 * An import/export type id for a standard Blockly library of block
 * definitions.
 */
BlocklyDevTools.Analytics.BLOCK_DEFINITIONS = "Block definitions";
/**
 * An import/export type id for a code generation function, or a
 * boilerplate stub of the same.
 */
BlocklyDevTools.Analytics.GENERATOR = "Generator";
/** An import/export type id for a Blockly Toolbox. */
BlocklyDevTools.Analytics.TOOLBOX = "Toolbox";
/** An import/export type id for the serialized contents of a workspace. */
BlocklyDevTools.Analytics.WORKSPACE_CONTENTS = "Workspace contents";

BlocklyDevTools.Analytics.FORMAT_JS = "JavaScript";
BlocklyDevTools.Analytics.FORMAT_JSON = "JSON";
BlocklyDevTools.Analytics.FORMAT_XML = "XML";

BlocklyDevTools.Analytics.PLATFORM_WEB = "web";
BlocklyDevTools.Analytics.PLATFORM_ANDROID = "Android";
BlocklyDevTools.Analytics.PLATFORM_IOS = "iOS";

/**
 * Initializes the analytics framework, including noting that the page/app was
 * opened.
 * @public
 */
BlocklyDevTools.Analytics.init = function() {
  // stub
  this.LOG_TO_CONSOLE && console.log('Analytics.init');
};

/**
 * Event noting the user navigated to a specific view.
 *
 * @public
 * @param viewId {string} An identifier for the view state.
 */
BlocklyDevTools.Analytics.onNavigateTo = function(viewId) {
  // stub
  this.LOG_TO_CONSOLE && console.log('Analytics.onNavigateTo(' + viewId + ')');
};

/**
 * Event noting a project resource was saved. In the web Block Factory, this
 * means saved to localStorage.
 *
 * @public
 * @param typeId {string} An identifying string for the saved type.
 */
BlocklyDevTools.Analytics.onSave = function(typeId) {
  // stub
  this.LOG_TO_CONSOLE && console.log('Analytics.onSave(' + typeId + ')');
};

/**
 * Event noting the user attempted to import a resource file.
 *
 * @public
 * @param typeId {string} An identifying string for the imported type.
 * @param optMetadata {Object} Metadata about the import, such as format and
 *                             platform.
 */
BlocklyDevTools.Analytics.onImport = function(typeId, optMetadata) {
  // stub
  this.LOG_TO_CONSOLE && console.log('Analytics.onImport(' + typeId +
      (optMetadata ? '): ' + JSON.stringify(optMetadata) : ')'));
};

/**
 * Event noting a project resource was saved. In the web Block Factory, this
 * means downloaded to the user's system.
 *
 * @public
 * @param typeId {string} An identifying string for the exported object type.
 * @param optMetadata {Object} Metadata about the import, such as format and
 *                             platform.
 */
BlocklyDevTools.Analytics.onExport = function(typeId, optMetadata) {
  // stub
  this.LOG_TO_CONSOLE && console.log('Analytics.onExport(' + typeId +
      (optMetadata ? '): ' + JSON.stringify(optMetadata) : ')'));
};

/**
 * Event noting the system encountered an error. It should attempt to send
 * immediately.
 *
 * @public
 * @param e {!Object} A value representing or describing the error.
 */
BlocklyDevTools.Analytics.onError = function(e) {
  // stub
  this.LOG_TO_CONSOLE && console.log('Analytics.onError("' + e.toString() + '")');
};

/**
 * Event noting the user was notified with a warning.
 *
 * @public
 * @param msg {string} The warning message, or a description thereof.
 */
BlocklyDevTools.Analytics.onWarning = function(msg) {
  // stub
  this.LOG_TO_CONSOLE && console.log('Analytics.onWarning("' + msg + '")');
};

/**
 * Request the analytics framework to send any queued events to the server.
 * @public
 */
BlocklyDevTools.Analytics.sendQueued = function() {
  // stub
  this.LOG_TO_CONSOLE && console.log('Analytics.sendQueued');
};

