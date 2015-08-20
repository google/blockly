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

goog.require('Blockly.Css');
goog.require('Blockly.WorkspaceSvg');
goog.require('goog.dom');
goog.require('goog.ui.Component');
goog.require('goog.userAgent');


/**
 * Inject a Blockly editor into the specified container element (usually a div).
 * @param {!Element|string} container Containing element or its ID.
 * @param {Object=} opt_options Optional dictionary of options.
 * @return {!Blockly.Workspace} Newly created main workspace.
 */
Blockly.inject = function(container, opt_options) {
  if (goog.isString(container)) {
    container = document.getElementById(container);
  }
  // Verify that the container is in document.
  if (!goog.dom.contains(document, container)) {
    throw 'Error: container is not in current document.';
  }
  var options = Blockly.parseOptions_(opt_options || {});
  var workspace;
  var startUi = function() {
    var svg = Blockly.createDom_(container, options);
    workspace = Blockly.createMainWorkspace_(svg, options);
    Blockly.init_(workspace);
    workspace.markFocused();
    Blockly.bindEvent_(svg, 'focus', workspace, workspace.markFocused);
  };
  if (options.enableRealtime) {
    var realtimeElement = document.getElementById('realtime');
    if (realtimeElement) {
      realtimeElement.style.display = 'block';
    }
    Blockly.Realtime.startRealtime(startUi, container, options.realtimeOptions);
  } else {
    startUi();
  }
  return workspace;
};

/**
 * Parse the provided toolbox tree into a consistent DOM format.
 * @param {Node|string} tree DOM tree of blocks, or text representation of same.
 * @return {Node} DOM tree of blocks, or null.
 * @private
 */
Blockly.parseToolboxTree_ = function(tree) {
  if (tree) {
    if (typeof tree != 'string' && typeof XSLTProcessor == 'undefined') {
      // In this case the tree will not have been properly built by the
      // browser. The HTML will be contained in the element, but it will
      // not have the proper DOM structure since the browser doesn't support
      // XSLTProcessor (XML -> HTML). This is the case in IE 9+.
      tree = tree.outerHTML;
    }
    if (typeof tree == 'string') {
      tree = Blockly.Xml.textToDom(tree);
    }
  } else {
    tree = null;
  }
  return tree;
};

/**
 * Configure Blockly to behave according to a set of options.
 * @param {!Object} options Dictionary of options.  Specification:
 *   https://developers.google.com/blockly/installation/overview#configuration
 * @return {!Object} Dictionary of normalized options.
 * @private
 */
Blockly.parseOptions_ = function(options) {
  var readOnly = !!options['readOnly'];
  if (readOnly) {
    var languageTree = null;
    var hasCategories = false;
    var hasTrashcan = false;
    var hasCollapse = false;
    var hasComments = false;
    var hasDisable = false;
    var hasSounds = false;
  } else {
    var languageTree = Blockly.parseToolboxTree_(options['toolbox']);
    var hasCategories = Boolean(languageTree &&
        languageTree.getElementsByTagName('category').length);
    var hasTrashcan = options['trashcan'];
    if (hasTrashcan === undefined) {
      hasTrashcan = hasCategories;
    }
    var hasCollapse = options['collapse'];
    if (hasCollapse === undefined) {
      hasCollapse = hasCategories;
    }
    var hasComments = options['comments'];
    if (hasComments === undefined) {
      hasComments = hasCategories;
    }
    var hasDisable = options['disable'];
    if (hasDisable === undefined) {
      hasDisable = hasCategories;
    }
    var hasSounds = options['sounds'];
    if (hasSounds === undefined) {
      hasSounds = true;
    }
  }
  var hasScrollbars = options['scrollbars'];
  if (hasScrollbars === undefined) {
    hasScrollbars = hasCategories;
  }
  var hasCss = options['css'];
  if (hasCss === undefined) {
    hasCss = true;
  }
  // See grid documentation at:
  // https://developers.google.com/blockly/installation/grid
  var grid = options['grid'] || {};
  var gridOptions = {};
  gridOptions.spacing = parseFloat(grid['spacing']) || 0;
  gridOptions.colour = grid['colour'] || '#888';
  gridOptions.length = parseFloat(grid['length']) || 1;
  gridOptions.snap = gridOptions.spacing > 0 && !!grid['snap'];
  var pathToMedia = 'https://blockly-demo.appspot.com/static/media/';
  if (options['media']) {
    pathToMedia = options['media'];
  } else if (options['path']) {
    // 'path' is a deprecated option which has been replaced by 'media'.
    pathToMedia = options['path'] + 'media/';
  }

/* TODO (fraser): Add documentation page:
 * https://developers.google.com/blockly/installation/zoom
 *
 * enabled
 *
 * Set to `true` to allow zooming of the main workspace.  Zooming is only
 * possible if the workspace has scrollbars.  If `false`, then the options
 * below have no effect.  Defaults to `false`.
 *
 * controls
 *
 * Set to `true` to show zoom-in and zoom-out buttons.  Defaults to `true`.
 *
 * wheel
 *
 * Set to `true` to allow the mouse wheel to zoom.  Defaults to `true`.
 *
 * maxScale
 *
 * Maximum multiplication factor for how far one can zoom in.  Defaults to `3`.
 *
 * minScale
 *
 * Minimum multiplication factor for how far one can zoom out.  Defaults to `0.3`.
 *
 * scaleSpeed
 *
 * For each zooming in-out step the scale is multiplied
 * or divided respectively by the scale speed, this means that:
 * `scale = scaleSpeed ^ steps`, note that in this formula
 * steps of zoom-out are subtracted and zoom-in steps are added.
 */
  // See zoom documentation at:
  // https://developers.google.com/blockly/installation/zoom
  var zoom = options['zoom'] || {};
  var zoomOptions = {};
  zoomOptions.enabled = hasScrollbars && !!zoom['enabled'];
  if (zoomOptions.enabled) {
    if (zoom['controls'] === undefined) {
      zoomOptions.controls = true;
    } else {
      zoomOptions.controls = !!zoom['controls'];
    }
    if (zoom['wheel'] === undefined) {
      zoomOptions.wheel = true;
    } else {
      zoomOptions.wheel = !!zoom['wheel'];
    }
    if (zoom['maxScale'] === undefined) {
      zoomOptions.maxScale = 3;
    } else {
      zoomOptions.maxScale = parseFloat(zoom['maxScale']);
    }
    if (zoom['minScale'] === undefined) {
      zoomOptions.minScale = 0.3;
    } else {
      zoomOptions.minScale = parseFloat(zoom['minScale']);
    }
    if (zoom['scaleSpeed'] === undefined) {
      zoomOptions.scaleSpeed = 1.2;
    } else {
      zoomOptions.scaleSpeed = parseFloat(zoom['scaleSpeed']);
    }
  } else {
    zoomOptions.controls = false;
    zoomOptions.wheel = false;
  }

  var enableRealtime = !!options['realtime'];
  var realtimeOptions = enableRealtime ? options['realtimeOptions'] : undefined;

  return {
    RTL: !!options['rtl'],
    collapse: hasCollapse,
    comments: hasComments,
    disable: hasDisable,
    readOnly: readOnly,
    maxBlocks: options['maxBlocks'] || Infinity,
    pathToMedia: pathToMedia,
    hasCategories: hasCategories,
    hasScrollbars: hasScrollbars,
    hasTrashcan: hasTrashcan,
    hasSounds: hasSounds,
    hasCss: hasCss,
    languageTree: languageTree,
    gridOptions: gridOptions,
    zoomOptions: zoomOptions,
    enableRealtime: enableRealtime,
    realtimeOptions: realtimeOptions
  };
};

/**
 * Create the SVG image.
 * @param {!Element} container Containing element.
 * @param {Object} options Dictionary of options.
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
  var svg = Blockly.createSvgElement('svg', {
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
  var defs = Blockly.createSvgElement('defs', {}, svg);
  var filter, feSpecularLighting, feMerge;
  /*
    <filter id="blocklyEmboss">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
      <feSpecularLighting in="blur" surfaceScale="1" specularConstant="0.5"
                          specularExponent="10" lighting-color="white"
                          result="specOut">
        <fePointLight x="-5000" y="-10000" z="20000"/>
      </feSpecularLighting>
      <feComposite in="specOut" in2="SourceAlpha" operator="in"
                   result="specOut"/>
      <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic"
                   k1="0" k2="1" k3="1" k4="0"/>
    </filter>
  */
  filter = Blockly.createSvgElement('filter', {'id': 'blocklyEmboss'}, defs);
  Blockly.createSvgElement('feGaussianBlur',
      {'in': 'SourceAlpha', 'stdDeviation': 1, 'result': 'blur'}, filter);
  feSpecularLighting = Blockly.createSvgElement('feSpecularLighting',
      {'in': 'blur', 'surfaceScale': 1, 'specularConstant': 0.5,
       'specularExponent': 10, 'lighting-color': 'white', 'result': 'specOut'},
      filter);
  Blockly.createSvgElement('fePointLight',
      {'x': -5000, 'y': -10000, 'z': 20000}, feSpecularLighting);
  Blockly.createSvgElement('feComposite',
      {'in': 'specOut', 'in2': 'SourceAlpha', 'operator': 'in',
       'result': 'specOut'}, filter);
  Blockly.createSvgElement('feComposite',
      {'in': 'SourceGraphic', 'in2': 'specOut', 'operator': 'arithmetic',
       'k1': 0, 'k2': 1, 'k3': 1, 'k4': 0}, filter);
  /*
    <filter id="blocklyShadowFilter">
      <feGaussianBlur stdDeviation="2"/>
    </filter>
  */
  filter = Blockly.createSvgElement('filter',
      {'id': 'blocklyShadowFilter'}, defs);
  Blockly.createSvgElement('feGaussianBlur', {'stdDeviation': 2}, filter);
  /*
    <pattern id="blocklyDisabledPattern" patternUnits="userSpaceOnUse"
             width="10" height="10">
      <rect width="10" height="10" fill="#aaa" />
      <path d="M 0 0 L 10 10 M 10 0 L 0 10" stroke="#cc0" />
    </pattern>
  */
  var disabledPattern = Blockly.createSvgElement('pattern',
      {'id': 'blocklyDisabledPattern', 'patternUnits': 'userSpaceOnUse',
       'width': 10, 'height': 10}, defs);
  Blockly.createSvgElement('rect',
      {'width': 10, 'height': 10, 'fill': '#aaa'}, disabledPattern);
  Blockly.createSvgElement('path',
      {'d': 'M 0 0 L 10 10 M 10 0 L 0 10', 'stroke': '#cc0'}, disabledPattern);
  /*
    <pattern id="blocklyGridPattern837493" patternUnits="userSpaceOnUse">
      <rect stroke="#888" />
      <rect stroke="#888" />
    </pattern>
  */
  var gridPattern = Blockly.createSvgElement('pattern',
      {'id': 'blocklyGridPattern' + String(Math.random()).substring(2),
       'patternUnits': 'userSpaceOnUse'}, defs);
  if (options.gridOptions['length'] > 0 && options.gridOptions['spacing'] > 0) {
    Blockly.createSvgElement('line',
        {'stroke': options.gridOptions['colour']},
        gridPattern);
    if (options.gridOptions['length'] > 1) {
      Blockly.createSvgElement('line',
          {'stroke': options.gridOptions['colour']},
          gridPattern);
    }
    // x1, y1, x1, x2 properties will be set later in updateGridPattern_.
  }
  options.gridPattern = gridPattern;
  options.svg = svg;
  return svg;
};

/**
 * Create a main workspace and add it to the SVG.
 * @param {!Element} svg SVG element with pattern defined.
 * @param {Object} options Dictionary of options.
 * @return {!Blockly.Workspace} Newly created main workspace.
 * @private
 */
Blockly.createMainWorkspace_ = function(svg, options) {
  options.parentWorkspace = null;
  options.getMetrics = Blockly.getMainWorkspaceMetrics_;
  options.setMetrics = Blockly.setMainWorkspaceMetrics_;
  var mainWorkspace = new Blockly.WorkspaceSvg(options);
  svg.appendChild(mainWorkspace.createDom('blocklyMainBackground'));
  mainWorkspace.markFocused();

  if (!options.readOnly && !options.hasScrollbars) {
    var workspaceChanged = function() {
      if (Blockly.dragMode_ == 0) {
        var metrics = mainWorkspace.getMetrics();
        var edgeLeft = metrics.viewLeft + metrics.absoluteLeft;
        var edgeTop = metrics.viewTop + metrics.absoluteTop;
        if (metrics.contentTop < edgeTop ||
            metrics.contentTop + metrics.contentHeight >
            metrics.viewHeight + edgeTop ||
            metrics.contentLeft <
                (options.RTL ? metrics.viewLeft : edgeLeft) ||
            metrics.contentLeft + metrics.contentWidth > (options.RTL ?
                metrics.viewWidth : metrics.viewWidth + edgeLeft)) {
          // One or more blocks may be out of bounds.  Bump them back in.
          var MARGIN = 25;
          var blocks = mainWorkspace.getTopBlocks(false);
          for (var b = 0, block; block = blocks[b]; b++) {
            var blockXY = block.getRelativeToSurfaceXY();
            var blockHW = block.getHeightWidth();
            // Bump any block that's above the top back inside.
            var overflow = edgeTop + MARGIN - blockHW.height - blockXY.y;
            if (overflow > 0) {
              block.moveBy(0, overflow);
            }
            // Bump any block that's below the bottom back inside.
            var overflow = edgeTop + metrics.viewHeight - MARGIN - blockXY.y;
            if (overflow < 0) {
              block.moveBy(0, overflow);
            }
            // Bump any block that's off the left back inside.
            var overflow = MARGIN + edgeLeft -
                blockXY.x - (options.RTL ? 0 : blockHW.width);
            if (overflow > 0) {
              block.moveBy(overflow, 0);
            }
            // Bump any block that's off the right back inside.
            var overflow = edgeLeft + metrics.viewWidth - MARGIN -
                blockXY.x + (options.RTL ? blockHW.width : 0);
            if (overflow < 0) {
              block.moveBy(overflow, 0);
            }
          }
        }
      }
    };
    mainWorkspace.addChangeListener(workspaceChanged);
  }
  // The SVG is now fully assembled.
  Blockly.svgResize(mainWorkspace);
  Blockly.WidgetDiv.createDom();
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
  var svg = mainWorkspace.options.svg;
  // Supress the browser's context menu.
  Blockly.bindEvent_(svg, 'contextmenu', null,
      function(e) {
        if (!Blockly.isTargetInput_(e)) {
          e.preventDefault();
        }
      });
  // Bind events for scrolling the workspace.
  // Most of these events should be bound to the SVG's surface.
  // However, 'mouseup' has to be on the whole document so that a block dragged
  // out of bounds and released will know that it has been released.
  // Also, 'keydown' has to be on the whole document since the browser doesn't
  // understand a concept of focus on the SVG image.

  Blockly.bindEvent_(window, 'resize', null,
                     function() {Blockly.svgResize(mainWorkspace);});

  if (!Blockly.documentEventsBound_) {
    // Only bind the window/document events once.
    // Destroying and reinjecting Blockly should not bind again.
    Blockly.bindEvent_(document, 'keydown', null, Blockly.onKeyDown_);
    Blockly.bindEvent_(document, 'touchend', null, Blockly.longStop_);
    Blockly.bindEvent_(document, 'touchcancel', null, Blockly.longStop_);
    // Don't use bindEvent_ for document's mouseup since that would create a
    // corresponding touch handler that would squeltch the ability to interact
    // with non-Blockly elements.
    document.addEventListener('mouseup', Blockly.onMouseUp_, false);
    // Some iPad versions don't fire resize after portrait to landscape change.
    if (goog.userAgent.IPAD) {
      Blockly.bindEvent_(window, 'orientationchange', document, function() {
        Blockly.fireUiEvent(window, 'resize');
      });
    }
    Blockly.documentEventsBound_ = true;
  }

  if (options.languageTree) {
    if (mainWorkspace.toolbox_) {
      mainWorkspace.toolbox_.init(mainWorkspace);
    } else if (mainWorkspace.flyout_) {
      // Build a fixed flyout with the root blocks.
      mainWorkspace.flyout_.init(mainWorkspace);
      mainWorkspace.flyout_.show(options.languageTree.childNodes);
      // Translate the workspace sideways to avoid the fixed flyout.
      mainWorkspace.scrollX = mainWorkspace.flyout_.width_;
      if (options.RTL) {
        mainWorkspace.scrollX *= -1;
      }
      var translation = 'translate(' + mainWorkspace.scrollX + ',0)';
      mainWorkspace.getCanvas().setAttribute('transform', translation);
      mainWorkspace.getBubbleCanvas().setAttribute('transform', translation);
    }
  }
  if (options.hasScrollbars) {
    mainWorkspace.scrollbar = new Blockly.ScrollbarPair(mainWorkspace);
    mainWorkspace.scrollbar.resize();
  }

  // Load the sounds.
  if (options.hasSounds) {
    mainWorkspace.loadAudio_(
        [options.pathToMedia + 'click.mp3',
         options.pathToMedia + 'click.wav',
         options.pathToMedia + 'click.ogg'], 'click');
    mainWorkspace.loadAudio_(
        [options.pathToMedia + 'delete.mp3',
         options.pathToMedia + 'delete.ogg',
         options.pathToMedia + 'delete.wav'], 'delete');

    // Bind temporary hooks that preload the sounds.
    var soundBinds = [];
    var unbindSounds = function() {
      while (soundBinds.length) {
        Blockly.unbindEvent_(soundBinds.pop());
      }
      mainWorkspace.preloadAudio_();
    };
    // Android ignores any sound not loaded as a result of a user action.
    soundBinds.push(
        Blockly.bindEvent_(document, 'mousemove', null, unbindSounds));
    soundBinds.push(
        Blockly.bindEvent_(document, 'touchstart', null, unbindSounds));
  }
};

/**
 * Modify the block tree on the existing toolbox.
 * @param {Node|string} tree DOM tree of blocks, or text representation of same.
 */
Blockly.updateToolbox = function(tree) {
  console.warn('Deprecated call to Blockly.updateToolbox, ' +
               'use workspace.updateToolbox instead.');
  Blockly.getMainWorkspace().updateToolbox(tree);
};
