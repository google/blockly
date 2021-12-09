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
goog.module('Blockly.DropDownDiv');

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
 * Class for drop-down div.
 * @constructor
 * @package
 * @alias Blockly.DropDownDiv
 */
const DropDownDiv = function() {};

/**
 * Arrow size in px. Should match the value in CSS
 * (need to position pre-render).
 * @type {number}
 * @const
 */
DropDownDiv.ARROW_SIZE = 16;

/**
 * Drop-down border size in px. Should match the value in CSS (need to position
 * the arrow).
 * @type {number}
 * @const
 */
DropDownDiv.BORDER_SIZE = 1;

/**
 * Amount the arrow must be kept away from the edges of the main drop-down div,
 * in px.
 * @type {number}
 * @const
 */
DropDownDiv.ARROW_HORIZONTAL_PADDING = 12;

/**
 * Amount drop-downs should be padded away from the source, in px.
 * @type {number}
 * @const
 */
DropDownDiv.PADDING_Y = 16;

/**
 * Length of animations in seconds.
 * @type {number}
 * @const
 */
DropDownDiv.ANIMATION_TIME = 0.25;

/**
 * Timer for animation out, to be cleared if we need to immediately hide
 * without disrupting new shows.
 * @type {?number}
 * @private
 */
DropDownDiv.animateOutTimer_ = null;

/**
 * Callback for when the drop-down is hidden.
 * @type {?Function}
 * @private
 */
DropDownDiv.onHide_ = null;

/**
 * A class name representing the current owner's workspace renderer.
 * @type {string}
 * @private
 */
DropDownDiv.rendererClassName_ = '';

/**
 * A class name representing the current owner's workspace theme.
 * @type {string}
 * @private
 */
DropDownDiv.themeClassName_ = '';

/**
 * The content element.
 * @type {!Element}
 * @private
 */
DropDownDiv.DIV_;

/**
 * The content element.
 * @type {!Element}
 * @private
 */
DropDownDiv.content_;

/**
 * The arrow element.
 * @type {!Element}
 * @private
 */
DropDownDiv.arrow_;

/**
 * Drop-downs will appear within the bounds of this element if possible.
 * Set in DropDownDiv.setBoundsElement.
 * @type {?Element}
 * @private
 */
DropDownDiv.boundsElement_ = null;

/**
 * The object currently using the drop-down.
 * @type {?Object}
 * @private
 */
DropDownDiv.owner_ = null;

/**
 * Whether the dropdown was positioned to a field or the source block.
 * @type {?boolean}
 * @private
 */
DropDownDiv.positionToField_ = null;

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
DropDownDiv.BoundsInfo;

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
DropDownDiv.PositionMetrics;

/**
 * Create and insert the DOM element for this div.
 * @package
 */
DropDownDiv.createDom = function() {
  if (DropDownDiv.DIV_) {
    return;  // Already created.
  }
  const containerDiv = document.createElement('div');
  containerDiv.className = 'blocklyDropDownDiv';
  const parentDiv = common.getParentContainer() || document.body;
  parentDiv.appendChild(containerDiv);

  DropDownDiv.DIV_ = containerDiv;

  const content = document.createElement('div');
  content.className = 'blocklyDropDownContent';
  DropDownDiv.DIV_.appendChild(content);
  DropDownDiv.content_ = content;

  const arrow = document.createElement('div');
  arrow.className = 'blocklyDropDownArrow';
  DropDownDiv.DIV_.appendChild(arrow);
  DropDownDiv.arrow_ = arrow;

  DropDownDiv.DIV_.style.opacity = 0;

  // Transition animation for transform: translate() and opacity.
  DropDownDiv.DIV_.style.transition = 'transform ' +
      DropDownDiv.ANIMATION_TIME + 's, ' +
      'opacity ' + DropDownDiv.ANIMATION_TIME + 's';

  // Handle focusin/out events to add a visual indicator when
  // a child is focused or blurred.
  DropDownDiv.DIV_.addEventListener('focusin', function() {
    dom.addClass(DropDownDiv.DIV_, 'blocklyFocused');
  });
  DropDownDiv.DIV_.addEventListener('focusout', function() {
    dom.removeClass(DropDownDiv.DIV_, 'blocklyFocused');
  });
};

/**
 * Set an element to maintain bounds within. Drop-downs will appear
 * within the box of this element if possible.
 * @param {?Element} boundsElement Element to bind drop-down to.
 */
DropDownDiv.setBoundsElement = function(boundsElement) {
  DropDownDiv.boundsElement_ = boundsElement;
};

/**
 * Provide the div for inserting content into the drop-down.
 * @return {!Element} Div to populate with content.
 */
DropDownDiv.getContentDiv = function() {
  return DropDownDiv.content_;
};

/**
 * Clear the content of the drop-down.
 */
DropDownDiv.clearContent = function() {
  DropDownDiv.content_.textContent = '';
  DropDownDiv.content_.style.width = '';
};

/**
 * Set the colour for the drop-down.
 * @param {string} backgroundColour Any CSS colour for the background.
 * @param {string} borderColour Any CSS colour for the border.
 */
DropDownDiv.setColour = function(backgroundColour, borderColour) {
  DropDownDiv.DIV_.style.backgroundColor = backgroundColour;
  DropDownDiv.DIV_.style.borderColor = borderColour;
};

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
DropDownDiv.showPositionedByBlock = function(
    field, block, opt_onHide, opt_secondaryYOffset) {
  return showPositionedByRect(
      getScaledBboxOfBlock(block), field, opt_onHide, opt_secondaryYOffset);
};

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
DropDownDiv.showPositionedByField = function(
    field, opt_onHide, opt_secondaryYOffset) {
  DropDownDiv.positionToField_ = true;
  return showPositionedByRect(
      getScaledBboxOfField(field), field, opt_onHide, opt_secondaryYOffset);
};

const internal = {};

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
  DropDownDiv.setBoundsElement(
      /** @type {?Element} */ (workspace.getParentSvg().parentNode));
  return DropDownDiv.show(
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
 * @param {?Object} owner The object showing the drop-down
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
DropDownDiv.show = function(
    owner, rtl, primaryX, primaryY, secondaryX, secondaryY, opt_onHide) {
  DropDownDiv.owner_ = owner;
  DropDownDiv.onHide_ = opt_onHide || null;
  // Set direction.
  const div = DropDownDiv.DIV_;
  div.style.direction = rtl ? 'rtl' : 'ltr';

  const mainWorkspace =
      /** @type {!WorkspaceSvg} */ (common.getMainWorkspace());
  DropDownDiv.rendererClassName_ = mainWorkspace.getRenderer().getClassName();
  DropDownDiv.themeClassName_ = mainWorkspace.getTheme().getClassName();
  dom.addClass(div, DropDownDiv.rendererClassName_);
  dom.addClass(div, DropDownDiv.themeClassName_);

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

/**
 * Get sizing info about the bounding element.
 * @return {!DropDownDiv.BoundsInfo} An object containing size
 *     information about the bounding element (bounding box and width/height).
 */
internal.getBoundsInfo = function() {
  const boundPosition = style.getPageOffset(
      /** @type {!Element} */ (DropDownDiv.boundsElement_));
  const boundSize = style.getSize(
      /** @type {!Element} */ (DropDownDiv.boundsElement_));

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
 * See explanation of origin points in DropDownDiv.show.
 * @param {number} primaryX Desired origin point x, in absolute px.
 * @param {number} primaryY Desired origin point y, in absolute px.
 * @param {number} secondaryX Secondary/alternative origin point x,
 *     in absolute px.
 * @param {number} secondaryY Secondary/alternative origin point y,
 *     in absolute px.
 * @return {!DropDownDiv.PositionMetrics} Various final metrics,
 *     including rendered positions for drop-down and arrow.
 */
internal.getPositionMetrics = function(
    primaryX, primaryY, secondaryX, secondaryY) {
  const boundsInfo = internal.getBoundsInfo();
  const divSize = style.getSize(
      /** @type {!Element} */ (DropDownDiv.DIV_));

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
 * @param {!DropDownDiv.BoundsInfo} boundsInfo An object containing size
 *     information about the bounding element (bounding box and width/height).
 * @param {!Size} divSize An object containing information about
 *     the size of the DropDownDiv (width & height).
 * @return {!DropDownDiv.PositionMetrics} Various final metrics,
 *     including rendered positions for drop-down and arrow.
 */
const getPositionBelowMetrics = function(
    primaryX, primaryY, boundsInfo, divSize) {
  const xCoords = DropDownDiv.getPositionX(
      primaryX, boundsInfo.left, boundsInfo.right, divSize.width);

  const arrowY = -(DropDownDiv.ARROW_SIZE / 2 + DropDownDiv.BORDER_SIZE);
  const finalY = primaryY + DropDownDiv.PADDING_Y;

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
 * @param {!DropDownDiv.BoundsInfo} boundsInfo An object containing size
 *     information about the bounding element (bounding box and width/height).
 * @param {!Size} divSize An object containing information about
 *     the size of the DropDownDiv (width & height).
 * @return {!DropDownDiv.PositionMetrics} Various final metrics,
 *     including rendered positions for drop-down and arrow.
 */
const getPositionAboveMetrics = function(
    secondaryX, secondaryY, boundsInfo, divSize) {
  const xCoords = DropDownDiv.getPositionX(
      secondaryX, boundsInfo.left, boundsInfo.right, divSize.width);

  const arrowY = divSize.height - (DropDownDiv.BORDER_SIZE * 2) -
      (DropDownDiv.ARROW_SIZE / 2);
  const finalY = secondaryY - divSize.height - DropDownDiv.PADDING_Y;
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
 * @param {!DropDownDiv.BoundsInfo} boundsInfo An object containing size
 *     information about the bounding element (bounding box and width/height).
 * @param {!Size} divSize An object containing information about
 *     the size of the DropDownDiv (width & height).
 * @return {!DropDownDiv.PositionMetrics} Various final metrics,
 *     including rendered positions for drop-down and arrow.
 */
const getPositionTopOfPageMetrics = function(sourceX, boundsInfo, divSize) {
  const xCoords = DropDownDiv.getPositionX(
      sourceX, boundsInfo.left, boundsInfo.right, divSize.width);

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
DropDownDiv.getPositionX = function(
    sourceX, boundsLeft, boundsRight, divWidth) {
  let divX = sourceX;
  // Offset the topLeft coord so that the dropdowndiv is centered.
  divX -= divWidth / 2;
  // Fit the dropdowndiv within the bounds of the workspace.
  divX = math.clamp(boundsLeft, divX, boundsRight - divWidth);

  let arrowX = sourceX;
  // Offset the arrow coord so that the arrow is centered.
  arrowX -= DropDownDiv.ARROW_SIZE / 2;
  // Convert the arrow position to be relative to the top left of the div.
  let relativeArrowX = arrowX - divX;
  const horizPadding = DropDownDiv.ARROW_HORIZONTAL_PADDING;
  // Clamp the arrow position so that it stays attached to the dropdowndiv.
  relativeArrowX = math.clamp(
      horizPadding, relativeArrowX,
      divWidth - horizPadding - DropDownDiv.ARROW_SIZE);

  return {arrowX: relativeArrowX, divX: divX};
};

/**
 * Is the container visible?
 * @return {boolean} True if visible.
 */
DropDownDiv.isVisible = function() {
  return !!DropDownDiv.owner_;
};

/**
 * Hide the menu only if it is owned by the provided object.
 * @param {?Object} owner Object which must be owning the drop-down to hide.
 * @param {boolean=} opt_withoutAnimation True if we should hide the dropdown
 *     without animating.
 * @return {boolean} True if hidden.
 */
DropDownDiv.hideIfOwner = function(owner, opt_withoutAnimation) {
  if (DropDownDiv.owner_ === owner) {
    if (opt_withoutAnimation) {
      DropDownDiv.hideWithoutAnimation();
    } else {
      DropDownDiv.hide();
    }
    return true;
  }
  return false;
};

/**
 * Hide the menu, triggering animation.
 */
DropDownDiv.hide = function() {
  // Start the animation by setting the translation and fading out.
  // Reset to (initialX, initialY) - i.e., no translation.
  DropDownDiv.DIV_.style.transform = 'translate(0, 0)';
  DropDownDiv.DIV_.style.opacity = 0;
  // Finish animation - reset all values to default.
  DropDownDiv.animateOutTimer_ = setTimeout(function() {
    DropDownDiv.hideWithoutAnimation();
  }, DropDownDiv.ANIMATION_TIME * 1000);
  if (DropDownDiv.onHide_) {
    DropDownDiv.onHide_();
    DropDownDiv.onHide_ = null;
  }
};

/**
 * Hide the menu, without animation.
 */
DropDownDiv.hideWithoutAnimation = function() {
  if (!DropDownDiv.isVisible()) {
    return;
  }
  if (DropDownDiv.animateOutTimer_) {
    clearTimeout(DropDownDiv.animateOutTimer_);
  }

  // Reset style properties in case this gets called directly
  // instead of hide() - see discussion on #2551.
  const div = DropDownDiv.DIV_;
  div.style.transform = '';
  div.style.left = '';
  div.style.top = '';
  div.style.opacity = 0;
  div.style.display = 'none';
  div.style.backgroundColor = '';
  div.style.borderColor = '';

  if (DropDownDiv.onHide_) {
    DropDownDiv.onHide_();
    DropDownDiv.onHide_ = null;
  }
  DropDownDiv.clearContent();
  DropDownDiv.owner_ = null;

  if (DropDownDiv.rendererClassName_) {
    dom.removeClass(div, DropDownDiv.rendererClassName_);
    DropDownDiv.rendererClassName_ = '';
  }
  if (DropDownDiv.themeClassName_) {
    dom.removeClass(div, DropDownDiv.themeClassName_);
    DropDownDiv.themeClassName_ = '';
  }
  (/** @type {!WorkspaceSvg} */ (common.getMainWorkspace())).markFocused();
};

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
    DropDownDiv.arrow_.style.display = '';
    DropDownDiv.arrow_.style.transform = 'translate(' + metrics.arrowX + 'px,' +
        metrics.arrowY + 'px) rotate(45deg)';
    DropDownDiv.arrow_.setAttribute(
        'class',
        metrics.arrowAtTop ? 'blocklyDropDownArrow blocklyArrowTop' :
                             'blocklyDropDownArrow blocklyArrowBottom');
  } else {
    DropDownDiv.arrow_.style.display = 'none';
  }

  const initialX = Math.floor(metrics.initialX);
  const initialY = Math.floor(metrics.initialY);
  const finalX = Math.floor(metrics.finalX);
  const finalY = Math.floor(metrics.finalY);

  const div = DropDownDiv.DIV_;
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
DropDownDiv.repositionForWindowResize = function() {
  // This condition mainly catches the dropdown div when it is being used as a
  // dropdown.  It is important not to close it in this case because on Android,
  // when a field is focused, the soft keyboard opens triggering a window resize
  // event and we want the dropdown div to stick around so users can type into
  // it.
  if (DropDownDiv.owner_) {
    const field = /** @type {!Field} */ (DropDownDiv.owner_);
    const block = /** @type {!BlockSvg} */ (field.getSourceBlock());
    const bBox = DropDownDiv.positionToField_ ? getScaledBboxOfField(field) :
                                                getScaledBboxOfBlock(block);
    // If we can fit it, render below the block.
    const primaryX = bBox.left + (bBox.right - bBox.left) / 2;
    const primaryY = bBox.bottom;
    // If we can't fit it, render above the entire parent block.
    const secondaryX = primaryX;
    const secondaryY = bBox.top;
    positionInternal(primaryX, primaryY, secondaryX, secondaryY);
  } else {
    DropDownDiv.hide();
  }
};

DropDownDiv.TEST_ONLY = internal;

exports.DropDownDiv = DropDownDiv;
