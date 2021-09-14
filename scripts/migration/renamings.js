/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Collected information about modules and module
 * exports that have been renamed between versions.
 *
 * For now this is a node module, not a goog.module.
 */
'use strict';

/**
 * Map from Blockly core version number to table of renamings made
 * *since* that version was released (since we don't know for sure
 * what the version number of the release that will incorporate those
 * renamings will be yet).
 * @type {Object<string, ?>}
 */
const renamings = {
  '4.20201217.0': {
    'Blockly': {
      exports: {
        // bind/unbind events functions.  See PR #4642
        EventData: {module: 'Blockly.eventHandling', export: 'Data'},
        bindEvent_: {module: 'Blockly.browserEvents', export: 'bind'},
        unbindEvent_: {module: 'Blockly.browserEvents', export: 'unbind'},
        bindEventWithChecks_: {
          module: 'Blockly.browserEvents',
          export: 'conditionalBind',
        },
      },
    }
  },
  '6.20210701.0': {
    'Blockly': {
      exports: {
        // Clipboard.  See PR #5237.
        clipboardXml_: {module: 'Blockly.clipboard', export: 'xml'},
        clipboardSource_: {module: 'Blockly.clipboard', export: 'source'},
        clipboardTypeCounts_: {
          module: 'Blockly.clipboard',
          export: 'typeCounts',
        },
        copy: {module: 'Blockly.clipboard'},
        paste: {module: 'Blockly.clipboard'},
        duplicate: {module: 'Blockly.clipboard'},

        // mainWorkspace.  See PR #5244.
        mainWorkspace: {
          module: 'Blockly.common',
          get: 'getMainWorkspace',
          set: 'setMainWorkspace',
        },
        getMainWorkspace: {module: 'Blockly.common'},

        // parentContainer, draggingConnections.  See PR #5262.
        parentContainer: {
          module: 'Blockly.common',
          get: 'getParentContainer',
          set: 'setParentContainer',
        },
        setParentContainer: {module: 'Blockly.common'},
        draggingConnections: {module: 'Blockly.common'},

      },
    },
    'Blockly.utils': {
      exports: {
        genUid: {module: 'Blockly.utils.idGenerator'},
      }
    },
    'Blockly.utils.global': {
      export: 'globalThis',  // Previous default export now named.
    },
    'Blockly.utils.IdGenerator': {
      module: 'Blockly.utils.idGenerator',
    }
  },
};

exports.renamings = renamings;
