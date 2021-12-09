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
  '0.0.0': {
    // These renaming were made after version 0.0.0 was published.
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
        oldExportName: {
          // No need to quote this.

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
        // Align.
        ALIGN_LEFT: {
          module: 'Blockly.Input',
          export: 'Align.LEFT',
          path: 'Blockly.ALIGN_LEFT',
        },
        ALIGN_CENTRE: {
          module: 'Blockly.Input',
          export: 'Align.CENTRE',
          path: 'Blockly.ALIGN_CENTRE',
        },
        ALIGN_RIGHT: {
          module: 'Blockly.Input',
          export: 'Align.RIGHT',
          path: 'Blockly.ALIGN_RIGHT',
        },
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
      export: 'Blocks',        // Previous default export now named.
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
      export: 'ConnectionType',        // Previous default export now named.
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
      export: 'globalThis',          // Previous default export now named.
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
    'Blockly.utils': {
      exports: {
        screenToWsCoordinates: {module: 'Blockly.utils.svgMath'},
        getDocumentScroll: {module: 'Blockly.utils.svgMath'},
        getViewportBBox: {module: 'Blockly.utils.svgMath'},
        is3dSupported: {module: 'Blockly.utils.svgMath'},
        getRelativeXY: {module: 'Blockly.utils.svgMath'},
        getInjectionDivXY_:
            {module: 'Blockly.utils.svgMath', export: 'getInjectionDivXY'},
        parseBlockColour: {module: 'Blockly.utils.parsing'},
        checkMessageReferences: {module: 'Blockly.utils.parsing'},
        replaceMessageReferences: {module: 'Blockly.utils.parsing'},
        tokenizeInterpolation: {module: 'Blockly.utils.parsing'},
        arrayRemove: {module: 'Blockly.utils.array', export: 'removeElem'},
        getBlockTypeCounts:
            {module: 'Blockly.common', export: 'getBlockTypeCounts'},
        runAfterPageLoad:
            {module: 'Blockly.Extensions', export: 'runAfterPageLoad'},
      },
    },
    'Blockly.Events.Abstract': {
      export: 'Abstract',
      path: 'Blockly.Events.Abstract',
    },
    'Blockly.Events.BlockBase': {
      export: 'BlockBase',
      path: 'Blockly.Events.BlockBase',
    },
    'Blockly.Events.BlockChange': {
      export: 'BlockChange',
      path: 'Blockly.Events.BlockChange',
    },
    'Blockly.Events.BlockCreate': {
      export: 'BlockCreate',
      path: 'Blockly.Events.BlockCreate',
    },
    'Blockly.Events.BlockDelete': {
      export: 'BlockDelete',
      path: 'Blockly.Events.BlockDelete',
    },
    'Blockly.Events.BlockDrag': {
      export: 'BlockDrag',
      path: 'Blockly.Events.BlockDrag',
    },
    'Blockly.Events.BlockMove': {
      export: 'BlockMove',
      path: 'Blockly.Events.BlockMove',
    },
    'Blockly.Events.BubbleOpen': {
      export: 'BubbleOpen',
      path: 'Blockly.Events.BubbleOpen',
    },
    'Blockly.Events.Click': {
      export: 'Click',
      path: 'Blockly.Events.Click',
    },
    'Blockly.Events.CommentBase': {
      export: 'CommentBase',
      path: 'Blockly.Events.CommentBase',
    },
    'Blockly.Events.CommentChange': {
      export: 'CommentChange',
      path: 'Blockly.Events.CommentChange',
    },
    'Blockly.Events.CommentCreate': {
      export: 'CommentCreate',
      path: 'Blockly.Events.CommentCreate',
    },
    'Blockly.Events.CommentDelete': {
      export: 'CommentDelete',
      path: 'Blockly.Events.CommentDelete',
    },
    'Blockly.Events.CommentMove': {
      export: 'CommentMove',
      path: 'Blockly.Events.CommentMove',
    },
    'Blockly.Events.MarkerMove': {
      export: 'MarkerMove',
      path: 'Blockly.Events.MarkerMove',
    },
    'Blockly.Events.Selected': {
      export: 'Selected',
      path: 'Blockly.Events.Selected',
    },
    'Blockly.Events.ThemeChange': {
      export: 'ThemeChange',
      path: 'Blockly.Events.ThemeChange',
    },
    'Blockly.Events.ToolboxItemSelect': {
      export: 'ToolboxItemSelect',
      path: 'Blockly.Events.ToolboxItemSelect',
    },
    'Blockly.Events.TrashcanOpen': {
      export: 'TrashcanOpen',
      path: 'Blockly.Events.TrashcanOpen',
    },
    'Blockly.Events.Ui': {
      export: 'Ui',
      path: 'Blockly.Events.Ui',
    },
    'Blockly.Events.UiBase': {
      export: 'UiBase',
      path: 'Blockly.Events.UiBase',
    },
    'Blockly.Events.VarBase': {
      export: 'VarBase',
      path: 'Blockly.Events.VarBase',
    },
    'Blockly.Events.VarCreate': {
      export: 'VarCreate',
      path: 'Blockly.Events.VarCreate',
    },
    'Blockly.Events.VarDelete': {
      export: 'VarDelete',
      path: 'Blockly.Events.VarDelete',
    },
    'Blockly.Events.VarRename': {
      export: 'VarRename',
      path: 'Blockly.Events.VarRename',
    },
    'Blockly.Events.ViewportChange': {
      export: 'ViewportChange',
      path: 'Blockly.Events.ViewportChange',
    },
    'Blockly.Events.FinishedLoading': {
      export: 'FinishedLoading',
      path: 'Blockly.Events.FinishedLoading',
    },
    'Blockly.IASTNodeLocation': {
      export: 'IASTNodeLocation',
      path: 'Blockly.IASTNodeLocation',
    },
    'Blockly.IASTNodeLocationSvg': {
      export: 'IASTNodeLocationSvg',
      path: 'Blockly.IASTNodeLocationSvg',
    },
    'Blockly.IASTNodeLocationWithBlock': {
      export: 'IASTNodeLocationWithBlock',
      path: 'Blockly.IASTNodeLocationWithBlock',
    },
    'Blockly.IAutoHideable': {
      export: 'IAutoHideable',
      path: 'Blockly.IAutoHideable',
    },
    'Blockly.IBlockDragger': {
      export: 'IBlockDragger',
      path: 'Blockly.IBlockDragger',
    },
    'Blockly.IBoundedElement': {
      export: 'IBoundedElement',
      path: 'Blockly.IBoundedElement',
    },
    'Blockly.IBubble': {
      export: 'IBubble',
      path: 'Blockly.IBubble',
    },
    'Blockly.ICollapsibleToolboxItem': {
      export: 'ICollapsibleToolboxItem',
      path: 'Blockly.ICollapsibleToolboxItem',
    },
    'Blockly.IComponent': {
      export: 'IComponent',
      path: 'Blockly.IComponent',
    },
    'Blockly.IConnectionChecker': {
      export: 'IConnectionChecker',
      path: 'Blockly.IConnectionChecker',
    },
    'Blockly.IContextMenu': {
      export: 'IContextMenu',
      path: 'Blockly.IContextMenu',
    },
    'Blockly.ICopyable': {
      export: 'ICopyable',
      path: 'Blockly.ICopyable',
    },
    'Blockly.IDeletable': {
      export: 'IDeletable',
      path: 'Blockly.IDeletable',
    },
    'Blockly.IDeleteArea': {
      export: 'IDeleteArea',
      path: 'Blockly.IDeleteArea',
    },
    'Blockly.IDragTarget': {
      export: 'IDragTarget',
      path: 'Blockly.IDragTarget',
    },
    'Blockly.IDraggable': {
      export: 'IDraggable',
      path: 'Blockly.IDraggable',
    },
    'Blockly.IFlyout': {
      export: 'IFlyout',
      path: 'Blockly.IFlyout',
    },
    'Blockly.IKeyboardAccessible': {
      export: 'IKeyboardAccessible',
      path: 'Blockly.IKeyboardAccessible',
    },
    'Blockly.IMetricsManager': {
      export: 'IMetricsManager',
      path: 'Blockly.IMetricsManager',
    },
    'Blockly.IMovable': {
      export: 'IMovable',
      path: 'Blockly.IMovable',
    },
    'Blockly.IPositionable': {
      export: 'IPositionable',
      path: 'Blockly.IPositionable',
    },
    'Blockly.IRegistrable': {
      export: 'IRegistrable',
      path: 'Blockly.IRegistrable',
    },
    'Blockly.IRegistrableField': {
      export: 'IRegistrableField',
      path: 'Blockly.IRegistrableField',
    },
    'Blockly.ISelectable': {
      export: 'ISelectable',
      path: 'Blockly.ISelectable',
    },
    'Blockly.ISelectableToolboxItem': {
      export: 'ISelectableToolboxItem',
      path: 'Blockly.ISelectableToolboxItem',
    },
    'Blockly.IStyleable': {
      export: 'IStyleable',
      path: 'Blockly.IStyleable',
    },
    'Blockly.IToolbox': {
      export: 'IToolbox',
      path: 'Blockly.IToolbox',
    },
    'Blockly.IToolboxItem': {
      export: 'IToolboxItem',
      path: 'Blockly.IToolboxItem',
    },
    'Blockly.blockRendering.ConstantProvider': {
      export: 'ConstantProvider',
      path: 'Blockly.blockRendering.ConstantProvider',
    },
    'Blockly.blockRendering.Debug': {
      export: 'Debug',
      path: 'Blockly.blockRendering.Debug',
    },
    'Blockly.blockRendering.Drawer': {
      export: 'Drawer',
      path: 'Blockly.blockRendering.Drawer',
    },
    'Blockly.blockRendering.IPathObject': {
      export: 'IPathObject',
      path: 'Blockly.blockRendering.IPathObject',
    },
    'Blockly.blockRendering.RenderInfo': {
      export: 'RenderInfo',
      path: 'Blockly.blockRendering.RenderInfo',
    },
    'Blockly.blockRendering.MarkerSvg': {
      export: 'MarkerSvg',
      path: 'Blockly.blockRendering.MarkerSvg',
    },
    'Blockly.blockRendering.PathObject': {
      export: 'PathObject',
      path: 'Blockly.blockRendering.PathObject',
    },
    'Blockly.blockRendering.Renderer': {
      export: 'Renderer',
      path: 'Blockly.blockRendering.Renderer',
    },
    'Blockly.geras.InlineInput': {
      export: 'InlineInput',
      path: 'Blockly.geras.InlineInput',
    },
    'Blockly.geras.StatementInput': {
      export: 'StatementInput',
      path: 'Blockly.geras.StatementInput',
    },
    'Blockly.geras.ConstantProvider': {
      export: 'ConstantProvider',
      path: 'Blockly.geras.ConstantProvider',
    },
    'Blockly.geras.Drawer': {
      export: 'Drawer',
      path: 'Blockly.geras.Drawer',
    },
    'Blockly.geras.HighlightConstantProvider': {
      export: 'HighlightConstantProvider',
      path: 'Blockly.geras.HighlightConstantProvider',
    },
    'Blockly.geras.Highlighter': {
      export: 'Highlighter',
      path: 'Blockly.geras.Highlighter',
    },
    'Blockly.geras.RenderInfo': {
      export: 'RenderInfo',
      path: 'Blockly.geras.RenderInfo',
    },
    'Blockly.geras.PathObject': {
      export: 'PathObject',
      path: 'Blockly.geras.PathObject',
    },
    'Blockly.geras.Renderer': {
      export: 'Renderer',
      path: 'Blockly.geras.Renderer',
    },
    'Blockly.blockRendering.Measurable': {
      export: 'Measurable',
      path: 'Blockly.blockRendering.Measurable',
    },
    'Blockly.blockRendering.BottomRow': {
      export: 'BottomRow',
      path: 'Blockly.blockRendering.BottomRow',
    },
    'Blockly.blockRendering.Connection': {
      export: 'Connection',
      path: 'Blockly.blockRendering.Connection',
    },
    'Blockly.blockRendering.ExternalValueInput': {
      export: 'ExternalValueInput',
      path: 'Blockly.blockRendering.ExternalValueInput',
    },
    'Blockly.blockRendering.Field': {
      export: 'Field',
      path: 'Blockly.blockRendering.Field',
    },
    'Blockly.blockRendering.Hat': {
      export: 'Hat',
      path: 'Blockly.blockRendering.Hat',
    },
    'Blockly.blockRendering.Icon': {
      export: 'Icon',
      path: 'Blockly.blockRendering.Icon',
    },
    'Blockly.blockRendering.InRowSpacer': {
      export: 'InRowSpacer',
      path: 'Blockly.blockRendering.InRowSpacer',
    },
    'Blockly.blockRendering.InlineInput': {
      export: 'InlineInput',
      path: 'Blockly.blockRendering.InlineInput',
    },
    'Blockly.blockRendering.InputConnection': {
      export: 'InputConnection',
      path: 'Blockly.blockRendering.InputConnection',
    },
    'Blockly.blockRendering.InputRow': {
      export: 'InputRow',
      path: 'Blockly.blockRendering.InputRow',
    },
    'Blockly.blockRendering.JaggedEdge': {
      export: 'JaggedEdge',
      path: 'Blockly.blockRendering.JaggedEdge',
    },
    'Blockly.blockRendering.NextConnection': {
      export: 'NextConnection',
      path: 'Blockly.blockRendering.NextConnection',
    },
    'Blockly.blockRendering.OutputConnection': {
      export: 'OutputConnection',
      path: 'Blockly.blockRendering.OutputConnection',
    },
    'Blockly.blockRendering.PreviousConnection': {
      export: 'PreviousConnection',
      path: 'Blockly.blockRendering.PreviousConnection',
    },
    'Blockly.blockRendering.RoundCorner': {
      export: 'RoundCorner',
      path: 'Blockly.blockRendering.RoundCorner',
    },
    'Blockly.blockRendering.Row': {
      export: 'Row',
      path: 'Blockly.blockRendering.Row',
    },
    'Blockly.blockRendering.SpacerRow': {
      export: 'SpacerRow',
      path: 'Blockly.blockRendering.SpacerRow',
    },
    'Blockly.blockRendering.SquareCorner': {
      export: 'SquareCorner',
      path: 'Blockly.blockRendering.SquareCorner',
    },
    'Blockly.blockRendering.StatementInput': {
      export: 'StatementInput',
      path: 'Blockly.blockRendering.StatementInput',
    },
    'Blockly.blockRendering.TopRow': {
      export: 'TopRow',
      path: 'Blockly.blockRendering.TopRow',
    },
    'Blockly.blockRendering.Types': {
      export: 'Types',
      path: 'Blockly.blockRendering.Types',
    },
    'Blockly.minimalist.ConstantProvider': {
      export: 'ConstantProvider',
      path: 'Blockly.minimalist.ConstantProvider',
    },
    'Blockly.minimalist.Drawer': {
      export: 'Drawer',
      path: 'Blockly.minimalist.Drawer',
    },
    'Blockly.minimalist.RenderInfo': {
      export: 'RenderInfo',
      path: 'Blockly.minimalist.RenderInfo',
    },
    'Blockly.minimalist.Renderer': {
      export: 'Renderer',
      path: 'Blockly.minimalist.Renderer',
    },
    'Blockly.thrasos.RenderInfo': {
      export: 'RenderInfo',
      path: 'Blockly.thrasos.RenderInfo',
    },
    'Blockly.thrasos.Renderer': {
      export: 'Renderer',
      path: 'Blockly.thrasos.Renderer',
    },
    'Blockly.zelos.BottomRow': {
      export: 'BottomRow',
      path: 'Blockly.zelos.BottomRow',
    },
    'Blockly.zelos.StatementInput': {
      export: 'StatementInput',
      path: 'Blockly.zelos.StatementInput',
    },
    'Blockly.zelos.RightConnectionShape': {
      export: 'RightConnectionShape',
      path: 'Blockly.zelos.RightConnectionShape',
    },
    'Blockly.zelos.TopRow': {
      export: 'TopRow',
      path: 'Blockly.zelos.TopRow',
    },
    'Blockly.zelos.ConstantProvider': {
      export: 'ConstantProvider',
      path: 'Blockly.zelos.ConstantProvider',
    },
    'Blockly.zelos.Drawer': {
      export: 'Drawer',
      path: 'Blockly.zelos.Drawer',
    },
    'Blockly.zelos.RenderInfo': {
      export: 'RenderInfo',
      path: 'Blockly.zelos.RenderInfo',
    },
    'Blockly.zelos.MarkerSvg': {
      export: 'MarkerSvg',
      path: 'Blockly.zelos.MarkerSvg',
    },
    'Blockly.zelos.PathObject': {
      export: 'PathObject',
      path: 'Blockly.zelos.PathObject',
    },
    'Blockly.zelos.Renderer': {
      export: 'Renderer',
      path: 'Blockly.zelos.Renderer',
    },
    'Blockly.Themes.Classic': {
      export: 'Classic',
      path: 'Blockly.Themes.Classic',
    },
    'Blockly.Themes.Zelos': {
      export: 'Zelos',
      path: 'Blockly.Themes.Zelos',
    },
    'Blockly.ToolboxCategory': {
      export: 'ToolboxCategory',
      path: 'Blockly.ToolboxCategory',
    },
    'Blockly.CollapsibleToolboxCategory': {
      export: 'CollapsibleToolboxCategory',
      path: 'Blockly.CollapsibleToolboxCategory',
    },
    'Blockly.ToolboxSeparator': {
      export: 'ToolboxSeparator',
      path: 'Blockly.ToolboxSeparator',
    },
    'Blockly.Toolbox': {
      export: 'Toolbox',
      path: 'Blockly.Toolbox',
    },
    'Blockly.ToolboxItem': {
      export: 'ToolboxItem',
      path: 'Blockly.ToolboxItem',
    },
    'Blockly.utils.Coordinate': {
      export: 'Coordinate',
      path: 'Blockly.utils.Coordinate',
    },
    'Blockly.utils.KeyCodes': {
      export: 'KeyCodes',
      path: 'Blockly.utils.KeyCodes',
    },
    'Blockly.utils.Metrics': {
      export: 'Metrics',
      path: 'Blockly.utils.Metrics',
    },
    'Blockly.utils.Rect': {
      export: 'Rect',
      path: 'Blockly.utils.Rect',
    },
    'Blockly.utils.Size': {
      export: 'Size',
      path: 'Blockly.utils.Size',
    },
    'Blockly.utils.Svg': {
      export: 'Svg',
      path: 'Blockly.utils.Svg',
    },
    'Blockly.BlocklyOptions': {
      export: 'BlocklyOptions',
      path: 'Blockly.BlocklyOptions',
    },
    'Blockly.Bubble': {
      export: 'Bubble',
      path: 'Blockly.Bubble',
    },
    'Blockly.BubbleDragger': {
      export: 'BubbleDragger',
      path: 'Blockly.BubbleDragger',
    },
    'Blockly.Comment': {
      export: 'Comment',
      path: 'Blockly.Comment',
    },
    'Blockly.ComponentManager': {
      export: 'ComponentManager',
      path: 'Blockly.ComponentManager',
    },
    'Blockly.Connection': {
      export: 'Connection',
      path: 'Blockly.Connection',
    },
    'Blockly.ConnectionChecker': {
      export: 'ConnectionChecker',
      path: 'Blockly.ConnectionChecker',
    },
    'Blockly.ConnectionDB': {
      export: 'ConnectionDB',
      path: 'Blockly.ConnectionDB',
    },
    'Blockly.ContextMenuRegistry': {
      export: 'ContextMenuRegistry',
      path: 'Blockly.ContextMenuRegistry',
    },
    'Blockly.DeleteArea': {
      export: 'DeleteArea',
      path: 'Blockly.DeleteArea',
    },
    'Blockly.DragTarget': {
      export: 'DragTarget',
      path: 'Blockly.DragTarget',
    },
    'Blockly.DropDownDiv': {
      export: 'DropDownDiv',
      path: 'Blockly.DropDownDiv',
    },
    'Blockly.Field': {
      export: 'Field',
      path: 'Blockly.Field',
    },
    'Blockly.FieldAngle': {
      export: 'FieldAngle',
      path: 'Blockly.FieldAngle',
    },
    'Blockly.FieldCheckbox': {
      export: 'FieldCheckbox',
      path: 'Blockly.FieldCheckbox',
    },
    'Blockly.FieldColour': {
      export: 'FieldColour',
      path: 'Blockly.FieldColour',
    },
    'Blockly.FieldDropdown': {
      export: 'FieldDropdown',
      path: 'Blockly.FieldDropdown',
    },
    'Blockly.FieldImage': {
      export: 'FieldImage',
      path: 'Blockly.FieldImage',
    },
    'Blockly.FieldLabel': {
      export: 'FieldLabel',
      path: 'Blockly.FieldLabel',
    },
    'Blockly.FieldLabelSerializable': {
      export: 'FieldLabelSerializable',
      path: 'Blockly.FieldLabelSerializable',
    },
    'Blockly.FieldMultilineInput': {
      export: 'FieldMultilineInput',
      path: 'Blockly.FieldMultilineInput',
    },
    'Blockly.FieldNumber': {
      export: 'FieldNumber',
      path: 'Blockly.FieldNumber',
    },
    'Blockly.FieldTextInput': {
      export: 'FieldTextInput',
      path: 'Blockly.FieldTextInput',
    },
    'Blockly.FieldVariable': {
      export: 'FieldVariable',
      path: 'Blockly.FieldVariable',
    },
    'Blockly.Flyout': {
      export: 'Flyout',
      path: 'Blockly.Flyout',
    },
    'Blockly.FlyoutButton': {
      export: 'FlyoutButton',
      path: 'Blockly.FlyoutButton',
    },
    'Blockly.HorizontalFlyout': {
      export: 'HorizontalFlyout',
      path: 'Blockly.HorizontalFlyout',
    },
    'Blockly.FlyoutMetricsManager': {
      export: 'FlyoutMetricsManager',
      path: 'Blockly.FlyoutMetricsManager',
    },
    'Blockly.VerticalFlyout': {
      export: 'VerticalFlyout',
      path: 'Blockly.VerticalFlyout',
    },
    'Blockly.Generator': {
      export: 'Generator',
      path: 'Blockly.Generator',
    },
    'Blockly.Gesture': {
      export: 'Gesture',
      path: 'Blockly.Gesture',
    },
    'Blockly.Grid': {
      export: 'Grid',
      path: 'Blockly.Grid',
    },
    'Blockly.Icon': {
      export: 'Icon',
      path: 'Blockly.Icon',
    },
    'Blockly.inject': {
      export: 'inject',
      path: 'Blockly.inject',
    },
    'Blockly.Input': {
      export: 'Input',
      path: 'Blockly.Input',
    },
    'Blockly.inputTypes': {
      export: 'inputTypes',
      path: 'Blockly.inputTypes',
    },
    'Blockly.InsertionMarkerManager': {
      export: 'InsertionMarkerManager',
      path: 'Blockly.InsertionMarkerManager',
    },
    'Blockly.MarkerManager': {
      export: 'MarkerManager',
      path: 'Blockly.MarkerManager',
    },
    'Blockly.Menu': {
      export: 'Menu',
      path: 'Blockly.Menu',
    },
    'Blockly.MenuItem': {
      export: 'MenuItem',
      path: 'Blockly.MenuItem',
    },
    'Blockly.MetricsManager': {
      export: 'MetricsManager',
      path: 'Blockly.MetricsManager',
    },
    'Blockly.Msg': {
      export: 'Msg',
      path: 'Blockly.Msg',
    },
    'Blockly.Mutator': {
      export: 'Mutator',
      path: 'Blockly.Mutator',
    },
    'Blockly.Names': {
      export: 'Names',
      path: 'Blockly.Names',
    },
    'Blockly.Options': {
      export: 'Options',
      path: 'Blockly.Options',
    },
    'Blockly.RenderedConnection': {
      export: 'RenderedConnection',
      path: 'Blockly.RenderedConnection',
    },
    'Blockly.Scrollbar': {
      export: 'Scrollbar',
      path: 'Blockly.Scrollbar',
    },
    'Blockly.ScrollbarPair': {
      export: 'ScrollbarPair',
      path: 'Blockly.ScrollbarPair',
    },
    'Blockly.ShortcutRegistry': {
      export: 'ShortcutRegistry',
      path: 'Blockly.ShortcutRegistry',
    },
    'Blockly.Theme': {
      export: 'Theme',
      path: 'Blockly.Theme',
    },
    'Blockly.ThemeManager': {
      export: 'ThemeManager',
      path: 'Blockly.ThemeManager',
    },
    'Blockly.TouchGesture': {
      export: 'TouchGesture',
      path: 'Blockly.TouchGesture',
    },
    'Blockly.Trashcan': {
      export: 'Trashcan',
      path: 'Blockly.Trashcan',
    },
    'Blockly.VariableMap': {
      export: 'VariableMap',
      path: 'Blockly.VariableMap',
    },
    'Blockly.VariableModel': {
      export: 'VariableModel',
      path: 'Blockly.VariableModel',
    },
    'Blockly.Warning': {
      export: 'Warning',
      path: 'Blockly.Warning',
    },
    'Blockly.Workspace': {
      export: 'Workspace',
      path: 'Blockly.Workspace',
    },
    'Blockly.WorkspaceAudio': {
      export: 'WorkspaceAudio',
      path: 'Blockly.WorkspaceAudio',
    },
    'Blockly.WorkspaceComment': {
      export: 'WorkspaceComment',
      path: 'Blockly.WorkspaceComment',
    },
    'Blockly.WorkspaceCommentSvg': {
      export: 'WorkspaceCommentSvg',
      path: 'Blockly.WorkspaceCommentSvg',
    },
    'Blockly.WorkspaceDragSurfaceSvg': {
      export: 'WorkspaceDragSurfaceSvg',
      path: 'Blockly.WorkspaceDragSurfaceSvg',
    },
    'Blockly.WorkspaceDragger': {
      export: 'WorkspaceDragger',
      path: 'Blockly.WorkspaceDragger',
    },
    'Blockly.WorkspaceSvg': {
      export: 'WorkspaceSvg',
      path: 'Blockly.WorkspaceSvg',
    },
    'Blockly.ZoomControls': {
      export: 'ZoomControls',
      path: 'Blockly.ZoomControls',
    },
    'Blockly': {
      exports: {
        svgSize: {module: 'Blockly.utils.svgMath'},
        resizeSvgContents: {module: 'Blockly.WorkspaecSvg'},
        defineBlocksWithJsonArray: {module: 'Blockly.common'},
        isNumber: {module: 'Blockly.utils.string'},
      },
    },
  },
};

exports.renamings = renamings;
