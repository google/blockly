/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Functions for injecting Blockly into a web page.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.inject');

goog.require('Blockly.BlockDragSurfaceSvg');
goog.require('Blockly.Component');
goog.require('Blockly.Css');
goog.require('Blockly.DropDownDiv');
goog.require('Blockly.Events');
goog.require('Blockly.Grid');
goog.require('Blockly.Msg');
goog.require('Blockly.Options');
goog.require('Blockly.ScrollbarPair');
goog.require('Blockly.Tooltip');
goog.require('Blockly.user.keyMap');
goog.require('Blockly.utils');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.userAgent');
goog.require('Blockly.WorkspaceDragSurfaceSvg');
goog.require('Blockly.WorkspaceSvg');

goog.requireType('Blockly.utils.Metrics');


/**
 * Inject a Blockly editor into the specified container element (usually a div).
 * @param {Element|string} container Containing element, or its ID,
 *     or a CSS selector.
 * @param {Blockly.BlocklyOptions=} opt_options Optional dictionary of options.
 * @return {!Blockly.WorkspaceSvg} Newly created main workspace.
 */
Blockly.inject = function(container, opt_options) {
  Blockly.checkBlockColourConstants();

  if (typeof container == 'string') {
    container = document.getElementById(container) ||
        document.querySelector(container);
  }
  // Verify that the container is in document.
  if (!container || !Blockly.utils.dom.containsNode(document, container)) {
    throw Error('Error: container is not in current document.');
  }
  var options = new Blockly.Options(opt_options ||
    (/** @type {!Blockly.BlocklyOptions} */ ({})));
  var subContainer = document.createElement('div');
  subContainer.className = 'injectionDiv';
  subContainer.tabIndex = 0;
  Blockly.utils.aria.setState(subContainer,
      Blockly.utils.aria.State.LABEL, Blockly.Msg['WORKSPACE_ARIA_LABEL']);

  container.appendChild(subContainer);
  var svg = Blockly.createDom_(subContainer, options);

  // Create surfaces for dragging things. These are optimizations
  // so that the browser does not repaint during the drag.
  var blockDragSurface = new Blockly.BlockDragSurfaceSvg(subContainer);
  var workspaceDragSurface = new Blockly.WorkspaceDragSurfaceSvg(subContainer);

  var workspace = Blockly.createMainWorkspace_(svg, options, blockDragSurface,
      workspaceDragSurface);
  Blockly.user.keyMap.setKeyMap(options.keyMap);

  Blockly.init_(workspace);

  // Keep focus on the first workspace so entering keyboard navigation looks correct.
  Blockly.mainWorkspace = workspace;

  Blockly.svgResize(workspace);

  subContainer.addEventListener('focusin', function() {
    Blockly.mainWorkspace = workspace;
  });

  return workspace;
};

/**
 * Create the SVG image.
 * @param {!Element} container Containing element.
 * @param {!Blockly.Options} options Dictionary of options.
 * @return {!Element} Newly created SVG image.
 * @private
 */
Blockly.createDom_ = function(container, options) {
  // Sadly browsers (Chrome vs Firefox) are currently inconsistent in laying
  // out content in RTL mode.  Therefore Blockly forces the use of LTR,
  // then manually positions content in RTL as needed.
  container.setAttribute('dir', 'LTR');
  // Set the default direction for Components to use.
  Blockly.Component.defaultRightToLeft = options.RTL;

  // Load CSS.
  Blockly.Css.inject(options.hasCss, options.pathToMedia);

  // Build the SVG DOM.
  /*
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:html="http://www.w3.org/1999/xhtml"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    version="1.1"
    class="blocklySvg">
    ...
  </svg>
  */
  var svg = Blockly.utils.dom.createSvgElement('svg', {
    'xmlns': Blockly.utils.dom.SVG_NS,
    'xmlns:html': Blockly.utils.dom.HTML_NS,
    'xmlns:xlink': Blockly.utils.dom.XLINK_NS,
    'version': '1.1',
    'class': 'blocklySvg',
    'tabindex': '0'
  }, container);
  /*
  <defs>
    ... filters go here ...
  </defs>
  */
  var defs = Blockly.utils.dom.createSvgElement('defs', {}, svg);
  // Each filter/pattern needs a unique ID for the case of multiple Blockly
  // instances on a page.  Browser behaviour becomes undefined otherwise.
  // https://neil.fraser.name/news/2015/11/01/
  var rnd = String(Math.random()).substring(2);

  options.gridPattern = Blockly.Grid.createDom(rnd, options.gridOptions, defs);
  return svg;
};

/**
 * Create a main workspace and add it to the SVG.
 * @param {!Element} svg SVG element with pattern defined.
 * @param {!Blockly.Options} options Dictionary of options.
 * @param {!Blockly.BlockDragSurfaceSvg} blockDragSurface Drag surface SVG
 *     for the blocks.
 * @param {!Blockly.WorkspaceDragSurfaceSvg} workspaceDragSurface Drag surface
 *     SVG for the workspace.
 * @return {!Blockly.WorkspaceSvg} Newly created main workspace.
 * @private
 */
Blockly.createMainWorkspace_ = function(svg, options, blockDragSurface,
    workspaceDragSurface) {
  options.parentWorkspace = null;
  var mainWorkspace =
      new Blockly.WorkspaceSvg(options, blockDragSurface, workspaceDragSurface);
  var wsOptions = mainWorkspace.options;
  mainWorkspace.scale = wsOptions.zoomOptions.startScale;
  svg.appendChild(mainWorkspace.createDom('blocklyMainBackground'));

  // Set the theme name and renderer name onto the injection div.
  Blockly.utils.dom.addClass(mainWorkspace.getInjectionDiv(),
      mainWorkspace.getRenderer().getClassName());
  Blockly.utils.dom.addClass(mainWorkspace.getInjectionDiv(),
      mainWorkspace.getTheme().getClassName());

  if (!wsOptions.hasCategories && wsOptions.languageTree) {
    // Add flyout as an <svg> that is a sibling of the workspace svg.
    var flyout = mainWorkspace.addFlyout('svg');
    Blockly.utils.dom.insertAfter(flyout, svg);
  }
  if (wsOptions.hasTrashcan) {
    mainWorkspace.addTrashcan();
  }
  if (wsOptions.zoomOptions && wsOptions.zoomOptions.controls) {
    mainWorkspace.addZoomControls();
  }
  // Register the workspace svg as a UI component.
  mainWorkspace.getThemeManager().subscribe(svg, 'workspaceBackgroundColour',
      'background-color');

  // A null translation will also apply the correct initial scale.
  mainWorkspace.translate(0, 0);

  if (!wsOptions.readOnly && !mainWorkspace.isMovable()) {
    // Helper function for the workspaceChanged callback.
    // TODO (#2300): Move metrics math back to the WorkspaceSvg.
    var getWorkspaceMetrics = function() {
      var workspaceMetrics = Object.create(null);
      var defaultMetrics = mainWorkspace.getMetrics();
      var scale = mainWorkspace.scale;

      workspaceMetrics.RTL = mainWorkspace.RTL;

      // Get the view metrics in workspace units.
      workspaceMetrics.viewLeft = defaultMetrics.viewLeft / scale;
      workspaceMetrics.viewTop = defaultMetrics.viewTop / scale;
      workspaceMetrics.viewRight =
          (defaultMetrics.viewLeft + defaultMetrics.viewWidth) / scale;
      workspaceMetrics.viewBottom =
          (defaultMetrics.viewTop + defaultMetrics.viewHeight) / scale;

      // Get the exact content metrics (in workspace units), even if the
      // content is bounded.
      if (mainWorkspace.isContentBounded()) {
        // Already in workspace units, no need to divide by scale.
        var blocksBoundingBox = mainWorkspace.getBlocksBoundingBox();
        workspaceMetrics.contentLeft = blocksBoundingBox.left;
        workspaceMetrics.contentTop = blocksBoundingBox.top;
        workspaceMetrics.contentRight = blocksBoundingBox.right;
        workspaceMetrics.contentBottom = blocksBoundingBox.bottom;
      } else {
        workspaceMetrics.contentLeft = defaultMetrics.contentLeft / scale;
        workspaceMetrics.contentTop = defaultMetrics.contentTop / scale;
        workspaceMetrics.contentRight =
            (defaultMetrics.contentLeft + defaultMetrics.contentWidth) / scale;
        workspaceMetrics.contentBottom =
            (defaultMetrics.contentTop + defaultMetrics.contentHeight) / scale;
      }

      return workspaceMetrics;
    };

    var getObjectMetrics = function(object) {
      var objectMetrics = object.getBoundingRectangle();
      objectMetrics.height = objectMetrics.bottom - objectMetrics.top;
      objectMetrics.width = objectMetrics.right - objectMetrics.left;
      return objectMetrics;
    };

    var bumpObjects = function(e) {
      // We always check isMovable_ again because the original
      // "not movable" state of isMovable_ could have been changed.
      if (!mainWorkspace.isDragging() && !mainWorkspace.isMovable() &&
          (Blockly.Events.BUMP_EVENTS.indexOf(e.type) != -1)) {
        var metrics = getWorkspaceMetrics();
        if (metrics.contentTop < metrics.viewTop ||
            metrics.contentBottom > metrics.viewBottom ||
            metrics.contentLeft < metrics.viewLeft ||
            metrics.contentRight > metrics.viewRight) {

          // Handle undo.
          var oldGroup = null;
          if (e) {
            oldGroup = Blockly.Events.getGroup();
            Blockly.Events.setGroup(e.group);
          }

          switch (e.type) {
            case Blockly.Events.BLOCK_CREATE:
            case Blockly.Events.BLOCK_MOVE:
              var object = mainWorkspace.getBlockById(e.blockId);
              if (object) {
                object = object.getRootBlock();
              }
              break;
            case Blockly.Events.COMMENT_CREATE:
            case Blockly.Events.COMMENT_MOVE:
              var object = mainWorkspace.getCommentById(e.commentId);
              break;
          }
          if (object) {
            var objectMetrics = getObjectMetrics(object);

            // The idea is to find the region of valid coordinates for the top
            // left corner of the object, and then clamp the object's
            // top left corner within that region.

            // The top of the object should always be at or below the top of
            // the workspace.
            var topClamp = metrics.viewTop;
            // The top of the object should ideally be positioned so that
            // the bottom of the object is not below the bottom of the
            // workspace.
            var bottomClamp = metrics.viewBottom - objectMetrics.height;
            // If the object is taller than the workspace we want to
            // top-align the block, which means setting the bottom clamp to
            // match.
            bottomClamp = Math.max(topClamp, bottomClamp);

            var newYPosition = Blockly.utils.math.clamp(
                topClamp, objectMetrics.top, bottomClamp);
            var deltaY = newYPosition - objectMetrics.top;

            // Note: Even in RTL mode the "anchor" of the object is the
            // top-left corner of the object.

            // The left edge of the object should ideally be positioned at
            // or to the right of the left edge of the workspace.
            var leftClamp = metrics.viewLeft;
            // The left edge of the object should ideally be positioned so
            // that the right of the object is not outside the workspace bounds.
            var rightClamp = metrics.viewRight - objectMetrics.width;
            if (metrics.RTL) {
              // If the object is wider than the workspace and we're in RTL
              // mode we want to right-align the block, which means setting
              // the left clamp to match.
              leftClamp = Math.min(rightClamp, leftClamp);
            } else {
              // If the object is wider than the workspace and we're in LTR
              // mode we want to left-align the block, which means setting
              // the right clamp to match.
              rightClamp = Math.max(leftClamp, rightClamp);
            }

            var newXPosition = Blockly.utils.math.clamp(
                leftClamp, objectMetrics.left, rightClamp);
            var deltaX = newXPosition - objectMetrics.left;

            object.moveBy(deltaX, deltaY);
          }
          if (e) {
            if (!e.group && object) {
              console.log('WARNING: Moved object in bounds but there was no' +
                  ' event group. This may break undo.');
            }
            if (oldGroup !== null) {
              Blockly.Events.setGroup(oldGroup);
            }
          }
        }
      }
    };
    mainWorkspace.addChangeListener(bumpObjects);
  }

  // The SVG is now fully assembled.
  Blockly.svgResize(mainWorkspace);
  Blockly.WidgetDiv.createDom();
  Blockly.DropDownDiv.createDom();
  Blockly.Tooltip.createDom();
  return mainWorkspace;
};

/**
 * Initialize Blockly with various handlers.
 * @param {!Blockly.WorkspaceSvg} mainWorkspace Newly created main workspace.
 * @private
 */
Blockly.init_ = function(mainWorkspace) {
  var options = mainWorkspace.options;
  var svg = mainWorkspace.getParentSvg();

  // Suppress the browser's context menu.
  Blockly.bindEventWithChecks_(
      /** @type {!Element} */ (svg.parentNode), 'contextmenu', null,
      function(e) {
        if (!Blockly.utils.isTargetInput(e)) {
          e.preventDefault();
        }
      });

  var workspaceResizeHandler = Blockly.bindEventWithChecks_(window, 'resize',
      null,
      function() {
        Blockly.hideChaff(true);
        Blockly.svgResize(mainWorkspace);
      });
  mainWorkspace.setResizeHandlerWrapper(workspaceResizeHandler);

  Blockly.inject.bindDocumentEvents_();

  if (options.languageTree) {
    var toolbox = mainWorkspace.getToolbox();
    var flyout = mainWorkspace.getFlyout(true);
    if (toolbox) {
      toolbox.init();
    } else if (flyout) {
      // Build a fixed flyout with the root blocks.
      flyout.init(mainWorkspace);
      flyout.show(options.languageTree);
      flyout.scrollToStart();
    }
  }

  var verticalSpacing = Blockly.Scrollbar.scrollbarThickness;
  if (options.hasTrashcan) {
    verticalSpacing = mainWorkspace.trashcan.init(verticalSpacing);
  }
  if (options.zoomOptions && options.zoomOptions.controls) {
    mainWorkspace.zoomControls_.init(verticalSpacing);
  }

  if (options.moveOptions && options.moveOptions.scrollbars) {
    mainWorkspace.scrollbar = new Blockly.ScrollbarPair(mainWorkspace);
    mainWorkspace.scrollbar.resize();
  } else {
    mainWorkspace.setMetrics({x: 0.5, y: 0.5});
  }

  // Load the sounds.
  if (options.hasSounds) {
    Blockly.inject.loadSounds_(options.pathToMedia, mainWorkspace);
  }
};

/**
 * Bind document events, but only once.  Destroying and reinjecting Blockly
 * should not bind again.
 * Bind events for scrolling the workspace.
 * Most of these events should be bound to the SVG's surface.
 * However, 'mouseup' has to be on the whole document so that a block dragged
 * out of bounds and released will know that it has been released.
 * Also, 'keydown' has to be on the whole document since the browser doesn't
 * understand a concept of focus on the SVG image.
 * @private
 */
Blockly.inject.bindDocumentEvents_ = function() {
  if (!Blockly.documentEventsBound_) {
    Blockly.bindEventWithChecks_(document, 'scroll', null, function() {
      var workspaces = Blockly.Workspace.getAll();
      for (var i = 0, workspace; (workspace = workspaces[i]); i++) {
        if (workspace.updateInverseScreenCTM) {
          workspace.updateInverseScreenCTM();
        }
      }
    });
    Blockly.bindEventWithChecks_(document, 'keydown', null, Blockly.onKeyDown);
    // longStop needs to run to stop the context menu from showing up.  It
    // should run regardless of what other touch event handlers have run.
    Blockly.bindEvent_(document, 'touchend', null, Blockly.longStop_);
    Blockly.bindEvent_(document, 'touchcancel', null, Blockly.longStop_);
    // Some iPad versions don't fire resize after portrait to landscape change.
    if (Blockly.utils.userAgent.IPAD) {
      Blockly.bindEventWithChecks_(window, 'orientationchange', document,
          function() {
            // TODO (#397): Fix for multiple Blockly workspaces.
            Blockly.svgResize(/** @type {!Blockly.WorkspaceSvg} */
                (Blockly.getMainWorkspace()));
          });
    }
  }
  Blockly.documentEventsBound_ = true;
};

/**
 * Load sounds for the given workspace.
 * @param {string} pathToMedia The path to the media directory.
 * @param {!Blockly.Workspace} workspace The workspace to load sounds for.
 * @private
 */
Blockly.inject.loadSounds_ = function(pathToMedia, workspace) {
  var audioMgr = workspace.getAudioManager();
  audioMgr.load(
      [
        pathToMedia + 'click.mp3',
        pathToMedia + 'click.wav',
        pathToMedia + 'click.ogg'
      ], 'click');
  audioMgr.load(
      [
        pathToMedia + 'disconnect.wav',
        pathToMedia + 'disconnect.mp3',
        pathToMedia + 'disconnect.ogg'
      ], 'disconnect');
  audioMgr.load(
      [
        pathToMedia + 'delete.mp3',
        pathToMedia + 'delete.ogg',
        pathToMedia + 'delete.wav'
      ], 'delete');

  // Bind temporary hooks that preload the sounds.
  var soundBinds = [];
  var unbindSounds = function() {
    while (soundBinds.length) {
      Blockly.unbindEvent_(soundBinds.pop());
    }
    audioMgr.preload();
  };

  // These are bound on mouse/touch events with Blockly.bindEventWithChecks_, so
  // they restrict the touch identifier that will be recognized.  But this is
  // really something that happens on a click, not a drag, so that's not
  // necessary.

  // Android ignores any sound not loaded as a result of a user action.
  soundBinds.push(
      Blockly.bindEventWithChecks_(document, 'mousemove', null, unbindSounds,
          true));
  soundBinds.push(
      Blockly.bindEventWithChecks_(document, 'touchstart', null, unbindSounds,
          true));
};
