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
 * Inject a Blockly editor into the specified container DIV.
 * @param {!Element} container Containing element.
 * @param {Object} opt_options Optional dictionary of options.
 * @return {!Blockly.Workspace} Newly created main workspace.
 */
Blockly.inject = function(container, opt_options) {
  // Verify that the container is in document.
  if (!goog.dom.contains(document, container)) {
    throw 'Error: container is not in current document.';
  }
  var options = Blockly.parseOptions_(opt_options || {});
  var workspace;
  var startUi = function() {
    workspace = Blockly.createDom_(container, options);
    Blockly.init_(workspace);
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
 * @return {Node} DOM tree of blocks or null.
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
    var hasCategories = false;
    var hasTrashcan = false;
    var hasCollapse = false;
    var hasComments = false;
    var hasDisable = false;
    var tree = null;
  } else {
    var tree = Blockly.parseToolboxTree_(options['toolbox']);
    var hasCategories = Boolean(tree &&
        tree.getElementsByTagName('category').length);
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
  }
  var hasScrollbars = options['scrollbars'];
  if (hasScrollbars === undefined) {
    hasScrollbars = hasCategories;
  }
  var hasSounds = options['sounds'];
  if (hasSounds === undefined) {
    hasSounds = true;
  }
  var hasCss = options['css'];
  if (hasCss === undefined) {
    hasCss = true;
  }
  var grid = options['grid'] || {};
  if (!grid['spacing']) {
    grid['spacing'] = 0;
  } else {
    grid['spacing'] = parseFloat(grid['spacing']);
  }
  if (!grid['colour']) {
    grid['colour'] = '#888';
  }
  if (!grid['length']) {
    grid['length'] = 1;
  } else {
    grid['length'] = parseFloat(grid['length']);
  }
  grid['snap'] = !!grid['snap'];
  var pathToMedia = 'https://blockly-demo.appspot.com/static/media/';
  if (options['media']) {
    pathToMedia = options['media'];
  } else if (options['path']) {
    // 'path' is a deprecated option which has been replaced by 'media'.
    pathToMedia = options['path'] + 'media/';
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
    languageTree: tree,
    gridOptions: grid,
    enableRealtime: enableRealtime,
    realtimeOptions: realtimeOptions
  };
};

/**
 * Create the SVG image.
 * @param {!Element} container Containing element.
 * @param {Object} options Dictionary of options.
 * @return {!Blockly.Workspace} Newly created main workspace.
 * @private
 */
Blockly.createDom_ = function(container, options) {
  // Sadly browsers (Chrome vs Firefox) are currently inconsistent in laying
  // out content in RTL mode.  Therefore Blockly forces the use of LTR,
  // then manually positions content in RTL as needed.
  container.setAttribute('dir', 'LTR');
  // Closure can be trusted to create HTML widgets with the proper direction.
  goog.ui.Component.setDefaultRightToLeft(Blockly.RTL);

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
  }, null);
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
    <pattern id="blocklyGridPattern" patternUnits="userSpaceOnUse"
             width="10" height="10">
      <rect width="1" height="1" stroke="#888" />
      <rect width="1" height="1" stroke="#888" />
    </pattern>
  */
  var gridPattern = Blockly.createSvgElement('pattern',
      {'id': 'blocklyGridPattern',
       'patternUnits': 'userSpaceOnUse',
       'width': options.gridOptions['spacing'],
       'height': options.gridOptions['spacing']}, defs);
  if (options.gridOptions['length'] > 0 && options.gridOptions['spacing'] > 0) {
    var half = Math.floor(options.gridOptions['spacing'] / 2) + .5;
    var start = half - options.gridOptions['length'] / 2;
    var end = half + options.gridOptions['length'] / 2;
    Blockly.createSvgElement('line',
        {'x1': start,
         'y1': half,
         'x2': end,
         'y2': half,
         'stroke': options.gridOptions['colour']},
        gridPattern);
    if (options.gridOptions['length'] > 1) {
      Blockly.createSvgElement('line',
          {'x1': half,
           'y1': start,
           'x2': half,
           'y2': end,
           'stroke': options.gridOptions['colour']},
          gridPattern);
    }
  }

  var mainWorkspace = new Blockly.WorkspaceSvg(
      Blockly.getMainWorkspaceMetrics_,
      Blockly.setMainWorkspaceMetrics_);
  mainWorkspace.options = options;
  goog.mixin(Blockly, options);  // TODO: Delete this (#singletonHunt).
  Blockly.mainWorkspace = mainWorkspace;  // TODO: Delete this (#singletonHunt).
  svg.appendChild(mainWorkspace.createDom('blocklyMainBackground'));
  mainWorkspace.maxBlocks = options.maxBlocks;
  mainWorkspace.gridPattern_ = gridPattern;

  if (!options.readOnly) {
    // Determine if there needs to be a category tree, or a simple list of
    // blocks.  This cannot be changed later, since the UI is very different.
    if (options.hasCategories) {
      mainWorkspace.toolbox_ = new Blockly.Toolbox(svg, container);
    } else if (options.languageTree) {
      mainWorkspace.addFlyout();
    }
    if (!options.hasScrollbars) {
      var workspaceChanged = function() {
        if (Blockly.dragMode_ == 0) {
          var metrics = mainWorkspace.getMetrics();
          var edgeLeft = metrics.viewLeft + metrics.absoluteLeft;
          var edgeTop = metrics.viewTop + metrics.absoluteTop;
          if (metrics.contentTop < edgeTop ||
              metrics.contentTop + metrics.contentHeight >
              metrics.viewHeight + edgeTop ||
              metrics.contentLeft <
                  (Blockly.RTL ? metrics.viewLeft : edgeLeft) ||
              metrics.contentLeft + metrics.contentWidth > (Blockly.RTL ?
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
                  blockXY.x - (Blockly.RTL ? 0 : blockHW.width);
              if (overflow > 0) {
                block.moveBy(overflow, 0);
              }
              // Bump any block that's off the right back inside.
              var overflow = edgeLeft + metrics.viewWidth - MARGIN -
                  blockXY.x + (Blockly.RTL ? blockHW.width : 0);
              if (overflow < 0) {
                block.moveBy(overflow, 0);
              }
            }
          }
        }
      };
      Blockly.addChangeListener(workspaceChanged);
    }
  }

  svg.appendChild(Blockly.Tooltip.createDom());

  // The SVG is now fully assembled.  Add it to the container.
  container.appendChild(svg);
  Blockly.svg = svg;
  Blockly.svgResize();

  // Create an HTML container for popup overlays (e.g. editor widgets).
  Blockly.WidgetDiv.DIV = goog.dom.createDom('div', 'blocklyWidgetDiv');
  Blockly.WidgetDiv.DIV.style.direction = Blockly.RTL ? 'rtl' : 'ltr';
  document.body.appendChild(Blockly.WidgetDiv.DIV);
  return mainWorkspace;
};

/**
 * Initialize Blockly with various handlers.
 * @param {!Blockly.Workspace} mainWorkspace Newly created main workspace.
 * @private
 */
Blockly.init_ = function(mainWorkspace) {
  var options = mainWorkspace.options;
  // Bind events for scrolling the workspace.
  // Most of these events should be bound to the SVG's surface.
  // However, 'mouseup' has to be on the whole document so that a block dragged
  // out of bounds and released will know that it has been released.
  // Also, 'keydown' has to be on the whole document since the browser doesn't
  // understand a concept of focus on the SVG image.
  Blockly.bindEvent_(Blockly.svg, 'mousedown', null, Blockly.onMouseDown_);
  Blockly.bindEvent_(Blockly.svg, 'contextmenu', null, Blockly.onContextMenu_);
  Blockly.bindEvent_(Blockly.WidgetDiv.DIV, 'contextmenu', null,
                     Blockly.onContextMenu_);

  Blockly.bindEvent_(Blockly.svg, 'touchstart', null,
                     function(e) {Blockly.longStart_(e, null);});

  if (!Blockly.documentEventsBound_) {
    // Only bind the window/document events once.
    // Destroying and reinjecting Blockly should not bind again.
    Blockly.bindEvent_(window, 'resize', document, Blockly.svgResize);
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
      var translation = 'translate(' + mainWorkspace.scrollX + ', 0)';
      mainWorkspace.getCanvas().setAttribute('transform', translation);
      mainWorkspace.getBubbleCanvas().setAttribute('transform', translation);
    }
  }
  if (options.hasScrollbars) {
    mainWorkspace.scrollbar = new Blockly.ScrollbarPair(mainWorkspace);
    mainWorkspace.scrollbar.resize();
  }

  mainWorkspace.addTrashcan();

  // Load the sounds.
  if (options.hasSounds) {
    Blockly.loadAudio_(
        [Blockly.pathToMedia + 'click.mp3',
         Blockly.pathToMedia + 'click.wav',
         Blockly.pathToMedia + 'click.ogg'], 'click');
    Blockly.loadAudio_(
        [Blockly.pathToMedia + 'delete.mp3',
         Blockly.pathToMedia + 'delete.ogg',
         Blockly.pathToMedia + 'delete.wav'], 'delete');

    // Bind temporary hooks that preload the sounds.
    var soundBinds = [];
    var unbindSounds = function() {
      while (soundBinds.length) {
        Blockly.unbindEvent_(soundBinds.pop());
      }
      Blockly.preloadAudio_();
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
Blockly.updateToolbox = function(tree, workspace) {
  console.warn('Deprecated call to Blockly.updateToolbox, ' +
               'use workspace.updateToolbox instead.');
  Blockly.getMainWorkspace().updateToolbox(tree);
};
