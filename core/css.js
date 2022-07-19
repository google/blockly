/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Inject Blockly's CSS synchronously.
 */
'use strict';

/**
 * Inject Blockly's CSS synchronously.
 * @namespace Blockly.Css
 */
goog.module('Blockly.Css');

const deprecation = goog.require('Blockly.utils.deprecation');


/**
 * Has CSS already been injected?
 * @type {boolean}
 * @private
 */
let injected = false;

/**
 * CSS chunks
 * @type {Array<string>>}
 * @private
 */
let chunks = [];

/**
 * CSS chunks names
 * @type {Array<string>>}
 * @private
 */
const chunksNames = [];

/**
 * Add some CSS to the blob that will be injected later.  Allows optional
 * components such as fields and the toolbox to store separate CSS.
 * @param {string|!Array<string>} cssContent Multiline CSS string or an array of
 *    single lines of CSS.
 * @param {string} moduleName Name of css chunk
 * @alias Blockly.Css.register
 */
const register = function(cssContent, moduleName) {
  if (injected) {
    throw Error('CSS already injected');
  }

  if (Array.isArray(cssContent)) {
    deprecation.warn(
        'Registering CSS by passing an array of strings', 'September 2021',
        'September 2022', 'css.register passing a multiline string');
    chunks.push(cssContent.join('\n'));
  } else {
    // Add new cssContent in the global content.
    chunks.push(cssContent);
  }

  chunksNames.push(moduleName);
};
exports.register = register;

/**
 * Inject the CSS into the DOM.  This is preferable over using a regular CSS
 * file since:
 * a) It loads synchronously and doesn't force a redraw later.
 * b) It speeds up loading by not blocking on a separate HTTP transfer.
 * c) The CSS content may be made dynamic depending on init options.
 * @param {boolean} hasCss If false, don't inject CSS
 *     (providing CSS becomes the document's responsibility).
 * @param {string} pathToMedia Path from page to the Blockly media directory.
 * @alias Blockly.Css.inject
 */
const inject = function(hasCss, pathToMedia) {
  // Only inject the CSS once.
  if (injected) {
    return;
  }
  injected = true;
  if (!hasCss) {
    return;
  }
  // Strip off any trailing slash (either Unix or Windows).
  const mediaPath = pathToMedia.replace(/[\\/]$/, '');
  const cssContent = content.replace(/<<<PATH>>>/g, mediaPath);
  chunks = chunks.map((chunk) => chunk.replace(/<<<PATH>>>/g, mediaPath));
  // Cleanup the collected css content after injecting it to the DOM.
  content = '';

  // Inject common styles at start of head.
  const cssNode = document.createElement('style');
  cssNode.id = 'blockly-common-style';
  cssNode.setAttribute('type', 'text/css');
  const cssTextNode = document.createTextNode(cssContent);
  cssNode.appendChild(cssTextNode);
  document.head.insertBefore(cssNode, document.head.firstChild);

  // Append css chunks to head.
  chunks.forEach((chunk, index) => {
    const cssNode = document.createElement('style');
    cssNode.id = `blockly-style-chunk-${chunksNames[index] || index}`;
    cssNode.setAttribute('type', 'text/css');
    const cssTextNode = document.createTextNode(chunk);
    cssNode.appendChild(cssTextNode);
    document.head.appendChild(cssNode);
  });
};
exports.inject = inject;

/**
 * The CSS content for Blockly.
 * @alias Blockly.Css.content
 */
let content = (`
.blocklySvg {
  background-color: #fff;
  outline: none;
  overflow: hidden;  /* IE overflows by default. */
  position: absolute;
  display: block;
}

.blocklyWidgetDiv {
  display: none;
  position: absolute;
  z-index: 99999;  /* big value for bootstrap3 compatibility */
}

.injectionDiv {
  height: 100%;
  position: relative;
  overflow: hidden;  /* So blocks in drag surface disappear at edges */
  touch-action: none;
}

.blocklyNonSelectable {
  user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
}

.blocklyWsDragSurface {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
}

  /* Added as a separate rule with multiple classes to make it more specific
     than a bootstrap rule that selects svg:root. See issue #1275 for context.
  */
  .blocklyWsDragSurface.blocklyOverflowVisible {
  overflow: visible;
}

.blocklyBlockDragSurface {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: visible !important;
  z-index: 50;  /* Display below toolbox, but above everything else. */
}

.blocklyBlockCanvas.blocklyCanvasTransitioning,
.blocklyBubbleCanvas.blocklyCanvasTransitioning {
  transition: transform .5s;
}

.blocklyTooltipDiv {
  background-color: #ffffc7;
  border: 1px solid #ddc;
  box-shadow: 4px 4px 20px 1px rgba(0,0,0,.15);
  color: #000;
  display: none;
  font: 9pt sans-serif;
  opacity: .9;
  padding: 2px;
  position: absolute;
  z-index: 100000;  /* big value for bootstrap3 compatibility */
}

.blocklyDropDownDiv {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1000;
  display: none;
  border: 1px solid;
  border-color: #dadce0;
  background-color: #fff;
  border-radius: 2px;
  padding: 4px;
  box-shadow: 0 0 3px 1px rgba(0,0,0,.3);
}

.blocklyDropDownDiv.blocklyFocused {
  box-shadow: 0 0 6px 1px rgba(0,0,0,.3);
}

.blocklyDropDownContent {
  max-height: 300px;  // @todo: spec for maximum height.
  overflow: auto;
  overflow-x: hidden;
  position: relative;
}

.blocklyDropDownArrow {
  position: absolute;
  left: 0;
  top: 0;
  width: 16px;
  height: 16px;
  z-index: -1;
  background-color: inherit;
  border-color: inherit;
}

.blocklyDropDownButton {
  display: inline-block;
  float: left;
  padding: 0;
  margin: 4px;
  border-radius: 4px;
  outline: none;
  border: 1px solid;
  transition: box-shadow .1s;
  cursor: pointer;
}

.blocklyArrowTop {
  border-top: 1px solid;
  border-left: 1px solid;
  border-top-left-radius: 4px;
  border-color: inherit;
}

.blocklyArrowBottom {
  border-bottom: 1px solid;
  border-right: 1px solid;
  border-bottom-right-radius: 4px;
  border-color: inherit;
}

.blocklyResizeSE {
  cursor: se-resize;
  fill: #aaa;
}

.blocklyResizeSW {
  cursor: sw-resize;
  fill: #aaa;
}

.blocklyResizeLine {
  stroke: #515A5A;
  stroke-width: 1;
}

.blocklyHighlightedConnectionPath {
  fill: none;
  stroke: #fc3;
  stroke-width: 4px;
}

.blocklyPathLight {
  fill: none;
  stroke-linecap: round;
  stroke-width: 1;
}

.blocklySelected>.blocklyPathLight {
  display: none;
}

.blocklyDraggable {
  /* backup for browsers (e.g. IE11) that don't support grab */
  cursor: url("<<<PATH>>>/handopen.cur"), auto;
  cursor: grab;
  cursor: -webkit-grab;
}

    /* backup for browsers (e.g. IE11) that don't support grabbing */
  .blocklyDragging {
  /* backup for browsers (e.g. IE11) that don't support grabbing */
  cursor: url("<<<PATH>>>/handclosed.cur"), auto;
  cursor: grabbing;
  cursor: -webkit-grabbing;
}

    /* Changes cursor on mouse down. Not effective in Firefox because of
       https://bugzilla.mozilla.org/show_bug.cgi?id=771241 */
  .blocklyDraggable:active {
  /* backup for browsers (e.g. IE11) that don't support grabbing */
  cursor: url("<<<PATH>>>/handclosed.cur"), auto;
  cursor: grabbing;
  cursor: -webkit-grabbing;
  }

  /* Change the cursor on the whole drag surface in case the mouse gets
     ahead of block during a drag. This way the cursor is still a closed hand.
    */
  .blocklyBlockDragSurface .blocklyDraggable {
  /* backup for browsers (e.g. IE11) that don't support grabbing */
  cursor: url("<<<PATH>>>/handclosed.cur"), auto;
  cursor: grabbing;
  cursor: -webkit-grabbing;
}

.blocklyDragging.blocklyDraggingDelete {
  cursor: url("<<<PATH>>>/handdelete.cur"), auto;
}

.blocklyDragging>.blocklyPath,
.blocklyDragging>.blocklyPathLight {
  fill-opacity: .8;
  stroke-opacity: .8;
}

.blocklyDragging>.blocklyPathDark {
  display: none;
}

.blocklyDisabled>.blocklyPath {
  fill-opacity: .5;
  stroke-opacity: .5;
}

.blocklyDisabled>.blocklyPathLight,
.blocklyDisabled>.blocklyPathDark {
  display: none;
}

.blocklyInsertionMarker>.blocklyPath,
.blocklyInsertionMarker>.blocklyPathLight,
.blocklyInsertionMarker>.blocklyPathDark {
  fill-opacity: .2;
  stroke: none;
}

.blocklyMultilineText {
  font-family: monospace;
}

.blocklyNonEditableText>text {
  pointer-events: none;
}

.blocklyFlyout {
  position: absolute;
  z-index: 20;
}

.blocklyText text {
  cursor: default;
}

/*
  Don't allow users to select text.  It gets annoying when trying to
  drag a block and selected text moves instead.
*/
.blocklySvg text,
.blocklyBlockDragSurface text {
  user-select: none;
  -ms-user-select: none;
  -webkit-user-select: none;
  cursor: inherit;
}

.blocklyHidden {
  display: none;
}

.blocklyFieldDropdown:not(.blocklyHidden) {
  display: block;
}

.blocklyIconGroup {
  cursor: default;
}

.blocklyIconGroup:not(:hover),
.blocklyIconGroupReadonly {
  opacity: .6;
}

.blocklyIconShape {
  fill: #00f;
  stroke: #fff;
  stroke-width: 1px;
}

.blocklyWarningIconShape {
  fill: #ff8100;
  stroke: #fff;
  stroke-width: 1px;
}

.blocklyIconSymbol {
  fill: #fff;
}

.blocklyMinimalBody {
  margin: 0;
  padding: 0;
}

.blocklyMinimalBody {
  margin: 0;
  padding: 0;
}

.blocklyHtmlInput {
  border: none;
  border-radius: 4px;
  height: 100%;
  margin: 0;
  outline: none;
  padding: 0;
  width: 100%;
  text-align: center;
  display: block;
  box-sizing: border-box;
}

/* Edge and IE introduce a close icon when the input value is longer than a
   certain length. This affects our sizing calculations of the text input.
   Hiding the close icon to avoid that. */
.blocklyHtmlInput::-ms-clear {
  display: none;
}

.blocklyMainBackground {
  stroke-width: 1;
  stroke: #c6c6c6;  /* Equates to #ddd due to border being off-pixel. */
}

.blocklyMutatorBackground {
  fill: #fff;
  stroke: #ddd;
  stroke-width: 1;
}

.blocklyFlyoutBackground {
  fill: #eee;
}

.blocklyMainWorkspaceScrollbar {
  z-index: 20;
}

.blocklyFlyoutCloseButton {
  position: absolute;
  z-index: 20;
  width: 30px;
  height: 40px;
  cursor: pointer;
}

.blocklyFlyoutEndShadow {
  display: block;
  position: absolute;
  width: 10px;
  background-color: #eee;
  z-index: 21;
  box-shadow: -2px 0 5px #eee;
}

.blocklyFlyoutBookmarks {
  display: none;
  color: white;
  position: absolute;
  width: 25px;
  user-select: none;
  z-index: 21;
  overflow: visible;
  flex-direction: column;
}

.blocklyFlyoutBookmark {
  padding: 4px 6px;
  background-color: #eee;
  overflow: hidden;
}

.blocklyFlyoutBookmark:last-child {
  border-radius: 0 0 5px 0;
}

.blocklyFlyoutBookmarkActive {
  border-left: 3px solid #eee;
}

.blocklyFlyoutBookmarkFullText {
  color: transparent;
}

.blocklyFlyoutBookmark:hover {
  cursor: pointer;
  width: max-content;
  border-radius: 0 5px 5px 0;
}

.blocklyFlyoutBookmark:hover .blocklyFlyoutBookmarkFullText {
  color: inherit;
}

.blocklyFlyoutScrollbar {
  z-index: 30;
}

.blocklyScrollbarHorizontal,
.blocklyScrollbarVertical {
  position: absolute;
  outline: none;
}

.blocklyScrollbarBackground {
  opacity: 0;
}

.blocklyFlyoutZoomControlContainer {
  display: flex;
  position: absolute;
  align-items: center;
  justify-content: flex-end;
  user-select: none;
  height: 28px;
  padding: 4px;
  padding-right: 22px;
  background-color: #eee;
  z-index: 21;
}

.blocklyFlyoutZoomControl {
  fill: lightgrey;
  opacity: 0.45;
}

.blocklyFlyoutZoomControl:hover {
  fill: grey;
  cursor: pointer;
  opacity: 1;
}

.blocklyScrollbarHandle {
  fill: #ccc;
}


.blocklyScrollbarBackground {
  opacity: 0;
}

.blocklyScrollbarHandle {
  fill: #ccc;
}

.blocklyScrollbarBackground:hover+.blocklyScrollbarHandle,
.blocklyScrollbarHandle:hover {
  fill: #bbb;
}

/* Darken flyout scrollbars due to being on a grey background. */
/* By contrast, workspace scrollbars are on a white background. */
.blocklyFlyout .blocklyScrollbarHandle {
  fill: #bbb;
}

.blocklyFlyout .blocklyScrollbarBackground:hover+.blocklyScrollbarHandle,
.blocklyFlyout .blocklyScrollbarHandle:hover {
  fill: #aaa;
}

.blocklyInvalidInput {
  background: #faa;
}

.blocklyVerticalMarker {
  stroke-width: 3px;
  fill: rgba(255,255,255,.5);
  pointer-events: none;
}

.blocklyComputeCanvas {
  position: absolute;
  width: 0;
  height: 0;
}

.blocklyNoPointerEvents {
  pointer-events: none;
}

.blocklyContextMenu {
  border-radius: 4px;
  max-height: 100%;
}

.blockly-dropdown-search-input input {
  width: 100%;
  padding: 0px 6px;
  border: 2px solid #dddddd;
  border-radius: 3px;
  background-color: #f6f6f6;
}

.blocklyDropdownMenu {
  max-height: 265px;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 2px;
  padding: 0 !important;
}

.blocklyDropdownMenu .blocklyMenuItem {
  /* 28px on the left for icon or checkbox. */
  padding-left: 28px;
}

/* BiDi override for the resting state. */
.blocklyDropdownMenu .blocklyMenuItemRtl {
  /* Flip left/right padding for BiDi. */
  padding-left: 5px;
  padding-right: 28px;
}

.blocklyWidgetDiv .blocklyMenu {
  background: #fff;
  font: normal 13px Arial, sans-serif;
  margin: 0;
  outline: none;
  padding: 4px 0;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 265px;
  z-index: 20000;  /* Arbitrary, but some apps depend on it... */
}

.blocklyWidgetDiv .blocklyMenuWrapper {
  border: 1px solid;
  border-color: #dadce0;
  background-color: #fff;
  border-radius: 2px;
  padding: 4px;
  box-shadow: 0 0 3px 1px rgb(0 0 0 / 30%);
}

.blocklyWidgetDiv .blocklyMenu.blocklyFocused {
  box-shadow: 0 0 6px 1px rgba(0,0,0,.3);
}

.blocklyDropDownDiv .blocklyMenu {
  background: inherit;  /* Compatibility with gapi, reset from goog-menu */
  border: none;  /* Compatibility with gapi, reset from goog-menu */
  font: normal 13px "Helvetica Neue", Helvetica, sans-serif;
  outline: none;
  position: relative;  /* Compatibility with gapi, reset from goog-menu */
  z-index: 20000;  /* Arbitrary, but some apps depend on it... */
  margin-top: 5px;
}

.blocklyDropDownDiv .blocklyMenu:empty {
  margin: 0;
}

/* State: resting. */
.blocklyMenuItem {
  border: none;
  color: #000;
  cursor: pointer;
  list-style: none;
  margin: 0;
  /* 7em on the right for shortcut. */
  min-width: 7em;
  padding: 5px 15px;
  margin-bottom: 2px;
  white-space: nowrap;
}

/* State: disabled. */
.blocklyMenuItemDisabled {
  color: #ccc;
  cursor: inherit;
}

/* State: hover. */
.blocklyMenuItemHighlight {
  background-color: rgba(0,0,0,.1);
}

/* State: selected/checked. */
.blocklyMenuItemCheckbox {
  height: 16px;
  position: absolute;
  width: 16px;
}

.blocklyMenuItemSelected .blocklyMenuItemCheckbox {
  background: url(<<<PATH>>>/sprites.png) no-repeat -48px -16px;
  float: left;
  margin-left: -24px;
  position: static;  /* Scroll with the menu. */
}

.blocklyMenuItemText {
  margin-left: 5px;
}

.blocklyMenuItemRtl .blocklyMenuItemCheckbox {
  float: right;
  margin-right: -24px;
}

.blocklyTempBlockRoot {
  position: absolute;
  background: #eee;
  box-shadow: 0 0 5px #ccc;
  transform-origin: 0 0;
  user-select: none;
  z-index: 31;
}
`);
exports.content = content;
