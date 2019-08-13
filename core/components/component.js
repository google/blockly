/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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
   * Whether the component is rendered right-to-left.  Right-to-left is set
   * lazily when {@link #isRightToLeft} is called the first time, unless it has
   * been set by calling {@link #setRightToLeft} explicitly.
   * @private {?boolean}
   */
  this.rightToLeft_ = Blockly.Component.defaultRightToLeft_;

  /**
   * Unique ID of the component, lazily initialized in {@link
   * Blockly.Component#getId} if needed.  This property is strictly private and
   * must not be accessed directly outside of this class!
   * @private {?string}
   */
  this.id_ = null;

  /**
   * Whether the component is in the document.
   * @private {boolean}
   */
  this.inDocument_ = false;

  /**
   * The DOM element for the component.
   * @private {?Element}
   */
  this.element_ = null;

  /**
   * Parent component to which events will be propagated.  This property is
   * strictly private and must not be accessed directly outside of this class!
   * @private {Blockly.Component?}
   */
  this.parent_ = null;

  /**
   * Array of child components.  Lazily initialized on first use.  Must be kept
   * in sync with `childIndex_`.  This property is strictly private and
   * must not be accessed directly outside of this class!
   * @private {?Array<?Blockly.Component>}
   */
  this.children_ = null;

  /**
   * Map of child component IDs to child components.  Used for constant-time
   * random access to child components by ID.  Lazily initialized on first use.
   * Must be kept in sync with `children_`.  This property is strictly
   * private and must not be accessed directly outside of this class!
   *
   * @private {?Object}
   */
  this.childIndex_ = null;
};


/**
 * Generator for unique IDs.
 * @type {Blockly.utils.IdGenerator}
 * @private
 */
Blockly.Component.prototype.idGenerator_ = Blockly.utils.IdGenerator.getInstance();

/**
 * The default right to left value.
 * @type {?boolean}
 * @private
 */
Blockly.Component.defaultRightToLeft_ = false;

/**
 * Errors thrown by the component.
 * @enum {string}
 */
Blockly.Component.Error = {
  /**
   * Error when a method is not supported.
   */
  NOT_SUPPORTED: 'Method not supported',

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
   * Error when an attempt is made to remove a child component from a component
   * other than its parent.
   */
  NOT_OUR_CHILD: 'Child is not in parent component',

  /**
   * Error when an operation requiring DOM interaction is made when the
   * component is not in the document
   */
  NOT_IN_DOCUMENT: 'Operation not supported while component is not in document'
};

/**
 * Set the default right-to-left value. This causes all component's created from
 * this point forward to have the given value. This is useful for cases where
 * a given page is always in one directionality, avoiding unnecessary
 * right to left determinations.
 * @param {?boolean} rightToLeft Whether the components should be rendered
 *     right-to-left. Null iff components should determine their directionality.
 */
Blockly.Component.setDefaultRightToLeft = function(rightToLeft) {
  Blockly.Component.defaultRightToLeft_ = rightToLeft;
};

/**
 * Gets the unique ID for the instance of this component.  If the instance
 * doesn't already have an ID, generates one on the fly.
 * @return {string} Unique component ID.
 */
Blockly.Component.prototype.getId = function() {
  return this.id_ || (this.id_ = this.idGenerator_.getNextUniqueId());
};

/**
 * Assigns an ID to this component instance.  It is the caller's responsibility
 * to guarantee that the ID is unique.  If the component is a child of a parent
 * component, then the parent component's child index is updated to reflect the
 * new ID; this may throw an error if the parent already has a child with an ID
 * that conflicts with the new ID.
 * @param {string} id Unique component ID.
 */
Blockly.Component.prototype.setId = function(id) {
  if (this.parent_ && this.parent_.childIndex_) {
    // Update the parent's child index.
    delete this.parent_.childIndex_[this.id_];
    this.parent_.childIndex_[id] = this;
  }

  // Update the component ID.
  this.id_ = id;
};

/**
 * Gets the component's element.
 * @return {Element} The element for the component.
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
 */
Blockly.Component.prototype.setElementInternal = function(element) {
  this.element_ = element;
};

/**
 * Returns an array of all the elements in this component's DOM with the
 * provided className.
 * @param {string} className The name of the class to look for.
 * @return {!IArrayLike<!Element>} The items found with the class name provided.
 */
Blockly.Component.prototype.getElementsByClass = function(className) {
  return this.element_ ?
      document.getElementsByClass(className, this.element_) :
      [];
};

/**
 * Returns the first element in this component's DOM with the provided
 * className.
 * @param {string} className The name of the class to look for.
 * @return {Element} The first item with the class name provided.
 */
Blockly.Component.prototype.getElementByClass = function(className) {
  return this.element_ ? document.getElementByClass(className, this.element_) :
                         null;
};

/**
 * Similar to `getElementByClass` except that it expects the
 * element to be present in the dom thus returning a required value. Otherwise,
 * will assert.
 * @param {string} className The name of the class to look for.
 * @return {!Element} The first item with the class name provided.
 */
Blockly.Component.prototype.getRequiredElementByClass = function(className) {
  return this.getElementByClass(className);
};

/**
 * Sets the parent of this component to use for event bubbling.  Throws an error
 * if the component already has a parent or if an attempt is made to add a
 * component to itself as a child.  Callers must use `removeChild`
 * or `removeChildAt` to remove components from their containers before
 * calling this method.
 * @see Blockly.Component#removeChild
 * @see Blockly.Component#removeChildAt
 * @param {Blockly.Component} parent The parent component.
 */
Blockly.Component.prototype.setParent = function(parent) {
  if (this == parent) {
    // Attempting to add a child to itself is an error.
    throw new Error(Blockly.Component.Error.PARENT_UNABLE_TO_BE_SET);
  }

  if (parent && this.parent_ && this.id_ && this.parent_.getChild(this.id_) &&
      this.parent_ != parent) {
    // This component is already the child of some parent, so it should be
    // removed using removeChild/removeChildAt first.
    throw new Error(Blockly.Component.Error.PARENT_UNABLE_TO_BE_SET);
  }

  this.parent_ = parent;
};

/**
 * Returns the component's parent, if any.
 * @return {Blockly.Component?} The parent component.
 */
Blockly.Component.prototype.getParent = function() {
  return this.parent_;
};

/**
 * Determines whether the component has been added to the document.
 * @return {boolean} TRUE if rendered. Otherwise, FALSE.
 */
Blockly.Component.prototype.isInDocument = function() {
  return this.inDocument_;
};

/**
 * Creates the initial DOM representation for the component.  The default
 * implementation is to set this.element_ = div.
 */
Blockly.Component.prototype.createDom = function() {
  this.element_ = document.createElement('div');
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
 */
Blockly.Component.prototype.render = function(opt_parentElement) {
  this.render_(opt_parentElement);
};

/**
 * Renders the component before another element. The other element should be in
 * the document already.
 *
 * Throws an Error if the component is already rendered.
 *
 * @param {Node} sibling Node to render the component before.
 */
Blockly.Component.prototype.renderBefore = function(sibling) {
  this.render_(/** @type {Element} */ (sibling.parentNode), sibling);
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
    throw new Error(Blockly.Component.Error.ALREADY_RENDERED);
  }

  if (!this.element_) {
    this.createDom();
  }

  if (opt_parentElement) {
    opt_parentElement.insertBefore(this.element_, opt_beforeNode || null);
  } else {
    document.getDocument().body.appendChild(this.element_);
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
 */
Blockly.Component.prototype.exitDocument = function() {
  // Propagate exitDocument to child components that have been rendered, if any.
  this.forEachChild(function(child) {
    if (child.isInDocument()) {
      child.exitDocument();
    }
  });

  if (this.googUiComponentHandler_) {
    this.googUiComponentHandler_.removeAll();
  }

  this.inDocument_ = false;
};

/**
 * Disposes of the component.  Calls `exitDocument`, which is expected to
 * remove event handlers and clean up the component.  Propagates the call to
 * the component's children, if any. Removes the component's DOM from the
 * document.
 * @override
 * @protected
 */
Blockly.Component.prototype.disposeInternal = function() {
  if (this.inDocument_) {
    this.exitDocument();
  }

  if (this.googUiComponentHandler_) {
    this.googUiComponentHandler_.dispose();
    delete this.googUiComponentHandler_;
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
 * Helper function for subclasses that gets a unique id for a given fragment,
 * this can be used by components to generate unique string ids for DOM
 * elements.
 * @param {string} idFragment A partial id.
 * @return {string} Unique element id.
 */
Blockly.Component.prototype.makeId = function(idFragment) {
  return this.getId() + '.' + idFragment;
};

/**
 * Makes a collection of ids.  This is a convenience method for makeId.  The
 * object's values are the id fragments and the new values are the generated
 * ids.  The key will remain the same.
 * @param {Object} object The object that will be used to create the ids.
 * @return {!Object<string, string>} An object of id keys to generated ids.
 */
Blockly.Component.prototype.makeIds = function(object) {
  var ids = {};
  for (var key in object) {
    ids[key] = this.makeId(object[key]);
  }
  return ids;
};

/**
 * Adds the specified component as the last child of this component.  See
 * {@link Blockly.Component#addChildAt} for detailed semantics.
 *
 * @see Blockly.Component#addChildAt
 * @param {Blockly.Component} child The new child component.
 * @param {boolean=} opt_render If true, the child component will be rendered
 *    into the parent.
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
 * @return {void} Nada.
 */
Blockly.Component.prototype.addChildAt = function(child, index, opt_render) {
  if (child.inDocument_ && (opt_render || !this.inDocument_)) {
    // Adding a child that's already in the document is an error, except if the
    // parent is also in the document and opt_render is false (e.g. decorate()).
    throw new Error(Blockly.Component.Error.ALREADY_RENDERED);
  }

  if (index < 0 || index > this.getChildCount()) {
    // Allowing sparse child arrays would lead to strange behavior, so we don't.
    throw new Error(Blockly.Component.Error.CHILD_INDEX_OUT_OF_BOUNDS);
  }

  // Create the index and the child array on first use.
  if (!this.childIndex_ || !this.children_) {
    this.childIndex_ = {};
    this.children_ = [];
  }

  // Moving child within component, remove old reference.
  this.childIndex_[child.getId()] = child;
  if (child.getParent() == this) {
    var index = this.children_.indexOf(child);
    if (index > -1) {
      this.children_.splice(index, 1);
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
    // TODO(attila): We should have a renderer with a renderChildAt API.
    var sibling = this.getChildAt(index + 1);
    // render_() calls enterDocument() if the parent is already in the document.
    child.render_(this.getContentElement(), sibling ? sibling.element_ : null);
  } else if (this.inDocument_ && !child.inDocument_ && child.element_ &&
      child.element_.parentNode &&
      // Under some circumstances, IE8 implicitly creates a Document Fragment
      // for detached nodes, so ensure the parent is an Element as it should be.
      child.element_.parentNode.nodeType == Blockly.utils.dom.Node.ELEMENT_NODE) {
    // We don't touch the DOM, but if the parent is in the document, and the
    // child element is in the document but not marked as such, then we call
    // enterDocument on the child.
    // TODO(gboyer): It would be nice to move this condition entirely, but
    // there's a large risk of breaking existing applications that manually
    // append the child to the DOM and then call addChild.
    child.enterDocument();
  }
};

/**
 * Returns the DOM element into which child components are to be rendered,
 * or null if the component itself hasn't been rendered yet.  This default
 * implementation returns the component's root element.  Subclasses with
 * complex DOM structures must override this method.
 * @return {Element} Element to contain child elements (null if none).
 */
Blockly.Component.prototype.getContentElement = function() {
  return this.element_;
};

/**
 * Returns true if the component is rendered right-to-left, false otherwise.
 * The first time this function is invoked, the right-to-left rendering property
 * is set if it has not been already.
 * @return {boolean} Whether the control is rendered right-to-left.
 */
Blockly.Component.prototype.isRightToLeft = function() {
  if (this.rightToLeft_ == null) {
    this.rightToLeft_ = Blockly.utils.style.isRightToLeft(
        this.inDocument_ ? this.element_ : document.getDocument().body);
  }
  return this.rightToLeft_;
};

/**
 * Set is right-to-left. This function should be used if the component needs
 * to know the rendering direction during dom creation (i.e. before
 * {@link #enterDocument} is called and is right-to-left is set).
 * @param {boolean} rightToLeft Whether the component is rendered
 *     right-to-left.
 */
Blockly.Component.prototype.setRightToLeft = function(rightToLeft) {
  if (this.inDocument_) {
    throw new Error(Blockly.Component.Error.ALREADY_RENDERED);
  }
  this.rightToLeft_ = rightToLeft;
};

/**
 * Returns true if the component has children.
 * @return {boolean} True if the component has children.
 */
Blockly.Component.prototype.hasChildren = function() {
  return !!this.children_ && this.children_.length != 0;
};

/**
 * Returns the number of children of this component.
 * @return {number} The number of children.
 */
Blockly.Component.prototype.getChildCount = function() {
  return this.children_ ? this.children_.length : 0;
};

/**
 * Returns an array containing the IDs of the children of this component, or an
 * empty array if the component has no children.
 * @return {!Array<string>} Child component IDs.
 */
Blockly.Component.prototype.getChildIds = function() {
  var ids = [];

  this.forEachChild(function(child) {
    ids.push(child.getId());
  });

  return ids;
};

/**
 * Returns the child with the given ID, or null if no such child exists.
 * @param {string} id Child component ID.
 * @return {Blockly.Component?} The child with the given ID; null if none.
 */
Blockly.Component.prototype.getChild = function(id) {
  // Use childIndex_ for O(1) access by ID.
  return (this.childIndex_ && id) ?
      /** @type {Blockly.Component} */ (
        this.childIndex_[id]) ||
        null : null;
};

/**
 * Returns the child at the given index, or null if the index is out of bounds.
 * @param {number} index 0-based index.
 * @return {Blockly.Component?} The child at the given index; null if none.
 */
Blockly.Component.prototype.getChildAt = function(index) {
  // Use children_ for access by index.
  return this.children_ ? this.children_[index] || null : null;
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
 */
Blockly.Component.prototype.forEachChild = function(f, opt_obj) {
  if (this.children_) {
    for (var i = 0; i < this.children_.length; i++) {
      f.call(/** @type {?} */ (opt_obj), this.children_[i]);
    }
  }
};

/**
 * Returns the 0-based index of the given child component, or -1 if no such
 * child is found.
 * @param {Blockly.Component?} child The child component.
 * @return {number} 0-based index of the child component; -1 if not found.
 */
Blockly.Component.prototype.indexOfChild = function(child) {
  return (this.children_ && child) ? this.children_.indexOf(child) :
                                     -1;
};

/**
 * Removes the given child from this component, and returns it.  Throws an error
 * if the argument is invalid or if the specified child isn't found in the
 * parent component.  The argument can either be a string (interpreted as the
 * ID of the child component to remove) or the child component itself.
 *
 * If `opt_unrender` is true, calls {@link Blockly.Component#exitDocument}
 * on the removed child, and subsequently detaches the child's DOM from the
 * document.  Otherwise it is the caller's responsibility to clean up the child
 * component's DOM.
 *
 * @see Blockly.Component#removeChildAt
 * @param {string|Blockly.Component|null} child The ID of the child to remove,
 *    or the child component itself.
 * @param {boolean=} opt_unrender If true, calls `exitDocument` on the
 *    removed child component, and detaches its DOM from the document.
 * @return {Blockly.Component} The removed component, if any.
 */
Blockly.Component.prototype.removeChild = function(child, opt_unrender) {
  if (child) {
    // Normalize child to be the object and id to be the ID string.  This also
    // ensures that the child is really ours.
    var id = (typeof child === 'string' || child instanceof String) ?
        child : child.getId();
    child = this.getChild(id);

    if (id && child) {
      delete this.childIndex_[id];
      var index = this.children_.indexOf(child);
      if (index > -1) {
        this.children_.splice(index, 1);
      }

      if (opt_unrender) {
        // Remove the child component's DOM from the document.  We have to call
        // exitDocument first (see documentation).
        child.exitDocument();
        if (child.element_) {
          Blockly.utils.dom.removeNode(child.element_);
        }
      }

      // Child's parent must be set to null after exitDocument is called
      // so that the child can unlisten to its parent if required.
      child.setParent(null);
    }
  }

  if (!child) {
    throw new Error(Blockly.Component.Error.NOT_OUR_CHILD);
  }

  return /** @type {!Blockly.Component} */ (child);
};

/**
 * Removes the child at the given index from this component, and returns it.
 * Throws an error if the argument is out of bounds, or if the specified child
 * isn't found in the parent.  See {@link Blockly.Component#removeChild} for
 * detailed semantics.
 *
 * @see Blockly.Component#removeChild
 * @param {number} index 0-based index of the child to remove.
 * @param {boolean=} opt_unrender If true, calls `exitDocument` on the
 *    removed child component, and detaches its DOM from the document.
 * @return {Blockly.Component} The removed component, if any.
 */
Blockly.Component.prototype.removeChildAt = function(index, opt_unrender) {
  // removeChild(null) will throw error.
  return this.removeChild(this.getChildAt(index), opt_unrender);
};

/**
 * Removes every child component attached to this one and returns them.
 *
 * @see Blockly.Component#removeChild
 * @param {boolean=} opt_unrender If true, calls {@link #exitDocument} on the
 *    removed child components, and detaches their DOM from the document.
 * @return {!Array<Blockly.Component>} The removed components if any.
 */
Blockly.Component.prototype.removeChildren = function(opt_unrender) {
  var removedChildren = [];
  while (this.hasChildren()) {
    removedChildren.push(this.removeChildAt(0, opt_unrender));
  }
  return removedChildren;
};
