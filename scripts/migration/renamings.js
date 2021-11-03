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
  // Example entry:
  '0.0.0': {  // These renaming were made after version 0.0.0 was published.
    // Each entry is keyed by the original module name.
    'module.name.Old': {
      // If the module has been renamed, its new name will be listed.
      module: 'module.name.new',

      // Modules which had a default export that has been turned into
      // a named export the new name will be given.
      export: 'defaultName',

      // For backward-compatibility reasons, we may choose to continue
      // to reexport default exports in the same place in the Blockly
      // tree that they were previously (or nearby).  If so, the full
      // path to the former default export will be listed.  This path
      // is only relevant to code that accesses the export via the
      // namespace tree rather than by a named import.
      //
      // The given example implies that:
      //     module.name.Old ===
      //         goog.require('module.name.new').defaultExport
      // which may not be what what one expects but is very handy.
      path: 'module.name.Old',
      // If path is not given explicitly then it can be assumed to be
      // `${module}.${export}`.

      // Modules which already had named exports can instead list
      // information about exports which have been renamed or moved in
      // the exports subsection, which is a map from old export name
      // to object with info about the new export name.
      exports: {
        oldExportName: {  // No need to quote this.

          // If the export has been moved to a different module, that
          // module is listed.
          module: 'module.name.other',

          // If the export has been given a new name, that is listed.
          export: 'newExportName',

          // As with default exports, if a named export has been
          // reexported on the namespace tree somewhere other than at
          // `${module}.${export}` then that can specified explicitly.
          path: 'module.name.Old.oldExportName',
          // This given example implies that code that previously
          // accessed this export via module.name.Old.oldExportName
          // can continue to do so; only code using named requires
          // needs to update from
          //      goog.require('module.name.Old').oldExportName
          // to
          //      goog.require('module.name.new').newExportName
        },
        // More individual exports in this module can be listed here.
      },
    },
    // More modules with renamings can be listed here.
  },

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
    },
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
        // Dialogs.  See PR #5457.
        alert: {
          module: 'Blockly.dialog',
          export: 'alert',
          set: 'setAlert',
        },
        confirm: {
          module: 'Blockly.dialog',
          export: 'confirm',
          set: 'setConfirm',
        },
        prompt: {
          module: 'Blockly.dialog',
          export: 'prompt',
          set: 'setPrompt',
        },
        // hueToHex.  See PR #5462.
        hueToHex: {module: 'Blockly.utils.colour'},
        // Blockly.hideChaff() became
        // Blockly.common.getMainWorkspace().hideChaff().  See PR #5460.

        // selected.  See PR #5489.
        selected: {
          module: 'Blockly.common',
          get: 'getSelected',
          set: 'setSelected',
        },
      },
    },
    'Blockly.Blocks': {
      module: 'Blockly.blocks',
      export: 'Blocks',  // Previous default export now named.
      path: 'Blockly.Blocks',  // But still on tree with original name.
    },
    'Blockly.ContextMenu': {
      exports: {
        currentBlock: {get: 'getCurrentBlock', set: 'setCurrentBlock'},
      },
    },
    'Blockly.Events': {
      exports: {
        recordUndo: {get: 'getRecordUndo', set: 'setRecordUndo'},
      },
    },
    'Blockly.Tooltip': {
      exports: {
        DIV: {get: 'getDiv', set: 'setDiv'},
        visible: {get: 'isVisible'},
      },
    },
    'Blockly.WidgetDiv': {
      exports: {
        DIV: {get: 'getDiv'},
      },
    },
    'Blockly.connectionTypes': {
      module: 'Blockly.ConnectionType',
      export: 'ConnectionType',  // Previous default export now named.
      path: 'Blockly.ConnectionType',  // Type reexported directly.
    },
    'Blockly.utils': {
      exports: {
        genUid: {module: 'Blockly.utils.idGenerator'},
        getScrollDelta: {module: 'Blockly.utils.browserEvents'},
        isTargetInput: {module: 'Blockly.utils.browserEvents'},
        isRightButton: {module: 'Blockly.utils.browserEvents'},
        mouseToSvg: {module: 'Blockly.utils.browserEvents'},
      },
    },
    'Blockly.utils.global': {
      export: 'globalThis',  // Previous default export now named.
      path: 'Blockly.utils.global',  // But still exported under original name.
    },
    'Blockly.utils.IdGenerator': {
      module: 'Blockly.utils.idGenerator',
    },
    'Blockly.utils.xml': {
      exports: {
        // document was a function before, too - not a static property
        // or get accessor.
        document: {export: 'getDocument'},
      },
    },
  },
  '7.20211209.0-beta.0': {
    'Blockly.Blocks.colour': {module: 'Blockly.blocks.colour'},
    // Blockly.Blocks.lists not previously provided.
    'Blockly.Blocks.logic': {module: 'Blockly.blocks.logic'},
    'Blockly.Blocks.loops': {module: 'Blockly.blocks.loops'},
    'Blockly.Blocks.math': {module: 'Blockly.blocks.math'},
    'Blockly.Blocks.procedures': {module: 'Blockly.blocks.procedures'},
    'Blockly.Blocks.texts': {module: 'Blockly.blocks.texts'},
    'Blockly.Blocks.variables': {module: 'Blockly.blocks.variables'},
    // Blockly.Blocks.variablesDynamic not previously provided.
  }
};

exports.renamings = renamings;
