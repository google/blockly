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

goog.module('Blockly.inject');
goog.module.declareLegacyNamespace();

goog.require('Blockly.BlockDragSurfaceSvg');
goog.require('Blockly.browserEvents');
goog.require('Blockly.bumpObjects');
goog.require('Blockly.common');
goog.require('Blockly.Css');
goog.require('Blockly.DropDownDiv');
goog.require('Blockly.Grid');
goog.require('Blockly.Msg');
goog.require('Blockly.Options');
goog.require('Blockly.ScrollbarPair');
goog.require('Blockly.Touch');
goog.require('Blockly.Tooltip');
goog.require('Blockly.utils');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Svg');
goog.require('Blockly.utils.userAgent');
goog.require('Blockly.Workspace');
goog.require('Blockly.WorkspaceDragSurfaceSvg');
goog.require('Blockly.WorkspaceSvg');
goog.require('Blockly.WidgetDiv');

goog.requireType('Blockly.BlocklyOptions');


/**
 * Inject a Blockly editor into the specified container element (usually a div).
 * @param {Element|string} container Containing element, or its ID,
 *     or a CSS selector.
 * @param {Blockly.BlocklyOptions=} opt_options Optional dictionary of options.
 * @return {!Blockly.WorkspaceSvg} Newly created main workspace.
 */
const inject = function(container, opt_options) {
  if (typeof container == 'string') {
    container = document.getElementById(container) ||
        document.querySelector(container);
  }
  // Verify that the container is in document.
  if (!container || !Blockly.utils.dom.containsNode(document, container)) {
    throw Error('Error: container is not in current document.');
  }
  const options = new Blockly.Options(opt_options ||
    (/** @type {!Blockly.BlocklyOptions} */ ({})));
  const subContainer = document.createElement('div');
  subContainer.className = 'injectionDiv';
  subContainer.tabIndex = 0;
  Blockly.utils.aria.setState(subContainer,
      Blockly.utils.aria.State.LABEL, Blockly.Msg['WORKSPACE_ARIA_LABEL']);

  container.appendChild(subContainer);
  const svg = createDom_(subContainer, options);

  // Create surfaces for dragging things. These are optimizations
  // so that the browser does not repaint during the drag.
  const blockDragSurface = new Blockly.BlockDragSurfaceSvg(subContainer);

  const workspaceDragSurface = new Blockly.WorkspaceDragSurfaceSvg(subContainer);

  const workspace = createMainWorkspace_(svg, options, blockDragSurface,
      workspaceDragSurface);

  init_(workspace);

  // Keep focus on the first workspace so entering keyboard navigation looks correct.
  Blockly.common.setMainWorkspace(workspace);

  Blockly.svgResize(workspace);

  subContainer.addEventListener('focusin', function() {
    Blockly.common.setMainWorkspace(workspace);
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
const createDom_ = function(container, options) {
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
  const svg = Blockly.utils.dom.createSvgElement(
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
  const defs = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.DEFS, {}, svg);
  // Each filter/pattern needs a unique ID for the case of multiple Blockly
  // instances on a page.  Browser behaviour becomes undefined otherwise.
  // https://neil.fraser.name/news/2015/11/01/
  const rnd = String(Math.random()).substring(2);

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
const createMainWorkspace_ = function(svg, options, blockDragSurface,
    workspaceDragSurface) {
  options.parentWorkspace = null;
  const mainWorkspace =
      new Blockly.WorkspaceSvg(options, blockDragSurface, workspaceDragSurface);
  const wsOptions = mainWorkspace.options;
  mainWorkspace.scale = wsOptions.zoomOptions.startScale;
  svg.appendChild(mainWorkspace.createDom('blocklyMainBackground'));

  // Set the theme name and renderer name onto the injection div.
  Blockly.utils.dom.addClass(mainWorkspace.getInjectionDiv(),
      mainWorkspace.getRenderer().getClassName());
  Blockly.utils.dom.addClass(mainWorkspace.getInjectionDiv(),
      mainWorkspace.getTheme().getClassName());

  if (!wsOptions.hasCategories && wsOptions.languageTree) {
    // Add flyout as an <svg> that is a sibling of the workspace SVG.
    const flyout = mainWorkspace.addFlyout(Blockly.utils.Svg.SVG);
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

  mainWorkspace.addChangeListener(
    goog.module.get('Blockly.bumpObjects').bumpIntoBoundsHandler(mainWorkspace));

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
const init_ = function(mainWorkspace) {
  const options = mainWorkspace.options;
  const svg = mainWorkspace.getParentSvg();

  // Suppress the browser's context menu.
  Blockly.browserEvents.conditionalBind(
      /** @type {!Element} */ (svg.parentNode), 'contextmenu', null,
      function(e) {
        if (!Blockly.utils.isTargetInput(e)) {
          e.preventDefault();
        }
      });

  const workspaceResizeHandler =
      Blockly.browserEvents.conditionalBind(window, 'resize', null, function() {
        Blockly.hideChaff(true);
        Blockly.svgResize(mainWorkspace);
        goog.module.get('Blockly.bumpObjects')
            .bumpTopObjectsIntoBounds(mainWorkspace);
      });
  mainWorkspace.setResizeHandlerWrapper(workspaceResizeHandler);

  bindDocumentEvents_();

  if (options.languageTree) {
    const toolbox = mainWorkspace.getToolbox();
    const flyout = mainWorkspace.getFlyout(true);
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
    const horizontalScroll = options.moveOptions.scrollbars === true ||
        !!options.moveOptions.scrollbars.horizontal;
    const verticalScroll = options.moveOptions.scrollbars === true ||
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
    loadSounds_(options.pathToMedia, mainWorkspace);
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
const bindDocumentEvents_ = function() {
  if (!Blockly.documentEventsBound_) {
    Blockly.browserEvents.conditionalBind(document, 'scroll', null, function() {
      const workspaces = Blockly.Workspace.getAll();
      for (let i = 0, workspace; (workspace = workspaces[i]); i++) {
        if (workspace.updateInverseScreenCTM) {
          workspace.updateInverseScreenCTM();
        }
      }
    });
    Blockly.browserEvents.conditionalBind(
        document, 'keydown', null, Blockly.onKeyDown);
    // longStop needs to run to stop the context menu from showing up.  It
    // should run regardless of what other touch event handlers have run.
    Blockly.browserEvents.bind(document, 'touchend', null, Blockly.Touch.longStop);
    Blockly.browserEvents.bind(
        document, 'touchcancel', null, Blockly.Touch.longStop);
    // Some iPad versions don't fire resize after portrait to landscape change.
    if (Blockly.utils.userAgent.IPAD) {
      Blockly.browserEvents.conditionalBind(
          window, 'orientationchange', document, function() {
            // TODO (#397): Fix for multiple Blockly workspaces.
            Blockly.svgResize(/** @type {!Blockly.WorkspaceSvg} */
                (Blockly.common.getMainWorkspace()));
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
const loadSounds_ = function(pathToMedia, workspace) {
  const audioMgr = workspace.getAudioManager();
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
  const soundBinds = [];
  const unbindSounds = function() {
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

exports = inject;
