/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
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
 * @fileoverview Functions for injecting Blockly into a web page.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.inject');

goog.require('Blockly.BlockDragSurfaceSvg');
goog.require('Blockly.Css');
goog.require('Blockly.DropDownDiv');
goog.require('Blockly.Grid');
goog.require('Blockly.Options');
goog.require('Blockly.utils');
goog.require('Blockly.WorkspaceSvg');
goog.require('Blockly.WorkspaceDragSurfaceSvg');

goog.require('goog.ui.Component');
goog.require('goog.userAgent');


/**
 * Inject a Blockly editor into the specified container element (usually a div).
 * @param {!Element|string} container Containing element, or its ID,
 *     or a CSS selector.
 * @param {Object=} opt_options Optional dictionary of options.
 * @return {!Blockly.Workspace} Newly created main workspace.
 */
Blockly.inject = function(container, opt_options) {
  Blockly.checkBlockColourConstants();

  if (typeof container == 'string') {
    container = document.getElementById(container) ||
        document.querySelector(container);
  }
  // Verify that the container is in document.
  if (!Blockly.utils.containsNode(document, container)) {
    throw Error('Error: container is not in current document.');
  }
  var options = new Blockly.Options(opt_options || {});
  var subContainer = document.createElement('div');
  subContainer.className = 'injectionDiv';
  container.appendChild(subContainer);
  var svg = Blockly.createDom_(subContainer, options);

  // Create surfaces for dragging things. These are optimizations
  // so that the broowser does not repaint during the drag.
  var blockDragSurface = new Blockly.BlockDragSurfaceSvg(subContainer);
  var workspaceDragSurface = new Blockly.WorkspaceDragSurfaceSvg(subContainer);

  var workspace = Blockly.createMainWorkspace_(svg, options, blockDragSurface,
      workspaceDragSurface);
  Blockly.setTheme(options.theme);

  Blockly.init_(workspace);
  Blockly.mainWorkspace = workspace;

  Blockly.svgResize(workspace);

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
  // Closure can be trusted to create HTML widgets with the proper direction.
  goog.ui.Component.setDefaultRightToLeft(options.RTL);

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
  var svg = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'class': 'blocklySvg'
  }, container);
  /*
  <defs>
    ... filters go here ...
  </defs>
  */
  var defs = Blockly.utils.createSvgElement('defs', {}, svg);
  // Each filter/pattern needs a unique ID for the case of multiple Blockly
  // instances on a page.  Browser behaviour becomes undefined otherwise.
  // https://neil.fraser.name/news/2015/11/01/
  var rnd = String(Math.random()).substring(2);
  /*
    <filter id="blocklyEmbossFilter837493">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
      <feSpecularLighting in="blur" surfaceScale="1" specularConstant="0.5"
                          specularExponent="10" lighting-color="white"
                          result="specOut">
        <fePointLight x="-5000" y="-10000" z="20000" />
      </feSpecularLighting>
      <feComposite in="specOut" in2="SourceAlpha" operator="in"
                   result="specOut" />
      <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic"
                   k1="0" k2="1" k3="1" k4="0" />
    </filter>
  */
  var embossFilter = Blockly.utils.createSvgElement('filter',
      {'id': 'blocklyEmbossFilter' + rnd}, defs);
  Blockly.utils.createSvgElement('feGaussianBlur',
      {'in': 'SourceAlpha', 'stdDeviation': 1, 'result': 'blur'}, embossFilter);
  var feSpecularLighting = Blockly.utils.createSvgElement('feSpecularLighting',
      {
        'in': 'blur',
        'surfaceScale': 1,
        'specularConstant': 0.5,
        'specularExponent': 10,
        'lighting-color': 'white',
        'result': 'specOut'
      },
      embossFilter);
  Blockly.utils.createSvgElement('fePointLight',
      {'x': -5000, 'y': -10000, 'z': 20000}, feSpecularLighting);
  Blockly.utils.createSvgElement('feComposite',
      {
        'in': 'specOut',
        'in2': 'SourceAlpha',
        'operator': 'in',
        'result': 'specOut'
      }, embossFilter);
  Blockly.utils.createSvgElement('feComposite',
      {
        'in': 'SourceGraphic',
        'in2': 'specOut',
        'operator': 'arithmetic',
        'k1': 0,
        'k2': 1,
        'k3': 1,
        'k4': 0
      }, embossFilter);
  options.embossFilterId = embossFilter.id;
  /*
    <pattern id="blocklyDisabledPattern837493" patternUnits="userSpaceOnUse"
             width="10" height="10">
      <rect width="10" height="10" fill="#aaa" />
      <path d="M 0 0 L 10 10 M 10 0 L 0 10" stroke="#cc0" />
    </pattern>
  */
  var disabledPattern = Blockly.utils.createSvgElement('pattern',
      {
        'id': 'blocklyDisabledPattern' + rnd,
        'patternUnits': 'userSpaceOnUse',
        'width': 10,
        'height': 10
      }, defs);
  Blockly.utils.createSvgElement('rect',
      {'width': 10, 'height': 10, 'fill': '#aaa'}, disabledPattern);
  Blockly.utils.createSvgElement('path',
      {'d': 'M 0 0 L 10 10 M 10 0 L 0 10', 'stroke': '#cc0'}, disabledPattern);
  options.disabledPatternId = disabledPattern.id;

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
 * @return {!Blockly.Workspace} Newly created main workspace.
 * @private
 */
Blockly.createMainWorkspace_ = function(svg, options, blockDragSurface,
    workspaceDragSurface) {
  options.parentWorkspace = null;
  var mainWorkspace =
      new Blockly.WorkspaceSvg(options, blockDragSurface, workspaceDragSurface);
  mainWorkspace.scale = options.zoomOptions.startScale;
  svg.appendChild(mainWorkspace.createDom('blocklyMainBackground'));

  if (!options.hasCategories && options.languageTree) {
    // Add flyout as an <svg> that is a sibling of the workspace svg.
    var flyout = mainWorkspace.addFlyout_('svg');
    Blockly.utils.insertAfter(flyout, svg);
  }
  if (options.hasTrashcan) {
    mainWorkspace.addTrashcan();
  }
  if (options.zoomOptions && options.zoomOptions.controls) {
    mainWorkspace.addZoomControls();
  }

  // A null translation will also apply the correct initial scale.
  mainWorkspace.translate(0, 0);
  Blockly.mainWorkspace = mainWorkspace;

  if (!options.readOnly && !mainWorkspace.isMovable()) {
    // Helper function for the workspaceChanged callback.
    // TODO (#2300): Move metrics math back to the WorkspaceSvg.
    var getWorkspaceMetrics = function() {
      var workspaceMetrics = Object.create(null);
      var defaultMetrics = mainWorkspace.getMetrics();
      var scale = mainWorkspace.scale;

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
        workspaceMetrics.contentLeft = blocksBoundingBox.x;
        workspaceMetrics.contentTop = blocksBoundingBox.y;
        workspaceMetrics.contentRight =
            blocksBoundingBox.x + blocksBoundingBox.width;
        workspaceMetrics.contentBottom =
            blocksBoundingBox.y + blocksBoundingBox.height;
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
              break;
            case Blockly.Events.COMMENT_CREATE:
            case Blockly.Events.COMMENT_MOVE:
              var object = mainWorkspace.getCommentById(e.commentId);
              break;
          }
          if (object) {
            var objectMetrics = object.getBoundingRectangle();

            // Bump any object that's above the top back inside.
            var overflowTop = metrics.viewTop - objectMetrics.topLeft.y;
            if (overflowTop > 0) {
              object.moveBy(0, overflowTop);
            }

            // Bump any object that's below the bottom back inside.
            var overflowBottom = metrics.viewBottom - objectMetrics.bottomRight.y;
            if (overflowBottom < 0) {
              object.moveBy(0, overflowBottom);
            }

            // Bump any object that's off the left back inside.
            var overflowLeft = metrics.viewLeft - objectMetrics.topLeft.x;
            if (overflowLeft > 0) {
              object.moveBy(overflowLeft, 0);
            }

            // Bump any object that's off the right back inside.
            var overflowRight = metrics.viewRight - objectMetrics.bottomRight.x;
            if (overflowRight < 0) {
              object.moveBy(overflowRight, 0);
            }
          }
          if (e) {
            if (!e.group) {
              console.log('WARNING: Moved object in bounds but there was no' +
                  ' event group. This may break undo.');
            }
            Blockly.Events.setGroup(oldGroup);
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
 * @param {!Blockly.Workspace} mainWorkspace Newly created main workspace.
 * @private
 */
Blockly.init_ = function(mainWorkspace) {
  var options = mainWorkspace.options;
  var svg = mainWorkspace.getParentSvg();

  // Suppress the browser's context menu.
  Blockly.bindEventWithChecks_(svg.parentNode, 'contextmenu', null,
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
    if (mainWorkspace.toolbox_) {
      mainWorkspace.toolbox_.init(mainWorkspace);
    } else if (mainWorkspace.flyout_) {
      // Build a fixed flyout with the root blocks.
      mainWorkspace.flyout_.init(mainWorkspace);
      mainWorkspace.flyout_.show(options.languageTree.childNodes);
      mainWorkspace.flyout_.scrollToStart();
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
      for (var i = 0, workspace; workspace = workspaces[i]; i++) {
        if (workspace.updateInverseScreenCTM) {
          workspace.updateInverseScreenCTM();
        }
      }
    });
    Blockly.bindEventWithChecks_(document, 'keydown', null, Blockly.onKeyDown_);
    // longStop needs to run to stop the context menu from showing up.  It
    // should run regardless of what other touch event handlers have run.
    Blockly.bindEvent_(document, 'touchend', null, Blockly.longStop_);
    Blockly.bindEvent_(document, 'touchcancel', null, Blockly.longStop_);
    // Some iPad versions don't fire resize after portrait to landscape change.
    if (goog.userAgent.IPAD) {
      Blockly.bindEventWithChecks_(window, 'orientationchange', document,
          function() {
            // TODO (#397): Fix for multiple Blockly workspaces.
            Blockly.svgResize(Blockly.getMainWorkspace());
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

/**
 * Modify the block tree on the existing toolbox.
 * @param {Node|string} tree DOM tree of blocks, or text representation of same.
 * @deprecated April 2015
 */
Blockly.updateToolbox = function(tree) {
  console.warn('Deprecated call to Blockly.updateToolbox, ' +
               'use workspace.updateToolbox instead.');
  Blockly.getMainWorkspace().updateToolbox(tree);
};
