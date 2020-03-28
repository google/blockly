/**
 * @license
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A div that floats on top of the workspace, for drop-down menus.
 * The drop-down can be kept inside the workspace, animate in/out, etc.
 * @author tmickel@mit.edu (Tim Mickel)
 */

'use strict';

goog.provide('Blockly.DropDownDiv');

goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.math');
goog.require('Blockly.utils.style');


/**
 * Class for drop-down div.
 * @constructor
 * @package
 */
Blockly.DropDownDiv = function() {
};

/**
 * Drop-downs will appear within the bounds of this element if possible.
 * Set in Blockly.DropDownDiv.setBoundsElement.
 * @type {Element}
 * @private
 */
Blockly.DropDownDiv.boundsElement_ = null;

/**
 * The object currently using the drop-down.
 * @type {Object}
 * @private
 */
Blockly.DropDownDiv.owner_ = null;

/**
 * Whether the dropdown was positioned to a field or the source block.
 * @type {?boolean}
 * @private
 */
Blockly.DropDownDiv.positionToField_ = null;

/**
 * Arrow size in px. Should match the value in CSS
 * (need to position pre-render).
 * @type {number}
 * @const
 */
Blockly.DropDownDiv.ARROW_SIZE = 16;

/**
 * Drop-down border size in px. Should match the value in CSS (need to position
 * the arrow).
 * @type {number}
 * @const
 */
Blockly.DropDownDiv.BORDER_SIZE = 1;

/**
 * Amount the arrow must be kept away from the edges of the main drop-down div,
 * in px.
 * @type {number}
 * @const
 */
Blockly.DropDownDiv.ARROW_HORIZONTAL_PADDING = 12;

/**
 * Amount drop-downs should be padded away from the source, in px.
 * @type {number}
 * @const
 */
Blockly.DropDownDiv.PADDING_Y = 16;

/**
 * Length of animations in seconds.
 * @type {number}
 * @const
 */
Blockly.DropDownDiv.ANIMATION_TIME = 0.25;

/**
 * Timer for animation out, to be cleared if we need to immediately hide
 * without disrupting new shows.
 * @type {?number}
 * @private
 */
Blockly.DropDownDiv.animateOutTimer_ = null;

/**
 * Callback for when the drop-down is hidden.
 * @type {?Function}
 * @private
 */
Blockly.DropDownDiv.onHide_ = null;

/**
 * A class name representing the current owner's workspace renderer.
 * @type {string}
 * @private
 */
Blockly.DropDownDiv.rendererClassName_ = '';

/**
 * A class name representing the current owner's workspace theme.
 * @type {string}
 * @private
 */
Blockly.DropDownDiv.themeClassName_ = '';

/**
 * Create and insert the DOM element for this div.
 * @package
 */
Blockly.DropDownDiv.createDom = function() {
  if (Blockly.DropDownDiv.DIV_) {
    return;  // Already created.
  }
  var div = document.createElement('div');
  div.className = 'blocklyDropDownDiv';
  var container = Blockly.parentContainer || document.body;
  container.appendChild(div);
  /**
   * The div element.
   * @type {!Element}
   * @private
   */
  Blockly.DropDownDiv.DIV_ = div;

  var content = document.createElement('div');
  content.className = 'blocklyDropDownContent';
  div.appendChild(content);
  /**
   * The content element.
   * @type {!Element}
   * @private
   */
  Blockly.DropDownDiv.content_ = content;

  var arrow = document.createElement('div');
  arrow.className = 'blocklyDropDownArrow';
  div.appendChild(arrow);
  /**
   * The arrow element.
   * @type {!Element}
   * @private
   */
  Blockly.DropDownDiv.arrow_ = arrow;

  Blockly.DropDownDiv.DIV_.style.opacity = 0;

  // Transition animation for transform: translate() and opacity.
  Blockly.DropDownDiv.DIV_.style.transition = 'transform ' +
    Blockly.DropDownDiv.ANIMATION_TIME + 's, ' +
    'opacity ' + Blockly.DropDownDiv.ANIMATION_TIME + 's';

  // Handle focusin/out events to add a visual indicator when
  // a child is focused or blurred.
  div.addEventListener('focusin', function() {
    Blockly.utils.dom.addClass(div, 'focused');
  });
  div.addEventListener('focusout', function() {
    Blockly.utils.dom.removeClass(div, 'focused');
  });
};

/**
 * Set an element to maintain bounds within. Drop-downs will appear
 * within the box of this element if possible.
 * @param {Element} boundsElement Element to bind drop-down to.
 */
Blockly.DropDownDiv.setBoundsElement = function(boundsElement) {
  Blockly.DropDownDiv.boundsElement_ = boundsElement;
};

/**
 * Provide the div for inserting content into the drop-down.
 * @return {Element} Div to populate with content
 */
Blockly.DropDownDiv.getContentDiv = function() {
  return Blockly.DropDownDiv.content_;
};

/**
 * Clear the content of the drop-down.
 */
Blockly.DropDownDiv.clearContent = function() {
  Blockly.DropDownDiv.content_.textContent = '';
  Blockly.DropDownDiv.content_.style.width = '';
};

/**
 * Set the colour for the drop-down.
 * @param {string} backgroundColour Any CSS colour for the background.
 * @param {string} borderColour Any CSS colour for the border.
 */
Blockly.DropDownDiv.setColour = function(backgroundColour, borderColour) {
  Blockly.DropDownDiv.DIV_.style.backgroundColor = backgroundColour;
  Blockly.DropDownDiv.DIV_.style.borderColor = borderColour;
};

/**
 * Shortcut to show and place the drop-down with positioning determined
 * by a particular block. The primary position will be below the block,
 * and the secondary position above the block. Drop-down will be
 * constrained to the block's workspace.
 * @param {!Blockly.Field} field The field showing the drop-down.
 * @param {!Blockly.Block} block Block to position the drop-down around.
 * @param {Function=} opt_onHide Optional callback for when the drop-down is
 *   hidden.
 * @param {number=} opt_secondaryYOffset Optional Y offset for above-block
 *   positioning.
 * @return {boolean} True if the menu rendered below block; false if above.
 */
Blockly.DropDownDiv.showPositionedByBlock = function(field, block,
    opt_onHide, opt_secondaryYOffset) {
  return Blockly.DropDownDiv.showPositionedByRect_(
      Blockly.DropDownDiv.getScaledBboxOfBlock_(block),
      field, opt_onHide, opt_secondaryYOffset);
};

/**
 * Shortcut to show and place the drop-down with positioning determined
 * by a particular field. The primary position will be below the field,
 * and the secondary position above the field. Drop-down will be
 * constrained to the block's workspace.
 * @param {!Blockly.Field} field The field to position the dropdown against.
 * @param {Function=} opt_onHide Optional callback for when the drop-down is
 *   hidden.
 * @param {number=} opt_secondaryYOffset Optional Y offset for above-block
 *   positioning.
 * @return {boolean} True if the menu rendered below block; false if above.
 */
Blockly.DropDownDiv.showPositionedByField = function(field,
    opt_onHide, opt_secondaryYOffset) {
  Blockly.DropDownDiv.positionToField_ = true;
  return Blockly.DropDownDiv.showPositionedByRect_(
      Blockly.DropDownDiv.getScaledBboxOfField_(field),
      field, opt_onHide, opt_secondaryYOffset);
};

/**
 * Get the scaled bounding box of a block.
 * @param {!Blockly.Block} block The block.
 * @return {!Blockly.utils.Rect} The scaled bounding box of the block.
 * @private
 */
Blockly.DropDownDiv.getScaledBboxOfBlock_ = function(block) {
  var blockSvg = block.getSvgRoot();
  var bBox = blockSvg.getBBox();
  var scale = block.workspace.scale;
  var scaledHeight = bBox.height * scale;
  var scaledWidth = bBox.width * scale;
  var xy = Blockly.utils.style.getPageOffset(blockSvg);
  return new Blockly.utils.Rect(
      xy.y, xy.y + scaledHeight, xy.x, xy.x + scaledWidth);
};

/**
 * Get the scaled bounding box of a field.
 * @param {!Blockly.Field} field The field.
 * @return {!Blockly.utils.Rect} The scaled bounding box of the field.
 * @private
 */
Blockly.DropDownDiv.getScaledBboxOfField_ = function(field) {
  var bBox = field.getScaledBBox();
  return new Blockly.utils.Rect(
      bBox.top, bBox.bottom, bBox.left, bBox.right);
};

/**
 * Helper method to show and place the drop-down with positioning determined
 * by a scaled bounding box.  The primary position will be below the rect,
 * and the secondary position above the rect. Drop-down will be constrained to
 * the block's workspace.
 * @param {!Blockly.utils.Rect} bBox The scaled bounding box.
 * @param {!Blockly.Field} field The field to position the dropdown against.
 * @param {Function=} opt_onHide Optional callback for when the drop-down is
 *   hidden.
 * @param {number=} opt_secondaryYOffset Optional Y offset for above-block
 *   positioning.
 * @return {boolean} True if the menu rendered below block; false if above.
 * @private
 */
Blockly.DropDownDiv.showPositionedByRect_ = function(bBox, field,
    opt_onHide, opt_secondaryYOffset) {
  // If we can fit it, render below the block.
  var primaryX = bBox.left + (bBox.right - bBox.left) / 2;
  var primaryY = bBox.bottom;
  // If we can't fit it, render above the entire parent block.
  var secondaryX = primaryX;
  var secondaryY = bBox.top;
  if (opt_secondaryYOffset) {
    secondaryY += opt_secondaryYOffset;
  }
  var sourceBlock = field.getSourceBlock();
  // Set bounds to workspace; show the drop-down.
  Blockly.DropDownDiv.setBoundsElement(
      sourceBlock.workspace.getParentSvg().parentNode);
  return Blockly.DropDownDiv.show(
      field, sourceBlock.RTL,
      primaryX, primaryY, secondaryX, secondaryY, opt_onHide);
};

/**
 * Show and place the drop-down.
 * The drop-down is placed with an absolute "origin point" (x, y) - i.e.,
 * the arrow will point at this origin and box will positioned below or above
 * it.  If we can maintain the container bounds at the primary point, the arrow
 * will point there, and the container will be positioned below it.
 * If we can't maintain the container bounds at the primary point, fall-back to
 * the secondary point and position above.
 * @param {Object} owner The object showing the drop-down
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
Blockly.DropDownDiv.show = function(owner, rtl, primaryX, primaryY,
    secondaryX, secondaryY, opt_onHide) {
  Blockly.DropDownDiv.owner_ = owner;
  Blockly.DropDownDiv.onHide_ = opt_onHide || null;
  // Set direction.
  var div = Blockly.DropDownDiv.DIV_;
  div.style.direction = rtl ? 'rtl' : 'ltr';

  Blockly.DropDownDiv.rendererClassName_ =
      Blockly.getMainWorkspace().getRenderer().getClassName();
  Blockly.DropDownDiv.themeClassName_ =
      Blockly.getMainWorkspace().getTheme().getClassName();
  Blockly.utils.dom.addClass(div, Blockly.DropDownDiv.rendererClassName_);
  Blockly.utils.dom.addClass(div, Blockly.DropDownDiv.themeClassName_);

  // When we change `translate` multiple times in close succession,
  // Chrome may choose to wait and apply them all at once.
  // Since we want the translation to initial X, Y to be immediate,
  // and the translation to final X, Y to be animated,
  // we saw problems where both would be applied after animation was turned on,
  // making the dropdown appear to fly in from (0, 0).
  // Using both `left`, `top` for the initial translation and then `translate`
  // for the animated transition to final X, Y is a workaround.

  return Blockly.DropDownDiv.positionInternal_(
      primaryX, primaryY, secondaryX, secondaryY);
};

/**
 * Get sizing info about the bounding element.
 * @return {!Object} An object containing size information about the bounding
 *   element (bounding box and width/height).
 * @private
 */
Blockly.DropDownDiv.getBoundsInfo_ = function() {
  var boundPosition = Blockly.utils.style.getPageOffset(
      /** @type {!Element} */ (Blockly.DropDownDiv.boundsElement_));
  var boundSize = Blockly.utils.style.getSize(
      /** @type {!Element} */ (Blockly.DropDownDiv.boundsElement_));

  return {
    left: boundPosition.x,
    right: boundPosition.x + boundSize.width,
    top: boundPosition.y,
    bottom: boundPosition.y + boundSize.height,
    width: boundSize.width,
    height: boundSize.height
  };
};

/**
 * Helper to position the drop-down and the arrow, maintaining bounds.
 * See explanation of origin points in Blockly.DropDownDiv.show.
 * @param {number} primaryX Desired origin point x, in absolute px.
 * @param {number} primaryY Desired origin point y, in absolute px.
 * @param {number} secondaryX Secondary/alternative origin point x,
 *    in absolute px.
 * @param {number} secondaryY Secondary/alternative origin point y,
 *    in absolute px.
 * @return {Object} Various final metrics, including rendered positions
 *    for drop-down and arrow.
 * @private
 */
Blockly.DropDownDiv.getPositionMetrics_ = function(primaryX, primaryY,
    secondaryX, secondaryY) {
  var boundsInfo = Blockly.DropDownDiv.getBoundsInfo_();
  var divSize = Blockly.utils.style.getSize(
      /** @type {!Element} */ (Blockly.DropDownDiv.DIV_));

  // Can we fit in-bounds below the target?
  if (primaryY + divSize.height < boundsInfo.bottom) {
    return Blockly.DropDownDiv.getPositionBelowMetrics_(
        primaryX, primaryY, boundsInfo, divSize);
  }
  // Can we fit in-bounds above the target?
  if (secondaryY - divSize.height > boundsInfo.top) {
    return Blockly.DropDownDiv.getPositionAboveMetrics_(
        secondaryX, secondaryY, boundsInfo, divSize);
  }
  // Can we fit outside the workspace bounds (but inside the window) below?
  if (primaryY + divSize.height < document.documentElement.clientHeight) {
    return Blockly.DropDownDiv.getPositionBelowMetrics_(
        primaryX, primaryY, boundsInfo, divSize);
  }
  // Can we fit outside the workspace bounds (but inside the window) above?
  if (secondaryY - divSize.height > document.documentElement.clientTop) {
    return Blockly.DropDownDiv.getPositionAboveMetrics_(
        secondaryX, secondaryY, boundsInfo, divSize);
  }

  // Last resort, render at top of page.
  return Blockly.DropDownDiv.getPositionTopOfPageMetrics_(
      primaryX, boundsInfo, divSize);
};

/**
 * Get the metrics for positioning the div below the source.
 * @param {number} primaryX Desired origin point x, in absolute px.
 * @param {number} primaryY Desired origin point y, in absolute px.
 * @param {!Object} boundsInfo An object containing size information about the
 *    bounding element (bounding box and width/height).
 * @param {!Object} divSize An object containing information about the size
 *    of the DropDownDiv (width & height).
 * @return {Object} Various final metrics, including rendered positions
 *    for drop-down and arrow.
 * @private
 */
Blockly.DropDownDiv.getPositionBelowMetrics_ = function(
    primaryX, primaryY, boundsInfo, divSize) {

  var xCoords = Blockly.DropDownDiv.getPositionX(
      primaryX, boundsInfo.left, boundsInfo.right, divSize.width);

  var arrowY = -(Blockly.DropDownDiv.ARROW_SIZE / 2 +
      Blockly.DropDownDiv.BORDER_SIZE);
  var finalY = primaryY + Blockly.DropDownDiv.PADDING_Y;

  return {
    initialX: xCoords.divX,
    initialY : primaryY,
    finalX: xCoords.divX, // X position remains constant during animation.
    finalY: finalY,
    arrowX: xCoords.arrowX,
    arrowY: arrowY,
    arrowAtTop: true,
    arrowVisible: true
  };
};

/**
 * Get the metrics for positioning the div above the source.
 * @param {number} secondaryX Secondary/alternative origin point x,
 *    in absolute px.
 * @param {number} secondaryY Secondary/alternative origin point y,
 *    in absolute px.
 * @param {!Object} boundsInfo An object containing size information about the
 *    bounding element (bounding box and width/height).
 * @param {!Object} divSize An object containing information about the size
 *    of the DropDownDiv (width & height).
 * @return {Object} Various final metrics, including rendered positions
 *    for drop-down and arrow.
 * @private
 */
Blockly.DropDownDiv.getPositionAboveMetrics_ = function(
    secondaryX, secondaryY, boundsInfo, divSize) {

  var xCoords = Blockly.DropDownDiv.getPositionX(
      secondaryX, boundsInfo.left, boundsInfo.right, divSize.width);

  var arrowY = divSize.height - (Blockly.DropDownDiv.BORDER_SIZE * 2) -
      (Blockly.DropDownDiv.ARROW_SIZE / 2);
  var finalY = secondaryY - divSize.height - Blockly.DropDownDiv.PADDING_Y;
  var initialY = secondaryY - divSize.height; // No padding on Y

  return {
    initialX: xCoords.divX,
    initialY : initialY,
    finalX: xCoords.divX, // X position remains constant during animation.
    finalY: finalY,
    arrowX: xCoords.arrowX,
    arrowY: arrowY,
    arrowAtTop: false,
    arrowVisible: true
  };
};

/**
 * Get the metrics for positioning the div at the top of the page.
 * @param {number} sourceX Desired origin point x, in absolute px.
 * @param {!Object} boundsInfo An object containing size information about the
 *    bounding element (bounding box and width/height).
 * @param {!Object} divSize An object containing information about the size
 *    of the DropDownDiv (width & height).
 * @return {Object} Various final metrics, including rendered positions
 *    for drop-down and arrow.
 * @private
 */
Blockly.DropDownDiv.getPositionTopOfPageMetrics_ = function(
    sourceX, boundsInfo, divSize) {

  var xCoords = Blockly.DropDownDiv.getPositionX(
      sourceX, boundsInfo.left, boundsInfo.right, divSize.width);

  // No need to provide arrow-specific information because it won't be visible.
  return {
    initialX: xCoords.divX,
    initialY : 0,
    finalX: xCoords.divX, // X position remains constant during animation.
    finalY: 0,            // Y position remains constant during animation.
    arrowVisible: false
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
Blockly.DropDownDiv.getPositionX = function(
    sourceX, boundsLeft, boundsRight, divWidth) {
  var arrowX, divX;
  arrowX = divX = sourceX;

  // Offset the topLeft coord so that the dropdowndiv is centered.
  divX -= divWidth / 2;
  // Fit the dropdowndiv within the bounds of the workspace.
  divX = Blockly.utils.math.clamp(boundsLeft, divX, boundsRight - divWidth);

  // Offset the arrow coord so that the arrow is centered.
  arrowX -= Blockly.DropDownDiv.ARROW_SIZE / 2;
  // Convert the arrow position to be relative to the top left of the div.
  var relativeArrowX = arrowX - divX;
  var horizPadding = Blockly.DropDownDiv.ARROW_HORIZONTAL_PADDING;
  // Clamp the arrow position so that it stays attached to the dropdowndiv.
  relativeArrowX = Blockly.utils.math.clamp(
      horizPadding,
      relativeArrowX,
      divWidth - horizPadding - Blockly.DropDownDiv.ARROW_SIZE);

  return {
    arrowX: relativeArrowX,
    divX: divX
  };
};

/**
 * Is the container visible?
 * @return {boolean} True if visible.
 */
Blockly.DropDownDiv.isVisible = function() {
  return !!Blockly.DropDownDiv.owner_;
};

/**
 * Hide the menu only if it is owned by the provided object.
 * @param {Object} owner Object which must be owning the drop-down to hide.
 * @param {boolean=} opt_withoutAnimation True if we should hide the dropdown
 *     without animating.
 * @return {boolean} True if hidden.
 */
Blockly.DropDownDiv.hideIfOwner = function(owner, opt_withoutAnimation) {
  if (Blockly.DropDownDiv.owner_ === owner) {
    if (opt_withoutAnimation) {
      Blockly.DropDownDiv.hideWithoutAnimation();
    } else {
      Blockly.DropDownDiv.hide();
    }
    return true;
  }
  return false;
};

/**
 * Hide the menu, triggering animation.
 */
Blockly.DropDownDiv.hide = function() {
  // Start the animation by setting the translation and fading out.
  var div = Blockly.DropDownDiv.DIV_;
  // Reset to (initialX, initialY) - i.e., no translation.
  div.style.transform = 'translate(0, 0)';
  div.style.opacity = 0;
  // Finish animation - reset all values to default.
  Blockly.DropDownDiv.animateOutTimer_ =
      setTimeout(function() {
        Blockly.DropDownDiv.hideWithoutAnimation();
      }, Blockly.DropDownDiv.ANIMATION_TIME * 1000);
  if (Blockly.DropDownDiv.onHide_) {
    Blockly.DropDownDiv.onHide_();
    Blockly.DropDownDiv.onHide_ = null;
  }
};

/**
 * Hide the menu, without animation.
 */
Blockly.DropDownDiv.hideWithoutAnimation = function() {
  if (!Blockly.DropDownDiv.isVisible()) {
    return;
  }
  if (Blockly.DropDownDiv.animateOutTimer_) {
    clearTimeout(Blockly.DropDownDiv.animateOutTimer_);
  }

  // Reset style properties in case this gets called directly
  // instead of hide() - see discussion on #2551.
  var div = Blockly.DropDownDiv.DIV_;
  div.style.transform = '';
  div.style.left = '';
  div.style.top = '';
  div.style.opacity = 0;
  div.style.display = 'none';
  div.style.backgroundColor = '';
  div.style.borderColor = '';

  if (Blockly.DropDownDiv.onHide_) {
    Blockly.DropDownDiv.onHide_();
    Blockly.DropDownDiv.onHide_ = null;
  }
  Blockly.DropDownDiv.clearContent();
  Blockly.DropDownDiv.owner_ = null;

  if (Blockly.DropDownDiv.rendererClassName_) {
    Blockly.utils.dom.removeClass(div, Blockly.DropDownDiv.rendererClassName_);
    Blockly.DropDownDiv.rendererClassName_ = '';
  }
  if (Blockly.DropDownDiv.themeClassName_) {
    Blockly.utils.dom.removeClass(div, Blockly.DropDownDiv.themeClassName_);
    Blockly.DropDownDiv.themeClassName_ = '';
  }
  Blockly.getMainWorkspace().markFocused();
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
 * @private
 */
Blockly.DropDownDiv.positionInternal_ = function(
    primaryX, primaryY, secondaryX, secondaryY) {
  var metrics = Blockly.DropDownDiv.getPositionMetrics_(primaryX, primaryY,
      secondaryX, secondaryY);

  // Update arrow CSS.
  if (metrics.arrowVisible) {
    Blockly.DropDownDiv.arrow_.style.display = '';
    Blockly.DropDownDiv.arrow_.style.transform = 'translate(' +
        metrics.arrowX + 'px,' + metrics.arrowY + 'px) rotate(45deg)';
    Blockly.DropDownDiv.arrow_.setAttribute('class', metrics.arrowAtTop ?
        'blocklyDropDownArrow blocklyArrowTop' :
        'blocklyDropDownArrow blocklyArrowBottom');
  } else {
    Blockly.DropDownDiv.arrow_.style.display = 'none';
  }

  var initialX = Math.floor(metrics.initialX);
  var initialY = Math.floor(metrics.initialY);
  var finalX = Math.floor(metrics.finalX);
  var finalY = Math.floor(metrics.finalY);

  var div = Blockly.DropDownDiv.DIV_;
  // First apply initial translation.
  div.style.left = initialX + 'px';
  div.style.top = initialY + 'px';

  // Show the div.
  div.style.display = 'block';
  div.style.opacity = 1;
  // Add final translate, animated through `transition`.
  // Coordinates are relative to (initialX, initialY),
  // where the drop-down is absolutely positioned.
  var dx = finalX - initialX;
  var dy = finalY - initialY;
  div.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';

  return metrics.arrowAtTop;
};

/**
 * Repositions the dropdownDiv on window resize. If it doesn't know how to
 * calculate the new position, it will just hide it instead.
 * @package
 */
Blockly.DropDownDiv.repositionForWindowResize = function() {
  // This condition mainly catches the dropdown div when it is being used as a
  // dropdown.  It is important not to close it in this case because on Android,
  // when a field is focused, the soft keyboard opens triggering a window resize
  // event and we want the dropdown div to stick around so users can type into
  // it.
  if (Blockly.DropDownDiv.owner_) {
    var field = /** @type {!Blockly.Field} */ (Blockly.DropDownDiv.owner_);
    var block = Blockly.DropDownDiv.owner_.getSourceBlock();
    var bBox = Blockly.DropDownDiv.positionToField_ ?
        Blockly.DropDownDiv.getScaledBboxOfField_(field) :
        Blockly.DropDownDiv.getScaledBboxOfBlock_(block);
    // If we can fit it, render below the block.
    var primaryX = bBox.left + (bBox.right - bBox.left) / 2;
    var primaryY = bBox.bottom;
    // If we can't fit it, render above the entire parent block.
    var secondaryX = primaryX;
    var secondaryY = bBox.top;
    Blockly.DropDownDiv.positionInternal_(
        primaryX, primaryY, secondaryX, secondaryY);
  } else {
    Blockly.DropDownDiv.hide();
  }
};
