/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.Css

/** Has CSS already been injected? */
let injected = false;

/**
 * Add some CSS to the blob that will be injected later.  Allows optional
 * components such as fields and the toolbox to store separate CSS.
 *
 * @param cssContent Multiline CSS string or an array of single lines of CSS.
 */
export function register(cssContent: string) {
  if (injected) {
    throw Error('CSS already injected');
  }
  content += '\n' + cssContent;
}

/**
 * Inject the CSS into the DOM.  This is preferable over using a regular CSS
 * file since:
 * a) It loads synchronously and doesn't force a redraw later.
 * b) It speeds up loading by not blocking on a separate HTTP transfer.
 * c) The CSS content may be made dynamic depending on init options.
 *
 * @param hasCss If false, don't inject CSS (providing CSS becomes the
 *     document's responsibility).
 * @param pathToMedia Path from page to the Blockly media directory.
 */
export function inject(hasCss: boolean, pathToMedia: string) {
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
  // Cleanup the collected css content after injecting it to the DOM.
  content = '';

  // Inject CSS tag at start of head.
  const cssNode = document.createElement('style');
  cssNode.id = 'blockly-common-style';
  const cssTextNode = document.createTextNode(cssContent);
  cssNode.appendChild(cssTextNode);
  document.head.insertBefore(cssNode, document.head.firstChild);
}

/**
 * The CSS content for Blockly.
 */
let content = `
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
  max-height: 300px;  /* @todo: spec for maximum height. */
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
  cursor: grab;
  cursor: -webkit-grab;
}

.blocklyDragging {
  cursor: grabbing;
  cursor: -webkit-grabbing;
}

  /* Changes cursor on mouse down. Not effective in Firefox because of
     https://bugzilla.mozilla.org/show_bug.cgi?id=771241 */
.blocklyDraggable:active {
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
.blocklySvg text {
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

.blocklyIconSymbol {
  fill: #fff;
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

/* Remove the increase and decrease arrows on the field number editor */
input.blocklyHtmlInput[type=number]::-webkit-inner-spin-button,
input.blocklyHtmlInput[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
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
  fill: #ddd;
  fill-opacity: .8;
}

.blocklyMainWorkspaceScrollbar {
  z-index: 20;
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

.blocklyDropdownMenu {
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
  border: 1px solid transparent;
  box-shadow: 0 0 3px 1px rgba(0,0,0,.3);
  font: normal 13px Arial, sans-serif;
  margin: 0;
  outline: none;
  padding: 4px 0;
  position: absolute;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 100%;
  z-index: 20000;  /* Arbitrary, but some apps depend on it... */
}

.blocklyWidgetDiv .blocklyMenu.blocklyFocused {
  box-shadow: 0 0 6px 1px rgba(0,0,0,.3);
}

.blocklyDropDownDiv .blocklyMenu {
  background: inherit;  /* Compatibility with gapi, reset from goog-menu */
  border: inherit;  /* Compatibility with gapi, reset from goog-menu */
  font: normal 13px "Helvetica Neue", Helvetica, sans-serif;
  outline: none;
  position: relative;  /* Compatibility with gapi, reset from goog-menu */
  z-index: 20000;  /* Arbitrary, but some apps depend on it... */
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
  padding: 6px 15px;
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

.blocklyMenuItemRtl .blocklyMenuItemCheckbox {
  float: right;
  margin-right: -24px;
}

.blocklyBlockDragSurface {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: visible !important;
  z-index: 80;
  pointer-events: none;
}
`;
