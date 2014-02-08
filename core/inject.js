/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://blockly.googlecode.com/
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
goog.require('goog.dom');


/**
 * Initialize the SVG document with various handlers.
 * @param {!Element} container Containing element.
 * @param {Object} opt_options Optional dictionary of options.
 */
Blockly.inject = function(container, opt_options) {
  // Verify that the container is in document.
  if (!goog.dom.contains(document, container)) {
    throw 'Error: container is not in current document.';
  }
  if (opt_options) {
    // TODO(scr): don't mix this in to global variables.
    goog.mixin(Blockly, Blockly.parseOptions_(opt_options));
  }
  var startUi = function() {
    Blockly.createDom_(container);
    Blockly.init_();
  };
  if (Blockly.enableRealtime) {
    var realtimeElement = document.getElementById('realtime');
    if (realtimeElement) {
      realtimeElement.style.display = 'block';
    }
    Blockly.Realtime.startRealtime(startUi, container, Blockly.realtimeOptions);
  } else {
    startUi();
  }
};

/**
 * Configure Blockly to behave according to a set of options.
 * @param {!Object} options Dictionary of options.
 * @return {Object} Parsed options.
 * @private
 */
Blockly.parseOptions_ = function(options) {
  var readOnly = !!options['readOnly'];
  if (readOnly) {
    var hasCategories = false;
    var hasTrashcan = false;
    var hasCollapse = false;
    var tree = null;
  } else {
    var tree = options['toolbox'];
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
      var hasCategories = !!tree.getElementsByTagName('category').length;
    } else {
      tree = null;
      var hasCategories = false;
    }
    var hasTrashcan = options['trashcan'];
    if (hasTrashcan === undefined) {
      hasTrashcan = hasCategories;
    }
    var hasCollapse = options['collapse'];
    if (hasCollapse === undefined) {
      hasCollapse = hasCategories;
    }
  }
  if (tree && !hasCategories) {
    // Scrollbars are not compatible with a non-flyout toolbox.
    var hasScrollbars = false;
  } else {
    var hasScrollbars = options['scrollbars'];
    if (hasScrollbars === undefined) {
      hasScrollbars = true;
    }
  }
  var enableRealtime = !!options['realtime'];
  var realtimeOptions = enableRealtime ? options['realtimeOptions'] : undefined;
  return {
    RTL: !!options['rtl'],
    collapse: hasCollapse,
    readOnly: readOnly,
    maxBlocks: options['maxBlocks'] || Infinity,
    pathToBlockly: options['path'] || './',
    hasCategories: hasCategories,
    hasScrollbars: hasScrollbars,
    hasTrashcan: hasTrashcan,
    languageTree: tree,
    enableRealtime: enableRealtime,
    realtimeOptions: realtimeOptions
  };
};

/**
 * Create the SVG image.
 * @param {!Element} container Containing element.
 * @private
 */
Blockly.createDom_ = function(container) {
  // Sadly browsers (Chrome vs Firefox) are currently inconsistent in laying
  // out content in RTL mode.  Therefore Blockly forces the use of LTR,
  // then manually positions content in RTL as needed.
  container.setAttribute('dir', 'LTR');
  // Closure can be trusted to create HTML widgets with the proper direction.
  goog.ui.Component.setDefaultRightToLeft(Blockly.RTL);

  // Load CSS.
  Blockly.Css.inject();

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
  var filter, feSpecularLighting, feMerge, pattern;
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
    <filter id="blocklyTrashcanShadowFilter">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
      <feOffset in="blur" dx="1" dy="1" result="offsetBlur"/>
      <feMerge>
        <feMergeNode in="offsetBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  */
  filter = Blockly.createSvgElement('filter',
      {'id': 'blocklyTrashcanShadowFilter'}, defs);
  Blockly.createSvgElement('feGaussianBlur',
      {'in': 'SourceAlpha', 'stdDeviation': 2, 'result': 'blur'}, filter);
  Blockly.createSvgElement('feOffset',
      {'in': 'blur', 'dx': 1, 'dy': 1, 'result': 'offsetBlur'}, filter);
  feMerge = Blockly.createSvgElement('feMerge', {}, filter);
  Blockly.createSvgElement('feMergeNode', {'in': 'offsetBlur'}, feMerge);
  Blockly.createSvgElement('feMergeNode', {'in': 'SourceGraphic'}, feMerge);
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
  pattern = Blockly.createSvgElement('pattern',
      {'id': 'blocklyDisabledPattern', 'patternUnits': 'userSpaceOnUse',
       'width': 10, 'height': 10}, defs);
  Blockly.createSvgElement('rect',
      {'width': 10, 'height': 10, 'fill': '#aaa'}, pattern);
  Blockly.createSvgElement('path',
      {'d': 'M 0 0 L 10 10 M 10 0 L 0 10', 'stroke': '#cc0'}, pattern);
  Blockly.mainWorkspace = new Blockly.Workspace(
      Blockly.getMainWorkspaceMetrics_,
      Blockly.setMainWorkspaceMetrics_);
  svg.appendChild(Blockly.mainWorkspace.createDom());
  Blockly.mainWorkspace.maxBlocks = Blockly.maxBlocks;

  if (!Blockly.readOnly) {
    // Determine if there needs to be a category tree, or a simple list of
    // blocks.  This cannot be changed later, since the UI is very different.
    if (Blockly.hasCategories) {
      Blockly.Toolbox.createDom(svg, container);
    } else {
      /**
       * @type {!Blockly.Flyout}
       * @private
       */
      Blockly.mainWorkspace.flyout_ = new Blockly.Flyout();
      var flyout = Blockly.mainWorkspace.flyout_;
      var flyoutSvg = flyout.createDom();
      flyout.init(Blockly.mainWorkspace, true);
      flyout.autoClose = false;
      // Insert the flyout behind the workspace so that blocks appear on top.
      goog.dom.insertSiblingBefore(flyoutSvg, Blockly.mainWorkspace.svgGroup_);
      var workspaceChanged = function() {
        if (Blockly.Block.dragMode_ == 0) {
          var metrics = Blockly.mainWorkspace.getMetrics();
          if (metrics.contentTop < 0 ||
              metrics.contentTop + metrics.contentHeight >
              metrics.viewHeight + metrics.viewTop ||
              metrics.contentLeft < (Blockly.RTL ? metrics.viewLeft : 0) ||
              metrics.contentLeft + metrics.contentWidth >
              metrics.viewWidth + (Blockly.RTL ? 2 : 1) * metrics.viewLeft) {
            // One or more blocks is out of bounds.  Bump them back in.
            var MARGIN = 25;
            var blocks = Blockly.mainWorkspace.getTopBlocks(false);
            for (var b = 0, block; block = blocks[b]; b++) {
              var blockXY = block.getRelativeToSurfaceXY();
              var blockHW = block.getHeightWidth();
              // Bump any block that's above the top back inside.
              var overflow = metrics.viewTop + MARGIN - blockHW.height -
                  blockXY.y;
              if (overflow > 0) {
                block.moveBy(0, overflow);
              }
              // Bump any block that's below the bottom back inside.
              var overflow = metrics.viewTop + metrics.viewHeight - MARGIN -
                  blockXY.y;
              if (overflow < 0) {
                block.moveBy(0, overflow);
              }
              // Bump any block that's off the left back inside.
              var overflow = MARGIN + metrics.viewLeft - blockXY.x -
                  (Blockly.RTL ? 0 : blockHW.width);
              if (overflow > 0) {
                block.moveBy(overflow, 0);
              }
              // Bump any block that's off the right back inside.
              var overflow = metrics.viewLeft + metrics.viewWidth - MARGIN -
                  blockXY.x + (Blockly.RTL ? blockHW.width : 0);
              if (overflow < 0) {
                block.moveBy(overflow, 0);
              }
              // Delete any block that's sitting on top of the flyout.
              if (block.isDeletable() && (Blockly.RTL ?
                  blockXY.x - 2 * metrics.viewLeft - metrics.viewWidth :
                  -blockXY.x) > MARGIN * 2) {
                block.dispose(false, true);
              }
            }
          }
        }
      };
      Blockly.addChangeListener(workspaceChanged);
    }
  }

  Blockly.Tooltip && svg.appendChild(Blockly.Tooltip.createDom());
  if (!Blockly.readOnly && Blockly.FieldDropdown) {
    svg.appendChild(Blockly.FieldDropdown.createDom());
  }

  if (Blockly.ContextMenu && Blockly.ContextMenu) {
    svg.appendChild(Blockly.ContextMenu.createDom());
  }

  // The SVG is now fully assembled.  Add it to the container.
  container.appendChild(svg);
  Blockly.svg = svg;
  Blockly.svgResize();

  // Create an HTML container for popup overlays (e.g. editor widgets).
  Blockly.WidgetDiv.DIV = goog.dom.createDom('div', 'blocklyWidgetDiv');
  document.body.appendChild(Blockly.WidgetDiv.DIV);
};


/**
 * Initialize Blockly with various handlers.
 * @private
 */
Blockly.init_ = function() {
  if (goog.userAgent.WEBKIT) {
    /* HACK:
     WebKit bug 67298 causes control points to be included in the reported
     bounding box.  Detect if this browser suffers from this bug by drawing a
     shape that is 50px high, and has a control point that sticks up by 5px.
     If the getBBox function returns a height of 55px instead of 50px, then
     this browser has broken control points.
    */
    var path = Blockly.createSvgElement('path',
        {'d': 'm 0,0 c 0,-5 0,-5 0,0 H 50 V 50 z'}, Blockly.svg);
    if (path.getBBox().height > 50) {
      // Chrome (v28) and Opera (v15) report 55, Safari (v6.0.5) reports 53.75.
      Blockly.BROKEN_CONTROL_POINTS = true;
    }
    Blockly.svg.removeChild(path);
  }

  // Bind events for scrolling the workspace.
  // Most of these events should be bound to the SVG's surface.
  // However, 'mouseup' has to be on the whole document so that a block dragged
  // out of bounds and released will know that it has been released.
  // Also, 'keydown' has to be on the whole document since the browser doesn't
  // understand a concept of focus on the SVG image.
  Blockly.bindEvent_(Blockly.svg, 'mousedown', null, Blockly.onMouseDown_);
  Blockly.bindEvent_(Blockly.svg, 'mousemove', null, Blockly.onMouseMove_);
  Blockly.bindEvent_(Blockly.svg, 'contextmenu', null, Blockly.onContextMenu_);

  if (!Blockly.documentEventsBound_) {
    // Only bind the window/document events once.
    // Destroying and reinjecting Blockly should not bind again.
    Blockly.bindEvent_(window, 'resize', document, Blockly.svgResize);
    Blockly.bindEvent_(document, 'mouseup', null, Blockly.onMouseUp_);
    Blockly.bindEvent_(document, 'keydown', null, Blockly.onKeyDown_);
    // Some iPad versions don't fire resize after portrait to landscape change.
    if (goog.userAgent.IPAD) {
      Blockly.bindEvent_(window, 'orientationchange', document, function() {
        Blockly.fireUiEvent(window, 'resize');
      }, false);
    }
    Blockly.documentEventsBound_ = true;
  }

  if (Blockly.languageTree) {
    if (Blockly.hasCategories) {
      Blockly.Toolbox.init();
    } else {
      // Build a fixed flyout with the root blocks.
      Blockly.mainWorkspace.flyout_.init(Blockly.mainWorkspace, true);
      Blockly.mainWorkspace.flyout_.show(Blockly.languageTree.childNodes);
      // Translate the workspace sideways to avoid the fixed flyout.
      Blockly.mainWorkspace.scrollX = Blockly.mainWorkspace.flyout_.width_;
      var translation = 'translate(' + Blockly.mainWorkspace.scrollX + ', 0)';
      Blockly.mainWorkspace.getCanvas().setAttribute('transform', translation);
      Blockly.mainWorkspace.getBubbleCanvas().setAttribute('transform',
                                                           translation);
    }
  }
  if (Blockly.hasScrollbars) {
    Blockly.mainWorkspace.scrollbar = new Blockly.ScrollbarPair(
        Blockly.mainWorkspace);
    Blockly.mainWorkspace.scrollbar.resize();
  }

  Blockly.mainWorkspace.addTrashcan();

  // Load the sounds.
  Blockly.loadAudio_(
      ['media/click.mp3', 'media/click.wav', 'media/click.ogg'], 'click');
  Blockly.loadAudio_(
      ['media/delete.mp3', 'media/delete.ogg', 'media/delete.wav'], 'delete');
};
