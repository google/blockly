/**
 * @license
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A div that floats on top of the workspace, for drop-down menus.
 * The drop-down can be kept inside the workspace, animate in/out, etc.
 */

'use strict';

/**
 * A div that floats on top of the workspace, for drop-down menus.
 * @class
 */
goog.module('Blockly.dropDownDiv');

const common = goog.require('Blockly.common');
const dom = goog.require('Blockly.utils.dom');
const math = goog.require('Blockly.utils.math');
const style = goog.require('Blockly.utils.style');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {Field} = goog.requireType('Blockly.Field');
const {Rect} = goog.require('Blockly.utils.Rect');
/* eslint-disable-next-line no-unused-vars */
const {Size} = goog.requireType('Blockly.utils.Size');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');


/**
 * Arrow size in px. Should match the value in CSS
 * (need to position pre-render).
 * @type {number}
 * @const
 */
const ARROW_SIZE = 16;
exports.ARROW_SIZE = ARROW_SIZE;

/**
 * Drop-down border size in px. Should match the value in CSS (need to position
 * the arrow).
 * @type {number}
 * @const
 */
const BORDER_SIZE = 1;
exports.BORDER_SIZE = BORDER_SIZE;

/**
 * Amount the arrow must be kept away from the edges of the main drop-down div,
 * in px.
 * @type {number}
 * @const
 */
const ARROW_HORIZONTAL_PADDING = 12;
exports.ARROW_HORIZONTAL_PADDING = ARROW_HORIZONTAL_PADDING;

/**
 * Amount drop-downs should be padded away from the source, in px.
 * @type {number}
 * @const
 */
const PADDING_Y = 16;
exports.PADDING_Y = PADDING_Y;

/**
 * Length of animations in seconds.
 * @type {number}
 * @const
 */
const ANIMATION_TIME = 0.25;
exports.ANIMATION_TIME = ANIMATION_TIME;

/**
 * Timer for animation out, to be cleared if we need to immediately hide
 * without disrupting new shows.
 * @type {?number}
 */
let animateOutTimer = null;

/**
 * Callback for when the drop-down is hidden.
 * @type {?Function}
 */
let onHide = null;

/**
 * A class name representing the current owner's workspace renderer.
 * @type {string}
 */
let renderedClassName = '';

/**
 * A class name representing the current owner's workspace theme.
 * @type {string}
 */
let themeClassName = '';

/**
 * The content element.
 * @type {!HTMLDivElement}
 */
let div;

/**
 * The content element.
 * @type {!HTMLDivElement}
 */
let content;

/**
 * The arrow element.
 * @type {!HTMLDivElement}
 */
let arrow;

/**
 * Drop-downs will appear within the bounds of this element if possible.
 * Set in setBoundsElement.
 * @type {?Element}
 */
let boundsElement = null;

/**
 * The object currently using the drop-down.
 * @type {?Object}
 */
let owner = null;

/**
 * Whether the dropdown was positioned to a field or the source block.
 * @type {?boolean}
 */
let positionToField = null;

/**
 * Dropdown bounds info object used to encapsulate sizing information about a
 * bounding element (bounding box and width/height).
 * @typedef {{
 *        top:number,
 *        left:number,
 *        bottom:number,
 *        right:number,
 *        width:number,
 *        height:number
 * }}
 */
let BoundsInfo;
exports.BoundsInfo = BoundsInfo;

/**
 * Dropdown position metrics.
 * @typedef {{
 *        initialX:number,
 *        initialY:number,
 *        finalX:number,
 *        finalY:number,
 *        arrowX:?number,
 *        arrowY:?number,
 *        arrowAtTop:?boolean,
 *        arrowVisible:boolean
 * }}
 */
let PositionMetrics;
exports.PositionMetrics = PositionMetrics;

/**
 * Create and insert the DOM element for this div.
 * @package
 */
const createDom = function() {
  if (div) {
    return;  // Already created.
  }
  div = /** @type {!HTMLDivElement} */ (document.createElement('div'));
  div.className = 'blocklyDropDownDiv';
  const parentDiv = common.getParentContainer() || document.body;
  parentDiv.appendChild(div);

  content = /** @type {!HTMLDivElement} */ (document.createElement('div'));
  content.className = 'blocklyDropDownContent';
  div.appendChild(content);

  arrow = /** @type {!HTMLDivElement} */ (document.createElement('div'));
  arrow.className = 'blocklyDropDownArrow';
  div.appendChild(arrow);

  div.style.opacity = 0;

  // Transition animation for transform: translate() and opacity.
  div.style.transition = 'transform ' + ANIMATION_TIME + 's, ' +
      'opacity ' + ANIMATION_TIME + 's';

  // Handle focusin/out events to add a visual indicator when
  // a child is focused or blurred.
  div.addEventListener('focusin', function() {
    dom.addClass(div, 'blocklyFocused');
  });
  div.addEventListener('focusout', function() {
    dom.removeClass(div, 'blocklyFocused');
  });
};
exports.createDom = createDom;

/**
 * Set an element to maintain bounds within. Drop-downs will appear
 * within the box of this element if possible.
 * @param {?Element} boundsElem Element to bind drop-down to.
 */
const setBoundsElement = function(boundsElem) {
  boundsElement = boundsElem;
};
exports.setBoundsElement = setBoundsElement;

/**
 * Provide the div for inserting content into the drop-down.
 * @return {!Element} Div to populate with content.
 */
const getContentDiv = function() {
  return content;
};
exports.getContentDiv = getContentDiv;

/**
 * Clear the content of the drop-down.
 */
const clearContent = function() {
  content.textContent = '';
  content.style.width = '';
};
exports.clearContent = clearContent;

/**
 * Set the colour for the drop-down.
 * @param {string} backgroundColour Any CSS colour for the background.
 * @param {string} borderColour Any CSS colour for the border.
 */
const setColour = function(backgroundColour, borderColour) {
  div.style.backgroundColor = backgroundColour;
  div.style.borderColor = borderColour;
};
exports.setColour = setColour;

/**
 * Shortcut to show and place the drop-down with positioning determined
 * by a particular block. The primary position will be below the block,
 * and the secondary position above the block. Drop-down will be
 * constrained to the block's workspace.
 * @param {!Field} field The field showing the drop-down.
 * @param {!BlockSvg} block Block to position the drop-down around.
 * @param {Function=} opt_onHide Optional callback for when the drop-down is
 *   hidden.
 * @param {number=} opt_secondaryYOffset Optional Y offset for above-block
 *   positioning.
 * @return {boolean} True if the menu rendered below block; false if above.
 */
const showPositionedByBlock = function(
    field, block, opt_onHide, opt_secondaryYOffset) {
  return showPositionedByRect(
      getScaledBboxOfBlock(block), field, opt_onHide, opt_secondaryYOffset);
};
exports.showPositionedByBlock = showPositionedByBlock;

/**
 * Shortcut to show and place the drop-down with positioning determined
 * by a particular field. The primary position will be below the field,
 * and the secondary position above the field. Drop-down will be
 * constrained to the block's workspace.
 * @param {!Field} field The field to position the dropdown against.
 * @param {Function=} opt_onHide Optional callback for when the drop-down is
 *   hidden.
 * @param {number=} opt_secondaryYOffset Optional Y offset for above-block
 *   positioning.
 * @return {boolean} True if the menu rendered below block; false if above.
 */
const showPositionedByField = function(
    field, opt_onHide, opt_secondaryYOffset) {
  positionToField = true;
  return showPositionedByRect(
      getScaledBboxOfField(field), field, opt_onHide, opt_secondaryYOffset);
};
exports.showPositionedByField = showPositionedByField;

/**
 * Get the scaled bounding box of a block.
 * @param {!BlockSvg} block The block.
 * @return {!Rect} The scaled bounding box of the block.
 */
const getScaledBboxOfBlock = function(block) {
  const blockSvg = block.getSvgRoot();
  const bBox = blockSvg.getBBox();
  const scale = block.workspace.scale;
  const scaledHeight = bBox.height * scale;
  const scaledWidth = bBox.width * scale;
  const xy = style.getPageOffset(blockSvg);
  return new Rect(xy.y, xy.y + scaledHeight, xy.x, xy.x + scaledWidth);
};

/**
 * Get the scaled bounding box of a field.
 * @param {!Field} field The field.
 * @return {!Rect} The scaled bounding box of the field.
 */
const getScaledBboxOfField = function(field) {
  const bBox = field.getScaledBBox();
  return new Rect(bBox.top, bBox.bottom, bBox.left, bBox.right);
};

/**
 * Helper method to show and place the drop-down with positioning determined
 * by a scaled bounding box.  The primary position will be below the rect,
 * and the secondary position above the rect. Drop-down will be constrained to
 * the block's workspace.
 * @param {!Rect} bBox The scaled bounding box.
 * @param {!Field} field The field to position the dropdown against.
 * @param {Function=} opt_onHide Optional callback for when the drop-down is
 *   hidden.
 * @param {number=} opt_secondaryYOffset Optional Y offset for above-block
 *   positioning.
 * @return {boolean} True if the menu rendered below block; false if above.
 */
const showPositionedByRect = function(
    bBox, field, opt_onHide, opt_secondaryYOffset) {
  // If we can fit it, render below the block.
  const primaryX = bBox.left + (bBox.right - bBox.left) / 2;
  const primaryY = bBox.bottom;
  // If we can't fit it, render above the entire parent block.
  const secondaryX = primaryX;
  let secondaryY = bBox.top;
  if (opt_secondaryYOffset) {
    secondaryY += opt_secondaryYOffset;
  }
  const sourceBlock = /** @type {!BlockSvg} */ (field.getSourceBlock());
  // Set bounds to main workspace; show the drop-down.
  let workspace = sourceBlock.workspace;
  while (workspace.options.parentWorkspace) {
    workspace =
        /** @type {!WorkspaceSvg} */ (workspace.options.parentWorkspace);
  }
  setBoundsElement(
      /** @type {?Element} */ (workspace.getParentSvg().parentNode));
  return show(
      field, sourceBlock.RTL, primaryX, primaryY, secondaryX, secondaryY,
      opt_onHide);
};

/**
 * Show and place the drop-down.
 * The drop-down is placed with an absolute "origin point" (x, y) - i.e.,
 * the arrow will point at this origin and box will positioned below or above
 * it.  If we can maintain the container bounds at the primary point, the arrow
 * will point there, and the container will be positioned below it.
 * If we can't maintain the container bounds at the primary point, fall-back to
 * the secondary point and position above.
 * @param {?Object} newOwner The object showing the drop-down
 * @param {boolean} rtl Right-to-left (true) or left-to-right (false).
 * @param {number} primaryX Desired origin point x, in absolute px.
 * @param {number} primaryY Desired origin point y, in absolute px.
 * @param {number} secondaryX Secondary/alternative origin point x, in absolute
 *     px.
 * @param {number} secondaryY Secondary/alternative origin point y, in absolute
 *     px.
 * @param {Function=} opt_onHide Optional callback for when the drop-down is
 *     hidden.
 * @return {boolean} True if the menu rendered at the primary origin point.
 * @package
 */
const show = function(
    newOwner, rtl, primaryX, primaryY, secondaryX, secondaryY, opt_onHide) {
  owner = newOwner;
  onHide = opt_onHide || null;
  // Set direction.
  div.style.direction = rtl ? 'rtl' : 'ltr';

  const mainWorkspace =
      /** @type {!WorkspaceSvg} */ (common.getMainWorkspace());
  renderedClassName = mainWorkspace.getRenderer().getClassName();
  themeClassName = mainWorkspace.getTheme().getClassName();
  dom.addClass(div, renderedClassName);
  dom.addClass(div, themeClassName);

  // When we change `translate` multiple times in close succession,
  // Chrome may choose to wait and apply them all at once.
  // Since we want the translation to initial X, Y to be immediate,
  // and the translation to final X, Y to be animated,
  // we saw problems where both would be applied after animation was turned on,
  // making the dropdown appear to fly in from (0, 0).
  // Using both `left`, `top` for the initial translation and then `translate`
  // for the animated transition to final X, Y is a workaround.

  return positionInternal(primaryX, primaryY, secondaryX, secondaryY);
};
exports.show = show;

const internal = {};

/**
 * Get sizing info about the bounding element.
 * @return {!BoundsInfo} An object containing size
 *     information about the bounding element (bounding box and width/height).
 */
internal.getBoundsInfo = function() {
  const boundPosition = style.getPageOffset(
      /** @type {!Element} */ (boundsElement));
  const boundSize = style.getSize(
      /** @type {!Element} */ (boundsElement));

  return {
    left: boundPosition.x,
    right: boundPosition.x + boundSize.width,
    top: boundPosition.y,
    bottom: boundPosition.y + boundSize.height,
    width: boundSize.width,
    height: boundSize.height,
  };
};

/**
 * Helper to position the drop-down and the arrow, maintaining bounds.
 * See explanation of origin points in show.
 * @param {number} primaryX Desired origin point x, in absolute px.
 * @param {number} primaryY Desired origin point y, in absolute px.
 * @param {number} secondaryX Secondary/alternative origin point x,
 *     in absolute px.
 * @param {number} secondaryY Secondary/alternative origin point y,
 *     in absolute px.
 * @return {!PositionMetrics} Various final metrics,
 *     including rendered positions for drop-down and arrow.
 */
internal.getPositionMetrics = function(
    primaryX, primaryY, secondaryX, secondaryY) {
  const boundsInfo = internal.getBoundsInfo();
  const divSize = style.getSize(
      /** @type {!Element} */ (div));

  // Can we fit in-bounds below the target?
  if (primaryY + divSize.height < boundsInfo.bottom) {
    return getPositionBelowMetrics(primaryX, primaryY, boundsInfo, divSize);
  }
  // Can we fit in-bounds above the target?
  if (secondaryY - divSize.height > boundsInfo.top) {
    return getPositionAboveMetrics(secondaryX, secondaryY, boundsInfo, divSize);
  }
  // Can we fit outside the workspace bounds (but inside the window) below?
  if (primaryY + divSize.height < document.documentElement.clientHeight) {
    return getPositionBelowMetrics(primaryX, primaryY, boundsInfo, divSize);
  }
  // Can we fit outside the workspace bounds (but inside the window) above?
  if (secondaryY - divSize.height > document.documentElement.clientTop) {
    return getPositionAboveMetrics(secondaryX, secondaryY, boundsInfo, divSize);
  }

  // Last resort, render at top of page.
  return getPositionTopOfPageMetrics(primaryX, boundsInfo, divSize);
};

/**
 * Get the metrics for positioning the div below the source.
 * @param {number} primaryX Desired origin point x, in absolute px.
 * @param {number} primaryY Desired origin point y, in absolute px.
 * @param {!BoundsInfo} boundsInfo An object containing size
 *     information about the bounding element (bounding box and width/height).
 * @param {!Size} divSize An object containing information about
 *     the size of the DropDownDiv (width & height).
 * @return {!PositionMetrics} Various final metrics,
 *     including rendered positions for drop-down and arrow.
 */
const getPositionBelowMetrics = function(
    primaryX, primaryY, boundsInfo, divSize) {
  const xCoords =
      getPositionX(primaryX, boundsInfo.left, boundsInfo.right, divSize.width);

  const arrowY = -(ARROW_SIZE / 2 + BORDER_SIZE);
  const finalY = primaryY + PADDING_Y;

  return {
    initialX: xCoords.divX,
    initialY: primaryY,
    finalX: xCoords.divX,  // X position remains constant during animation.
    finalY: finalY,
    arrowX: xCoords.arrowX,
    arrowY: arrowY,
    arrowAtTop: true,
    arrowVisible: true,
  };
};

/**
 * Get the metrics for positioning the div above the source.
 * @param {number} secondaryX Secondary/alternative origin point x,
 *     in absolute px.
 * @param {number} secondaryY Secondary/alternative origin point y,
 *     in absolute px.
 * @param {!BoundsInfo} boundsInfo An object containing size
 *     information about the bounding element (bounding box and width/height).
 * @param {!Size} divSize An object containing information about
 *     the size of the DropDownDiv (width & height).
 * @return {!PositionMetrics} Various final metrics,
 *     including rendered positions for drop-down and arrow.
 */
const getPositionAboveMetrics = function(
    secondaryX, secondaryY, boundsInfo, divSize) {
  const xCoords = getPositionX(
      secondaryX, boundsInfo.left, boundsInfo.right, divSize.width);

  const arrowY = divSize.height - (BORDER_SIZE * 2) - (ARROW_SIZE / 2);
  const finalY = secondaryY - divSize.height - PADDING_Y;
  const initialY = secondaryY - divSize.height;  // No padding on Y.

  return {
    initialX: xCoords.divX,
    initialY: initialY,
    finalX: xCoords.divX,  // X position remains constant during animation.
    finalY: finalY,
    arrowX: xCoords.arrowX,
    arrowY: arrowY,
    arrowAtTop: false,
    arrowVisible: true,
  };
};

/**
 * Get the metrics for positioning the div at the top of the page.
 * @param {number} sourceX Desired origin point x, in absolute px.
 * @param {!BoundsInfo} boundsInfo An object containing size
 *     information about the bounding element (bounding box and width/height).
 * @param {!Size} divSize An object containing information about
 *     the size of the DropDownDiv (width & height).
 * @return {!PositionMetrics} Various final metrics,
 *     including rendered positions for drop-down and arrow.
 */
const getPositionTopOfPageMetrics = function(sourceX, boundsInfo, divSize) {
  const xCoords =
      getPositionX(sourceX, boundsInfo.left, boundsInfo.right, divSize.width);

  // No need to provide arrow-specific information because it won't be visible.
  return {
    initialX: xCoords.divX,
    initialY: 0,
    finalX: xCoords.divX,  // X position remains constant during animation.
    finalY: 0,             // Y position remains constant during animation.
    arrowAtTop: null,
    arrowX: null,
    arrowY: null,
    arrowVisible: false,
  };
};

/**
 * Get the x positions for the left side of the DropDownDiv and the arrow,
 * accounting for the bounds of the workspace.
 * @param {number} sourceX Desired origin point x, in absolute px.
 * @param {number} boundsLeft The left edge of the bounding element, in
 *    absolute px.
 * @param {number} boundsRight The right edge of the bounding element, in
 *    absolute px.
 * @param {number} divWidth The width of the div in px.
 * @return {{divX: number, arrowX: number}} An object containing metrics for
 *    the x positions of the left side of the DropDownDiv and the arrow.
 * @package
 */
const getPositionX = function(sourceX, boundsLeft, boundsRight, divWidth) {
  let divX = sourceX;
  // Offset the topLeft coord so that the dropdowndiv is centered.
  divX -= divWidth / 2;
  // Fit the dropdowndiv within the bounds of the workspace.
  divX = math.clamp(boundsLeft, divX, boundsRight - divWidth);

  let arrowX = sourceX;
  // Offset the arrow coord so that the arrow is centered.
  arrowX -= ARROW_SIZE / 2;
  // Convert the arrow position to be relative to the top left of the div.
  let relativeArrowX = arrowX - divX;
  const horizPadding = ARROW_HORIZONTAL_PADDING;
  // Clamp the arrow position so that it stays attached to the dropdowndiv.
  relativeArrowX = math.clamp(
      horizPadding, relativeArrowX, divWidth - horizPadding - ARROW_SIZE);

  return {arrowX: relativeArrowX, divX: divX};
};
exports.getPositionX = getPositionX;

/**
 * Is the container visible?
 * @return {boolean} True if visible.
 */
const isVisible = function() {
  return !!owner;
};
exports.isVisible = isVisible;

/**
 * Hide the menu only if it is owned by the provided object.
 * @param {?Object} divOwner Object which must be owning the drop-down to hide.
 * @param {boolean=} opt_withoutAnimation True if we should hide the dropdown
 *     without animating.
 * @return {boolean} True if hidden.
 */
const hideIfOwner = function(divOwner, opt_withoutAnimation) {
  if (owner === divOwner) {
    if (opt_withoutAnimation) {
      hideWithoutAnimation();
    } else {
      hide();
    }
    return true;
  }
  return false;
};
exports.hideIfOwner = hideIfOwner;

/**
 * Hide the menu, triggering animation.
 */
const hide = function() {
  // Start the animation by setting the translation and fading out.
  // Reset to (initialX, initialY) - i.e., no translation.
  div.style.transform = 'translate(0, 0)';
  div.style.opacity = 0;
  // Finish animation - reset all values to default.
  animateOutTimer = setTimeout(function() {
    hideWithoutAnimation();
  }, ANIMATION_TIME * 1000);
  if (onHide) {
    onHide();
    onHide = null;
  }
};
exports.hide = hide;

/**
 * Hide the menu, without animation.
 */
const hideWithoutAnimation = function() {
  if (!isVisible()) {
    return;
  }
  if (animateOutTimer) {
    clearTimeout(animateOutTimer);
  }

  // Reset style properties in case this gets called directly
  // instead of hide() - see discussion on #2551.
  div.style.transform = '';
  div.style.left = '';
  div.style.top = '';
  div.style.opacity = 0;
  div.style.display = 'none';
  div.style.backgroundColor = '';
  div.style.borderColor = '';

  if (onHide) {
    onHide();
    onHide = null;
  }
  clearContent();
  owner = null;

  if (renderedClassName) {
    dom.removeClass(div, renderedClassName);
    renderedClassName = '';
  }
  if (themeClassName) {
    dom.removeClass(div, themeClassName);
    themeClassName = '';
  }
  (/** @type {!WorkspaceSvg} */ (common.getMainWorkspace())).markFocused();
};
exports.hideWithoutAnimation = hideWithoutAnimation;

/**
 * Set the dropdown div's position.
 * @param {number} primaryX Desired origin point x, in absolute px.
 * @param {number} primaryY Desired origin point y, in absolute px.
 * @param {number} secondaryX Secondary/alternative origin point x,
 *    in absolute px.
 * @param {number} secondaryY Secondary/alternative origin point y,
 *    in absolute px.
 * @return {boolean} True if the menu rendered at the primary origin point.
 */
const positionInternal = function(primaryX, primaryY, secondaryX, secondaryY) {
  const metrics =
      internal.getPositionMetrics(primaryX, primaryY, secondaryX, secondaryY);

  // Update arrow CSS.
  if (metrics.arrowVisible) {
    arrow.style.display = '';
    arrow.style.transform = 'translate(' + metrics.arrowX + 'px,' +
        metrics.arrowY + 'px) rotate(45deg)';
    arrow.setAttribute(
        'class',
        metrics.arrowAtTop ? 'blocklyDropDownArrow blocklyArrowTop' :
                             'blocklyDropDownArrow blocklyArrowBottom');
  } else {
    arrow.style.display = 'none';
  }

  const initialX = Math.floor(metrics.initialX);
  const initialY = Math.floor(metrics.initialY);
  const finalX = Math.floor(metrics.finalX);
  const finalY = Math.floor(metrics.finalY);

  // First apply initial translation.
  div.style.left = initialX + 'px';
  div.style.top = initialY + 'px';

  // Show the div.
  div.style.display = 'block';
  div.style.opacity = 1;
  // Add final translate, animated through `transition`.
  // Coordinates are relative to (initialX, initialY),
  // where the drop-down is absolutely positioned.
  const dx = finalX - initialX;
  const dy = finalY - initialY;
  div.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';

  return !!metrics.arrowAtTop;
};

/**
 * Repositions the dropdownDiv on window resize. If it doesn't know how to
 * calculate the new position, it will just hide it instead.
 * @package
 */
const repositionForWindowResize = function() {
  // This condition mainly catches the dropdown div when it is being used as a
  // dropdown.  It is important not to close it in this case because on Android,
  // when a field is focused, the soft keyboard opens triggering a window resize
  // event and we want the dropdown div to stick around so users can type into
  // it.
  if (owner) {
    const field = /** @type {!Field} */ (owner);
    const block = /** @type {!BlockSvg} */ (field.getSourceBlock());
    const bBox = positionToField ? getScaledBboxOfField(field) :
                                   getScaledBboxOfBlock(block);
    // If we can fit it, render below the block.
    const primaryX = bBox.left + (bBox.right - bBox.left) / 2;
    const primaryY = bBox.bottom;
    // If we can't fit it, render above the entire parent block.
    const secondaryX = primaryX;
    const secondaryY = bBox.top;
    positionInternal(primaryX, primaryY, secondaryX, secondaryY);
  } else {
    hide();
  }
};
exports.repositionForWindowResize = repositionForWindowResize;

exports.TEST_ONLY = internal;
