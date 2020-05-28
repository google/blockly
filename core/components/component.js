/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Definition of the Blockly.Component class.
 * This class is similar to Closure's goog.ui.Component class.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.Component');

goog.provide('Blockly.Component.Error');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.IdGenerator');
goog.require('Blockly.utils.style');


/**
 * Default implementation of a UI component.
 * Similar to Closure's goog.ui.Component.
 *
 * @constructor
 */
Blockly.Component = function() {

  /**
   * Whether the component is rendered right-to-left.
   * @type {boolean}
   * @protected
   */
  this.rightToLeft_ = Blockly.Component.defaultRightToLeft;

  /**
   * Unique ID of the component, lazily initialized in {@link
   * Blockly.Component#getId} if needed.  This property is strictly private and
   * must not be accessed directly outside of this class!
   * @type {?string}
   * @private
   */
  this.id_ = null;

  /**
   * Whether the component is in the document.
   * @type {boolean}
   * @private
   */
  this.inDocument_ = false;

  /**
   * The DOM element for the component.
   * @type {?Element}
   * @private
   */
  this.element_ = null;

  /**
   * Parent component to which events will be propagated.  This property is
   * strictly private and must not be accessed directly outside of this class!
   * @type {?Blockly.Component}
   * @private
   */
  this.parent_ = null;

  /**
   * Array of child components.
   * Must be kept in sync with `childIndex_`.  This property is strictly
   * private and must not be accessed directly outside of this class!
   * @type {?Array.<?Blockly.Component>}
   * @private
   */
  this.children_ = [];

  /**
   * Map of child component IDs to child components.  Used for constant-time
   * random access to child components by ID.
   * Must be kept in sync with `children_`.  This property is strictly
   * private and must not be accessed directly outside of this class!
   *
   * @type {?Object}
   * @private
   */
  this.childIndex_ = {};

  /**
   * Whether or not the component has been disposed.
   * @type {boolean}
   * @private
   */
  this.disposed_ = false;
};


/**
 * The default right to left value.
 * @type {boolean}
 * @package
 */
Blockly.Component.defaultRightToLeft = false;

/**
 * Errors thrown by the component.
 * @enum {string}
 */
Blockly.Component.Error = {
  /**
   * Error when the component is already rendered and another render attempt is
   * made.
   */
  ALREADY_RENDERED: 'Component already rendered',

  /**
   * Error when an attempt is made to set the parent of a component in a way
   * that would result in an inconsistent object graph.
   */
  PARENT_UNABLE_TO_BE_SET: 'Unable to set parent component',

  /**
   * Error when an attempt is made to add a child component at an out-of-bounds
   * index.  We don't support sparse child arrays.
   */
  CHILD_INDEX_OUT_OF_BOUNDS: 'Child component index out of bounds',

  /**
   * Error when calling an abstract method that should be overriden.
   */
  ABSTRACT_METHOD: 'Unimplemented abstract method'
};

/**
 * Gets the unique ID for the instance of this component.  If the instance
 * doesn't already have an ID, generates one on the fly.
 * @return {string} Unique component ID.
 * @package
 */
Blockly.Component.prototype.getId = function() {
  return this.id_ || (this.id_ = Blockly.utils.IdGenerator.getNextUniqueId());
};

/**
 * Gets the component's element.
 * @return {Element} The element for the component.
 * @package
 */
Blockly.Component.prototype.getElement = function() {
  return this.element_;
};

/**
 * Sets the component's root element to the given element.  Considered
 * protected and final.
 *
 * This should generally only be called during createDom. Setting the element
 * does not actually change which element is rendered, only the element that is
 * associated with this UI component.
 *
 * This should only be used by subclasses and its associated renderers.
 *
 * @param {Element} element Root element for the component.
 * @protected
 */
Blockly.Component.prototype.setElementInternal = function(element) {
  this.element_ = element;
};

/**
 * Sets the parent of this component to use for event bubbling.  Throws an error
 * if the component already has a parent or if an attempt is made to add a
 * component to itself as a child.
 * @param {Blockly.Component} parent The parent component.
 * @protected
 */
Blockly.Component.prototype.setParent = function(parent) {
  if (this == parent) {
    // Attempting to add a child to itself is an error.
    throw Error(Blockly.Component.Error.PARENT_UNABLE_TO_BE_SET);
  }

  if (parent && this.parent_ && this.id_ && this.parent_.getChild(this.id_) &&
      this.parent_ != parent) {
    // This component is already the child of some parent.
    throw Error(Blockly.Component.Error.PARENT_UNABLE_TO_BE_SET);
  }

  this.parent_ = parent;
};

/**
 * Returns the component's parent, if any.
 * @return {?Blockly.Component} The parent component.
 * @protected
 */
Blockly.Component.prototype.getParent = function() {
  return this.parent_;
};

/**
 * Determines whether the component has been added to the document.
 * @return {boolean} TRUE if rendered. Otherwise, FALSE.
 * @protected
 */
Blockly.Component.prototype.isInDocument = function() {
  return this.inDocument_;
};

/**
 * Creates the initial DOM representation for the component.
 * @protected
 */
Blockly.Component.prototype.createDom = function() {
  throw Error(Blockly.Component.Error.ABSTRACT_METHOD);
};

/**
 * Renders the component.  If a parent element is supplied, the component's
 * element will be appended to it.  If there is no optional parent element and
 * the element doesn't have a parentNode then it will be appended to the
 * document body.
 *
 * If this component has a parent component, and the parent component is
 * not in the document already, then this will not call `enterDocument`
 * on this component.
 *
 * Throws an Error if the component is already rendered.
 *
 * @param {Element=} opt_parentElement Optional parent element to render the
 *    component into.
 * @package
 */
Blockly.Component.prototype.render = function(opt_parentElement) {
  this.render_(opt_parentElement);
};

/**
 * Renders the component.  If a parent element is supplied, the component's
 * element will be appended to it.  If there is no optional parent element and
 * the element doesn't have a parentNode then it will be appended to the
 * document body.
 *
 * If this component has a parent component, and the parent component is
 * not in the document already, then this will not call `enterDocument`
 * on this component.
 *
 * Throws an Error if the component is already rendered.
 *
 * @param {Element=} opt_parentElement Optional parent element to render the
 *    component into.
 * @param {Node=} opt_beforeNode Node before which the component is to
 *    be rendered.  If left out the node is appended to the parent element.
 * @private
 */
Blockly.Component.prototype.render_ = function(
    opt_parentElement, opt_beforeNode) {
  if (this.inDocument_) {
    throw Error(Blockly.Component.Error.ALREADY_RENDERED);
  }

  if (!this.element_) {
    this.createDom();
  }

  if (opt_parentElement) {
    opt_parentElement.insertBefore(this.element_, opt_beforeNode || null);
  } else {
    document.body.appendChild(this.element_);
  }

  // If this component has a parent component that isn't in the document yet,
  // we don't call enterDocument() here.  Instead, when the parent component
  // enters the document, the enterDocument() call will propagate to its
  // children, including this one.  If the component doesn't have a parent
  // or if the parent is already in the document, we call enterDocument().
  if (!this.parent_ || this.parent_.isInDocument()) {
    this.enterDocument();
  }
};

/**
 * Called when the component's element is known to be in the document. Anything
 * using document.getElementById etc. should be done at this stage.
 *
 * If the component contains child components, this call is propagated to its
 * children.
 * @protected
 */
Blockly.Component.prototype.enterDocument = function() {
  this.inDocument_ = true;

  // Propagate enterDocument to child components that have a DOM, if any.
  // If a child was decorated before entering the document (permitted when
  // Blockly.Component.ALLOW_DETACHED_DECORATION is true), its enterDocument
  // will be called here.
  this.forEachChild(function(child) {
    if (!child.isInDocument() && child.getElement()) {
      child.enterDocument();
    }
  });
};

/**
 * Called by dispose to clean up the elements and listeners created by a
 * component, or by a parent component/application who has removed the
 * component from the document but wants to reuse it later.
 *
 * If the component contains child components, this call is propagated to its
 * children.
 *
 * It should be possible for the component to be rendered again once this method
 * has been called.
 * @protected
 */
Blockly.Component.prototype.exitDocument = function() {
  // Propagate exitDocument to child components that have been rendered, if any.
  this.forEachChild(function(child) {
    if (child.isInDocument()) {
      child.exitDocument();
    }
  });

  this.inDocument_ = false;
};

/**
 * Disposes of the object. If the object hasn't already been disposed of, calls
 * {@link #disposeInternal}.
 * @package
 */
Blockly.Component.prototype.dispose = function() {
  if (!this.disposed_) {
    // Set disposed_ to true first, in case during the chain of disposal this
    // gets disposed recursively.
    this.disposed_ = true;
    this.disposeInternal();
  }
};

/**
 * Disposes of the component.  Calls `exitDocument`, which is expected to
 * remove event handlers and clean up the component.  Propagates the call to
 * the component's children, if any. Removes the component's DOM from the
 * document.
 * @protected
 */
Blockly.Component.prototype.disposeInternal = function() {
  if (this.inDocument_) {
    this.exitDocument();
  }

  // Disposes of the component's children, if any.
  this.forEachChild(function(child) { child.dispose(); });

  // Detach the component's element from the DOM.
  if (this.element_) {
    Blockly.utils.dom.removeNode(this.element_);
  }

  this.children_ = null;
  this.childIndex_ = null;
  this.element_ = null;
  this.parent_ = null;
};

/**
 * Adds the specified component as the last child of this component.  See
 * {@link Blockly.Component#addChildAt} for detailed semantics.
 *
 * @see Blockly.Component#addChildAt
 * @param {Blockly.Component} child The new child component.
 * @param {boolean=} opt_render If true, the child component will be rendered
 *    into the parent.
 * @package
 */
Blockly.Component.prototype.addChild = function(child, opt_render) {
  this.addChildAt(child, this.getChildCount(), opt_render);
};

/**
 * Adds the specified component as a child of this component at the given
 * 0-based index.
 *
 * Both `addChild` and `addChildAt` assume the following contract
 * between parent and child components:
 *  <ul>
 *    <li>the child component's element must be a descendant of the parent
 *        component's element, and
 *    <li>the DOM state of the child component must be consistent with the DOM
 *        state of the parent component (see `isInDocument`) in the
 *        steady state -- the exception is to addChildAt(child, i, false) and
 *        then immediately decorate/render the child.
 *  </ul>
 *
 * In particular, `parent.addChild(child)` will throw an error if the
 * child component is already in the document, but the parent isn't.
 *
 * Clients of this API may call `addChild` and `addChildAt` with
 * `opt_render` set to true.  If `opt_render` is true, calling these
 * methods will automatically render the child component's element into the
 * parent component's element. If the parent does not yet have an element, then
 * `createDom` will automatically be invoked on the parent before
 * rendering the child.
 *
 * Invoking {@code parent.addChild(child, true)} will throw an error if the
 * child component is already in the document, regardless of the parent's DOM
 * state.
 *
 * If `opt_render` is true and the parent component is not already
 * in the document, `enterDocument` will not be called on this component
 * at this point.
 *
 * Finally, this method also throws an error if the new child already has a
 * different parent, or the given index is out of bounds.
 *
 * @see Blockly.Component#addChild
 * @param {Blockly.Component} child The new child component.
 * @param {number} index 0-based index at which the new child component is to be
 *    added; must be between 0 and the current child count (inclusive).
 * @param {boolean=} opt_render If true, the child component will be rendered
 *    into the parent.
 * @protected
 */
Blockly.Component.prototype.addChildAt = function(child, index, opt_render) {
  if (child.inDocument_ && (opt_render || !this.inDocument_)) {
    // Adding a child that's already in the document is an error, except if the
    // parent is also in the document and opt_render is false (e.g. decorate()).
    throw Error(Blockly.Component.Error.ALREADY_RENDERED);
  }

  if (index < 0 || index > this.getChildCount()) {
    // Allowing sparse child arrays would lead to strange behavior, so we don't.
    throw Error(Blockly.Component.Error.CHILD_INDEX_OUT_OF_BOUNDS);
  }

  // Moving child within component, remove old reference.
  this.childIndex_[child.getId()] = child;
  if (child.getParent() == this) {
    // Remove from this.children_
    var i = this.children_.indexOf(child);
    if (i > -1) {
      this.children_.splice(i, 1);
    }
  }

  // Set the parent of the child to this component.  This throws an error if
  // the child is already contained by another component.
  child.setParent(this);
  this.children_.splice(index, 0, child);

  if (child.inDocument_ && this.inDocument_ && child.getParent() == this) {
    // Changing the position of an existing child, move the DOM node (if
    // necessary).
    var contentElement = this.getContentElement();
    var insertBeforeElement = contentElement.childNodes[index] || null;
    if (insertBeforeElement != child.getElement()) {
      contentElement.insertBefore(child.getElement(), insertBeforeElement);
    }
  } else if (opt_render) {
    // If this (parent) component doesn't have a DOM yet, call createDom now
    // to make sure we render the child component's element into the correct
    // parent element (otherwise render_ with a null first argument would
    // render the child into the document body, which is almost certainly not
    // what we want).
    if (!this.element_) {
      this.createDom();
    }
    // Render the child into the parent at the appropriate location.  Note that
    // getChildAt(index + 1) returns undefined if inserting at the end.
    var sibling = this.getChildAt(index + 1);
    // render_() calls enterDocument() if the parent is already in the document.
    child.render_(this.getContentElement(), sibling ? sibling.element_ : null);
  } else if (this.inDocument_ && !child.inDocument_ && child.element_ &&
      child.element_.parentNode &&
      // Under some circumstances, IE8 implicitly creates a Document Fragment
      // for detached nodes, so ensure the parent is an Element as it should be.
      child.element_.parentNode.nodeType ==
          Blockly.utils.dom.NodeType.ELEMENT_NODE) {
    // We don't touch the DOM, but if the parent is in the document, and the
    // child element is in the document but not marked as such, then we call
    // enterDocument on the child.
    child.enterDocument();
  }
};

/**
 * Returns the DOM element into which child components are to be rendered,
 * or null if the component itself hasn't been rendered yet.  This default
 * implementation returns the component's root element.  Subclasses with
 * complex DOM structures must override this method.
 * @return {Element} Element to contain child elements (null if none).
 * @protected
 */
Blockly.Component.prototype.getContentElement = function() {
  return this.element_;
};

/**
 * Returns true if the component has children.
 * @return {boolean} True if the component has children.
 * @protected
 */
Blockly.Component.prototype.hasChildren = function() {
  return this.children_.length != 0;
};

/**
 * Returns the number of children of this component.
 * @return {number} The number of children.
 * @protected
 */
Blockly.Component.prototype.getChildCount = function() {
  return this.children_.length;
};

/**
 * Returns the child with the given ID, or null if no such child exists.
 * @param {string} id Child component ID.
 * @return {?Blockly.Component} The child with the given ID; null if none.
 * @protected
 */
Blockly.Component.prototype.getChild = function(id) {
  // Use childIndex_ for O(1) access by ID.
  return id ?
      /** @type {Blockly.Component} */ (this.childIndex_[id]) || null : null;
};

/**
 * Returns the child at the given index, or null if the index is out of bounds.
 * @param {number} index 0-based index.
 * @return {?Blockly.Component} The child at the given index; null if none.
 * @protected
 */
Blockly.Component.prototype.getChildAt = function(index) {
  // Use children_ for access by index.
  return this.children_[index] || null;
};

/**
 * Calls the given function on each of this component's children in order.  If
 * `opt_obj` is provided, it will be used as the 'this' object in the
 * function when called.  The function should take two arguments:  the child
 * component and its 0-based index.  The return value is ignored.
 * @param {function(this:T,?,number):?} f The function to call for every
 * child component; should take 2 arguments (the child and its index).
 * @param {T=} opt_obj Used as the 'this' object in f when called.
 * @template T
 * @protected
 */
Blockly.Component.prototype.forEachChild = function(f, opt_obj) {
  for (var i = 0; i < this.children_.length; i++) {
    f.call(/** @type {?} */ (opt_obj), this.children_[i], i);
  }
};
