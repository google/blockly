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
goog.require('Blockly.browserEvents');
goog.require('Blockly.Css');
goog.require('Blockly.DropDownDiv');
goog.require('Blockly.Events');
goog.require('Blockly.Grid');
goog.require('Blockly.Msg');
goog.require('Blockly.Options');
goog.require('Blockly.ScrollbarPair');
goog.require('Blockly.Tooltip');
goog.require('Blockly.utils');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.math');
goog.require('Blockly.utils.Svg');
goog.require('Blockly.utils.userAgent');
goog.require('Blockly.Workspace');
goog.require('Blockly.WorkspaceDragSurfaceSvg');
goog.require('Blockly.WorkspaceSvg');
goog.require('Blockly.WidgetDiv');

goog.requireType('Blockly.BlockSvg');


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
  var svg = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.SVG, {
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
  var defs = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.DEFS, {}, svg);
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
    // Add flyout as an <svg> that is a sibling of the workspace SVG.
    var flyout = mainWorkspace.addFlyout(Blockly.utils.Svg.SVG);
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

  mainWorkspace.addChangeListener(Blockly.bumpIntoBoundsHandler_(mainWorkspace));

  // The SVG is now fully assembled.
  Blockly.svgResize(mainWorkspace);
  Blockly.WidgetDiv.createDom();
  Blockly.DropDownDiv.createDom();
  Blockly.Tooltip.createDom();
  return mainWorkspace;
};

/**
 * Extracts the object from the given event.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace the event originated
 *    from.
 * @param {!Blockly.Events.BumpEvent} e An event containing an object.
 * @return {?Blockly.BlockSvg|?Blockly.WorkspaceCommentSvg} The extracted
 *    object.
 * @private
 */
Blockly.extractObjectFromEvent_ = function(workspace, e) {
  var object = null;
  switch (e.type) {
    case Blockly.Events.BLOCK_CREATE:
    case Blockly.Events.BLOCK_MOVE:
      object = workspace.getBlockById(e.blockId);
      if (object) {
        object = object.getRootBlock();
      }
      break;
    case Blockly.Events.COMMENT_CREATE:
    case Blockly.Events.COMMENT_MOVE:
      object = workspace.getCommentById(e.commentId);
      break;
  }
  return object;
};

/**
 * Bumps the top objects in the given workspace into bounds.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace.
 * @private
 */
Blockly.bumpTopObjectsIntoBounds_ = function(workspace) {
  var metricsManager = workspace.getMetricsManager();
  if (!metricsManager.hasFixedEdges() || workspace.isDragging()) {
    return;
  }

  var scrollMetricsInWsCoords = metricsManager.getScrollMetrics(true);
  var topBlocks = workspace.getTopBoundedElements();
  for (var i = 0, block; (block = topBlocks[i]); i++) {
    Blockly.bumpObjectIntoBounds_(workspace, scrollMetricsInWsCoords, block);
  }
};

/**
 * Creates a handler for bumping objects when they cross fixed bounds.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to handle.
 * @return {function(Blockly.Events.Abstract)} The event handler.
 * @private
 */
Blockly.bumpIntoBoundsHandler_ = function(workspace) {
  return function(e) {
    var metricsManager = workspace.getMetricsManager();
    if (!metricsManager.hasFixedEdges() || workspace.isDragging()) {
      return;
    }

    if (Blockly.Events.BUMP_EVENTS.indexOf(e.type) !== -1) {
      var scrollMetricsInWsCoords = metricsManager.getScrollMetrics(true);

      // Triggered by move/create event
      var object = Blockly.extractObjectFromEvent_(workspace, e);
      if (!object) {
        return;
      }
      // Handle undo.
      var oldGroup = Blockly.Events.getGroup();
      Blockly.Events.setGroup(e.group);

      var wasBumped = Blockly.bumpObjectIntoBounds_(
          workspace, scrollMetricsInWsCoords,
          /** @type {!Blockly.IBoundedElement} */ (object));

      if (wasBumped && !e.group) {
        console.warn('Moved object in bounds but there was no' +
            ' event group. This may break undo.');
      }
      if (oldGroup !== null) {
        Blockly.Events.setGroup(oldGroup);
      }
    } else if (e.type === Blockly.Events.VIEWPORT_CHANGE) {
      var viewportEvent = /** @type {!Blockly.Events.ViewportChange} */ (e);
      if (viewportEvent.scale > viewportEvent.oldScale) {
        Blockly.bumpTopObjectsIntoBounds_(workspace);
      }
    }
  };
};

/**
 * Bumps the given object that has passed out of bounds.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace containing the object.
 * @param {!Blockly.MetricsManager.ContainerRegion} scrollMetrics Scroll metrics
 *    in workspace coordinates.
 * @param {!Blockly.IBoundedElement} object The object to bump.
 * @return {boolean} True if block was bumped.
 * @package
 */
Blockly.bumpObjectIntoBounds_ = function(workspace, scrollMetrics, object) {
  // Compute new top/left position for object.
  var objectMetrics = object.getBoundingRectangle();
  var height = objectMetrics.bottom - objectMetrics.top;
  var width = objectMetrics.right - objectMetrics.left;

  var topClamp = scrollMetrics.top;
  var scrollMetricsBottom = scrollMetrics.top + scrollMetrics.height;
  var bottomClamp = scrollMetricsBottom - height;
  // If the object is taller than the workspace we want to
  // top-align the block
  var newYPosition =
      Blockly.utils.math.clamp(topClamp, objectMetrics.top, bottomClamp);
  var deltaY = newYPosition - objectMetrics.top;

  // Note: Even in RTL mode the "anchor" of the object is the
  // top-left corner of the object.
  var leftClamp = scrollMetrics.left;
  var scrollMetricsRight = scrollMetrics.left + scrollMetrics.width;
  var rightClamp = scrollMetricsRight - width;
  if (workspace.RTL) {
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
  var newXPosition =
      Blockly.utils.math.clamp(leftClamp, objectMetrics.left, rightClamp);
  var deltaX = newXPosition - objectMetrics.left;

  if (deltaX || deltaY) {
    object.moveBy(deltaX, deltaY);
    return true;
  }
  return false;
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
  Blockly.browserEvents.conditionalBind(
      /** @type {!Element} */ (svg.parentNode), 'contextmenu', null,
      function(e) {
        if (!Blockly.utils.isTargetInput(e)) {
          e.preventDefault();
        }
      });

  var workspaceResizeHandler =
      Blockly.browserEvents.conditionalBind(window, 'resize', null, function() {
        Blockly.hideChaff(true);
        Blockly.svgResize(mainWorkspace);
        Blockly.bumpTopObjectsIntoBounds_(mainWorkspace);
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
      if (typeof flyout.scrollToStart == 'function') {
        flyout.scrollToStart();
      }
    }
  }

  if (options.hasTrashcan) {
    mainWorkspace.trashcan.init();
  }
  if (options.zoomOptions && options.zoomOptions.controls) {
    mainWorkspace.zoomControls_.init();
  }

  if (options.moveOptions && options.moveOptions.scrollbars) {
    var horizontalScroll = options.moveOptions.scrollbars === true ||
        !!options.moveOptions.scrollbars.horizontal;
    var verticalScroll = options.moveOptions.scrollbars === true ||
        !!options.moveOptions.scrollbars.vertical;
    mainWorkspace.scrollbar =
        new Blockly.ScrollbarPair(
            mainWorkspace, horizontalScroll, verticalScroll,
            'blocklyMainWorkspaceScrollbar');
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
    Blockly.browserEvents.conditionalBind(document, 'scroll', null, function() {
      var workspaces = Blockly.Workspace.getAll();
      for (var i = 0, workspace; (workspace = workspaces[i]); i++) {
        if (workspace.updateInverseScreenCTM) {
          workspace.updateInverseScreenCTM();
        }
      }
    });
    Blockly.browserEvents.conditionalBind(
        document, 'keydown', null, Blockly.onKeyDown);
    // longStop needs to run to stop the context menu from showing up.  It
    // should run regardless of what other touch event handlers have run.
    Blockly.browserEvents.bind(document, 'touchend', null, Blockly.longStop_);
    Blockly.browserEvents.bind(
        document, 'touchcancel', null, Blockly.longStop_);
    // Some iPad versions don't fire resize after portrait to landscape change.
    if (Blockly.utils.userAgent.IPAD) {
      Blockly.browserEvents.conditionalBind(
          window, 'orientationchange', document, function() {
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
      Blockly.browserEvents.unbind(soundBinds.pop());
    }
    audioMgr.preload();
  };

  // These are bound on mouse/touch events with Blockly.bindEventWithChecks_, so
  // they restrict the touch identifier that will be recognized.  But this is
  // really something that happens on a click, not a drag, so that's not
  // necessary.

  // Android ignores any sound not loaded as a result of a user action.
  soundBinds.push(Blockly.browserEvents.conditionalBind(
      document, 'mousemove', null, unbindSounds, true));
  soundBinds.push(Blockly.browserEvents.conditionalBind(
      document, 'touchstart', null, unbindSounds, true));
};
