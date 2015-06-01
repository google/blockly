// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.fx.AbstractDragDropTest');
goog.setTestOnly('goog.fx.AbstractDragDropTest');

goog.require('goog.array');
goog.require('goog.dom.TagName');
goog.require('goog.events.EventType');
goog.require('goog.functions');
goog.require('goog.fx.AbstractDragDrop');
goog.require('goog.fx.DragDropItem');
goog.require('goog.math.Box');
goog.require('goog.math.Coordinate');
goog.require('goog.style');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');

var targets = [
  { box_: new goog.math.Box(0, 3, 1, 1) },
  { box_: new goog.math.Box(0, 7, 2, 6) },
  { box_: new goog.math.Box(2, 2, 3, 1) },
  { box_: new goog.math.Box(4, 1, 6, 1) },
  { box_: new goog.math.Box(4, 9, 7, 6) },
  { box_: new goog.math.Box(9, 9, 10, 1) }
];

var targets2 = [
  { box_: new goog.math.Box(10, 50, 20, 10) },
  { box_: new goog.math.Box(20, 50, 30, 10) },
  { box_: new goog.math.Box(60, 50, 70, 10) },
  { box_: new goog.math.Box(70, 50, 80, 10) }
];

var targets3 = [
  { box_: new goog.math.Box(0, 4, 1, 1) },
  { box_: new goog.math.Box(1, 6, 4, 5) },
  { box_: new goog.math.Box(5, 5, 6, 2) },
  { box_: new goog.math.Box(2, 1, 5, 0) }
];


/**
 * Test the utility function which tells how two one dimensional ranges
 * overlap.
 */
function testRangeOverlap() {
  assertEquals(RangeOverlap.LEFT, rangeOverlap(1, 2, 3, 4));
  assertEquals(RangeOverlap.LEFT, rangeOverlap(2, 3, 3, 4));
  assertEquals(RangeOverlap.LEFT_IN, rangeOverlap(1, 3, 2, 4));
  assertEquals(RangeOverlap.IN, rangeOverlap(1, 3, 1, 4));
  assertEquals(RangeOverlap.IN, rangeOverlap(2, 3, 1, 4));
  assertEquals(RangeOverlap.IN, rangeOverlap(3, 4, 1, 4));
  assertEquals(RangeOverlap.RIGHT_IN, rangeOverlap(2, 4, 1, 3));
  assertEquals(RangeOverlap.RIGHT, rangeOverlap(2, 3, 1, 2));
  assertEquals(RangeOverlap.RIGHT, rangeOverlap(3, 4, 1, 2));
  assertEquals(RangeOverlap.CONTAINS, rangeOverlap(1, 4, 2, 3));
}


/**
 * An enum describing how two ranges overlap (non-symmetrical relation).
 * @enum {number}
 */
RangeOverlap = {
  LEFT: 1,      // First range is placed to the left of the second.
  LEFT_IN: 2,   // First range overlaps on the left side of the second.
  IN: 3,        // First range is completely contained in the second.
  RIGHT_IN: 4,  // First range overlaps on the right side of the second.
  RIGHT: 5,     // First range is placed to the right side of the second.
  CONTAINS: 6   // First range contains the second.
};


/**
 * Computes how two one dimentional ranges overlap.
 *
 * @param {number} left1 Left inclusive bound of the first range.
 * @param {number} right1 Right exclusive bound of the first range.
 * @param {number} left2 Left inclusive bound of the second range.
 * @param {number} right2 Right exclusive bound of the second range.
 * @return {RangeOverlap} The enum value describing the type of the overlap.
 */
function rangeOverlap(left1, right1, left2, right2) {
  if (right1 <= left2) return RangeOverlap.LEFT;
  if (left1 >= right2) return RangeOverlap.RIGHT;
  var leftIn = left1 >= left2;
  var rightIn = right1 <= right2;
  if (leftIn && rightIn) return RangeOverlap.IN;
  if (leftIn) return RangeOverlap.RIGHT_IN;
  if (rightIn) return RangeOverlap.LEFT_IN;
  return RangeOverlap.CONTAINS;
}


/**
 * Tells whether two boxes overlap.
 *
 * @param {goog.math.Box} box1 First box in question.
 * @param {goog.math.Box} box2 Second box in question.
 * @return {boolean} Whether boxes overlap in any way.
 */
function boxOverlaps(box1, box2) {
  var horizontalOverlap = rangeOverlap(
      box1.left, box1.right, box2.left, box2.right);
  var verticalOverlap = rangeOverlap(
      box1.top, box1.bottom, box2.top, box2.bottom);
  return horizontalOverlap != RangeOverlap.LEFT &&
      horizontalOverlap != RangeOverlap.RIGHT &&
      verticalOverlap != RangeOverlap.LEFT &&
      verticalOverlap != RangeOverlap.RIGHT;
}


/**
 * Tests if the utility function to compute box overlapping functions properly.
 */
function testBoxOverlaps() {
  // Overlapping tests.
  var box2 = new goog.math.Box(1, 4, 4, 1);

  // Corner overlaps.
  assertTrue('NW overlap', boxOverlaps(new goog.math.Box(0, 2, 2, 0), box2));
  assertTrue('NE overlap', boxOverlaps(new goog.math.Box(0, 5, 2, 3), box2));
  assertTrue('SE overlap', boxOverlaps(new goog.math.Box(3, 5, 5, 3), box2));
  assertTrue('SW overlap', boxOverlaps(new goog.math.Box(3, 2, 5, 0), box2));

  // Inside.
  assertTrue('Inside overlap',
      boxOverlaps(new goog.math.Box(2, 3, 3, 2), box2));

  // Around.
  assertTrue('Outside overlap',
      boxOverlaps(new goog.math.Box(0, 5, 5, 0), box2));

  // Edge overlaps.
  assertTrue('N overlap', boxOverlaps(new goog.math.Box(0, 3, 2, 2), box2));
  assertTrue('E overlap', boxOverlaps(new goog.math.Box(2, 5, 3, 3), box2));
  assertTrue('S overlap', boxOverlaps(new goog.math.Box(3, 3, 5, 2), box2));
  assertTrue('W overlap', boxOverlaps(new goog.math.Box(2, 2, 3, 0), box2));

  assertTrue('N-in overlap', boxOverlaps(new goog.math.Box(0, 5, 2, 0), box2));
  assertTrue('E-in overlap', boxOverlaps(new goog.math.Box(0, 5, 5, 3), box2));
  assertTrue('S-in overlap', boxOverlaps(new goog.math.Box(3, 5, 5, 0), box2));
  assertTrue('W-in overlap', boxOverlaps(new goog.math.Box(0, 2, 5, 0), box2));

  // Does not overlap.
  var box2 = new goog.math.Box(3, 6, 6, 3);

  // Along the edge - shorter.
  assertFalse('N-in no overlap',
      boxOverlaps(new goog.math.Box(1, 5, 2, 4), box2));
  assertFalse('E-in no overlap',
      boxOverlaps(new goog.math.Box(4, 8, 5, 7), box2));
  assertFalse('S-in no overlap',
      boxOverlaps(new goog.math.Box(7, 5, 8, 4), box2));
  assertFalse('N-in no overlap',
      boxOverlaps(new goog.math.Box(4, 2, 5, 1), box2));

  // By the corner.
  assertFalse('NE no overlap',
      boxOverlaps(new goog.math.Box(1, 8, 2, 7), box2));
  assertFalse('SE no overlap',
      boxOverlaps(new goog.math.Box(7, 8, 8, 7), box2));
  assertFalse('SW no overlap',
      boxOverlaps(new goog.math.Box(7, 2, 8, 1), box2));
  assertFalse('NW no overlap',
      boxOverlaps(new goog.math.Box(1, 2, 2, 1), box2));

  // Perpendicular to an edge.
  assertFalse('NNE no overlap',
      boxOverlaps(new goog.math.Box(1, 7, 2, 5), box2));
  assertFalse('NEE no overlap',
      boxOverlaps(new goog.math.Box(2, 8, 4, 7), box2));
  assertFalse('SEE no overlap',
      boxOverlaps(new goog.math.Box(5, 8, 7, 7), box2));
  assertFalse('SSE no overlap',
      boxOverlaps(new goog.math.Box(7, 7, 8, 5), box2));
  assertFalse('SSW no overlap',
      boxOverlaps(new goog.math.Box(7, 4, 8, 2), box2));
  assertFalse('SWW no overlap',
      boxOverlaps(new goog.math.Box(5, 2, 7, 1), box2));
  assertFalse('NWW no overlap',
      boxOverlaps(new goog.math.Box(2, 2, 4, 1), box2));
  assertFalse('NNW no overlap',
      boxOverlaps(new goog.math.Box(1, 4, 2, 2), box2));

  // Along the edge - longer.
  assertFalse('N no overlap',
      boxOverlaps(new goog.math.Box(0, 7, 1, 2), box2));
  assertFalse('E no overlap',
      boxOverlaps(new goog.math.Box(2, 9, 7, 8), box2));
  assertFalse('S no overlap',
      boxOverlaps(new goog.math.Box(8, 7, 9, 2), box2));
  assertFalse('W no overlap',
      boxOverlaps(new goog.math.Box(2, 1, 7, 0), box2));
}


/**
 * Checks whether a given box overlaps any of given DnD target boxes.
 *
 * @param {goog.math.Box} box The box to check.
 * @param {Array<Object>} targets The array of targets with boxes to check
 *     if they overlap with the given box.
 * @return {boolean} Whether the box overlaps any of the target boxes.
 */
function boxOverlapsTargets(box, targets) {
  return goog.array.some(targets, function(target) {
    return boxOverlaps(box, target.box_);
  });
}


function testMaybeCreateDummyTargetForPosition() {
  var testGroup = new goog.fx.AbstractDragDrop();
  testGroup.targetList_ = targets;
  testGroup.targetBox_ = new goog.math.Box(0, 9, 10, 1);

  var target = testGroup.maybeCreateDummyTargetForPosition_(3, 3);
  assertFalse(boxOverlapsTargets(target.box_, testGroup.targetList_));
  assertTrue(testGroup.isInside(3, 3, target.box_));

  target = testGroup.maybeCreateDummyTargetForPosition_(2, 4);
  assertFalse(boxOverlapsTargets(target.box_, testGroup.targetList_));
  assertTrue(testGroup.isInside(2, 4, target.box_));

  target = testGroup.maybeCreateDummyTargetForPosition_(2, 7);
  assertFalse(boxOverlapsTargets(target.box_, testGroup.targetList_));
  assertTrue(testGroup.isInside(2, 7, target.box_));

  testGroup.targetList_.push({ box_: new goog.math.Box(5, 6, 6, 0) });

  target = testGroup.maybeCreateDummyTargetForPosition_(3, 3);
  assertFalse(boxOverlapsTargets(target.box_, testGroup.targetList_));
  assertTrue(testGroup.isInside(3, 3, target.box_));

  target = testGroup.maybeCreateDummyTargetForPosition_(2, 7);
  assertFalse(boxOverlapsTargets(target.box_, testGroup.targetList_));
  assertTrue(testGroup.isInside(2, 7, target.box_));

  target = testGroup.maybeCreateDummyTargetForPosition_(6, 3);
  assertFalse(boxOverlapsTargets(target.box_, testGroup.targetList_));
  assertTrue(testGroup.isInside(6, 3, target.box_));

  target = testGroup.maybeCreateDummyTargetForPosition_(0, 3);
  assertNull(target);
  target = testGroup.maybeCreateDummyTargetForPosition_(9, 0);
  assertNull(target);
}


function testMaybeCreateDummyTargetForPosition2() {
  var testGroup = new goog.fx.AbstractDragDrop();
  testGroup.targetList_ = targets2;
  testGroup.targetBox_ = new goog.math.Box(10, 50, 80, 10);

  var target = testGroup.maybeCreateDummyTargetForPosition_(30, 40);
  assertFalse(boxOverlapsTargets(target.box_, testGroup.targetList_));
  assertTrue(testGroup.isInside(30, 40, target.box_));

  target = testGroup.maybeCreateDummyTargetForPosition_(45, 40);
  assertFalse(boxOverlapsTargets(target.box_, testGroup.targetList_));
  assertTrue(testGroup.isInside(45, 40, target.box_));

  testGroup.targetList_.push({ box_: new goog.math.Box(40, 50, 50, 40) });

  target = testGroup.maybeCreateDummyTargetForPosition_(30, 40);
  assertFalse(boxOverlapsTargets(target.box_, testGroup.targetList_));
  target = testGroup.maybeCreateDummyTargetForPosition_(45, 35);
  assertFalse(boxOverlapsTargets(target.box_, testGroup.targetList_));
}


function testMaybeCreateDummyTargetForPosition3BoxHasDecentSize() {
  var testGroup = new goog.fx.AbstractDragDrop();
  testGroup.targetList_ = targets3;
  testGroup.targetBox_ = new goog.math.Box(0, 6, 6, 0);

  var target = testGroup.maybeCreateDummyTargetForPosition_(3, 3);
  assertFalse(boxOverlapsTargets(target.box_, testGroup.targetList_));
  assertTrue(testGroup.isInside(3, 3, target.box_));
  assertEquals('(1t, 5r, 5b, 1l)', target.box_.toString());
}


function testMaybeCreateDummyTargetForPosition4() {
  var testGroup = new goog.fx.AbstractDragDrop();
  testGroup.targetList_ = targets;
  testGroup.targetBox_ = new goog.math.Box(0, 9, 10, 1);

  for (var x = testGroup.targetBox_.left;
       x < testGroup.targetBox_.right;
       x++) {
    for (var y = testGroup.targetBox_.top;
        y < testGroup.targetBox_.bottom;
        y++) {
      var inRealTarget = false;
      for (var i = 0; i < testGroup.targetList_.length; i++) {
        if (testGroup.isInside(x, y, testGroup.targetList_[i].box_)) {
          inRealTarget = true;
          break;
        }
      }
      if (!inRealTarget) {
        var target = testGroup.maybeCreateDummyTargetForPosition_(x, y);
        if (target) {
          assertFalse('Fake target for point(' + x + ',' + y + ') should ' +
              'not overlap any real targets.',
              boxOverlapsTargets(target.box_, testGroup.targetList_));
          assertTrue(testGroup.isInside(x, y, target.box_));
        }
      }
    }
  }
}

function testMaybeCreateDummyTargetForPosition_NegativePositions() {
  var negTargets = [
    { box_: new goog.math.Box(-20, 10, -5, 1) },
    { box_: new goog.math.Box(20, 10, 30, 1) }
  ];

  var testGroup = new goog.fx.AbstractDragDrop();
  testGroup.targetList_ = negTargets;
  testGroup.targetBox_ = new goog.math.Box(-20, 10, 30, 1);

  var target = testGroup.maybeCreateDummyTargetForPosition_(1, 5);
  assertFalse(boxOverlapsTargets(target.box_, testGroup.targetList_));
  assertTrue(testGroup.isInside(1, 5, target.box_));
}

function testMaybeCreateDummyTargetOutsideScrollableContainer() {
  var targets = [
    { box_: new goog.math.Box(0, 3, 10, 1) },
    { box_: new goog.math.Box(20, 3, 30, 1) }
  ];
  var target = targets[0];

  var testGroup = new goog.fx.AbstractDragDrop();
  testGroup.targetList_ = targets;
  testGroup.targetBox_ = new goog.math.Box(0, 3, 30, 1);

  testGroup.addScrollableContainer(document.getElementById('container1'));
  var container = testGroup.scrollableContainers_[0];
  container.containedTargets_.push(target);
  container.box_ = new goog.math.Box(0, 3, 5, 1); // shorter than target
  target.scrollableContainer_ = container;

  // mouse cursor is below scrollable target but not the actual target
  var dummyTarget = testGroup.maybeCreateDummyTargetForPosition_(2, 7);
  // dummy target should not overlap the scrollable container
  assertFalse(boxOverlaps(dummyTarget.box_, container.box_));
  // but should overlap the actual target, since not all of it is visible
  assertTrue(boxOverlaps(dummyTarget.box_, target.box_));
}

function testMaybeCreateDummyTargetInsideScrollableContainer() {
  var targets = [
    { box_: new goog.math.Box(0, 3, 10, 1) },
    { box_: new goog.math.Box(20, 3, 30, 1) }
  ];
  var target = targets[0];

  var testGroup = new goog.fx.AbstractDragDrop();
  testGroup.targetList_ = targets;
  testGroup.targetBox_ = new goog.math.Box(0, 3, 30, 1);

  testGroup.addScrollableContainer(document.getElementById('container1'));
  var container = testGroup.scrollableContainers_[0];
  container.containedTargets_.push(target);
  container.box_ = new goog.math.Box(0, 3, 20, 1); // longer than target
  target.scrollableContainer_ = container;

  // mouse cursor is below both the scrollable and the actual target
  var dummyTarget = testGroup.maybeCreateDummyTargetForPosition_(2, 15);
  // dummy target should overlap the scrollable container
  assertTrue(boxOverlaps(dummyTarget.box_, container.box_));
  // but not overlap the actual target
  assertFalse(boxOverlaps(dummyTarget.box_, target.box_));
}

function testCalculateTargetBox() {
  var testGroup = new goog.fx.AbstractDragDrop();
  testGroup.targetList_ = [];
  goog.array.forEach(targets, function(target) {
    testGroup.targetList_.push(target);
    testGroup.calculateTargetBox_(target.box_);
  });
  assertTrue(goog.math.Box.equals(testGroup.targetBox_,
      new goog.math.Box(0, 9, 10, 1)));

  testGroup = new goog.fx.AbstractDragDrop();
  testGroup.targetList_ = [];
  goog.array.forEach(targets2, function(target) {
    testGroup.targetList_.push(target);
    testGroup.calculateTargetBox_(target.box_);
  });
  assertTrue(goog.math.Box.equals(testGroup.targetBox_,
      new goog.math.Box(10, 50, 80, 10)));

  testGroup = new goog.fx.AbstractDragDrop();
  testGroup.targetList_ = [];
  goog.array.forEach(targets3, function(target) {
    testGroup.targetList_.push(target);
    testGroup.calculateTargetBox_(target.box_);
  });
  assertTrue(goog.math.Box.equals(testGroup.targetBox_,
      new goog.math.Box(0, 6, 6, 0)));
}


function testIsInside() {
  var add = new goog.fx.AbstractDragDrop();
  // The box in question.
  // 10,20+++++20,20
  //   +         |
  // 10,30-----20,30
  var box = new goog.math.Box(20, 20, 30, 10);

  assertTrue('A point somewhere in the middle of the box should be inside.',
      add.isInside(15, 25, box));

  assertTrue('A point in top-left corner should be inside the box.',
      add.isInside(10, 20, box));

  assertTrue('A point on top border should be inside the box.',
      add.isInside(15, 20, box));

  assertFalse('A point in top-right corner should be outside the box.',
      add.isInside(20, 20, box));

  assertFalse('A point on right border should be outside the box.',
      add.isInside(20, 25, box));

  assertFalse('A point in bottom-right corner should be outside the box.',
      add.isInside(20, 30, box));

  assertFalse('A point on bottom border should be outside the box.',
      add.isInside(15, 30, box));

  assertFalse('A point in bottom-left corner should be outside the box.',
      add.isInside(10, 30, box));

  assertTrue('A point on left border should be inside the box.',
      add.isInside(10, 25, box));

  add.dispose();
}


function testAddingRemovingScrollableContainers() {
  var group = new goog.fx.AbstractDragDrop();
  var el1 = document.createElement(goog.dom.TagName.DIV);
  var el2 = document.createElement(goog.dom.TagName.DIV);

  assertEquals(0, group.scrollableContainers_.length);

  group.addScrollableContainer(el1);
  assertEquals(1, group.scrollableContainers_.length);

  group.addScrollableContainer(el2);
  assertEquals(2, group.scrollableContainers_.length);

  group.removeAllScrollableContainers();
  assertEquals(0, group.scrollableContainers_.length);
}


function testScrollableContainersCalculation() {
  var group = new goog.fx.AbstractDragDrop();
  var target = new goog.fx.AbstractDragDrop();

  group.addTarget(target);
  group.addScrollableContainer(document.getElementById('container1'));
  var container = group.scrollableContainers_[0];

  var item1 = new goog.fx.DragDropItem(document.getElementById('child1'));
  var item2 = new goog.fx.DragDropItem(document.getElementById('child2'));

  target.items_.push(item1);
  group.recalculateDragTargets();
  group.recalculateScrollableContainers();

  assertEquals(1, container.containedTargets_.length);
  assertEquals(container, group.targetList_[0].scrollableContainer_);

  target.items_.push(item2);
  group.recalculateDragTargets();
  assertEquals(1, container.containedTargets_.length);
  assertNull(group.targetList_[0].scrollableContainer_);

  group.recalculateScrollableContainers();
  assertEquals(2, container.containedTargets_.length);
  assertEquals(container, group.targetList_[1].scrollableContainer_);
}

// See http://b/7494613.
function testMouseUpOutsideElement() {
  var group = new goog.fx.AbstractDragDrop();
  var target = new goog.fx.AbstractDragDrop();
  group.addTarget(target);
  var item1 = new goog.fx.DragDropItem(document.getElementById('child1'));
  group.items_.push(item1);
  item1.setParent(group);
  group.init();

  group.startDrag = goog.functions.error('startDrag should not be called.');

  goog.testing.events.fireMouseDownEvent(item1.element);
  goog.testing.events.fireMouseUpEvent(item1.element.parentNode);
  // This should have no effect (not start a drag) since the previous event
  // should have cleared the listeners.
  goog.testing.events.fireMouseOutEvent(item1.element);

  group.dispose();
  target.dispose();
}

function testScrollBeforeMoveDrag() {
  var group = new goog.fx.AbstractDragDrop();
  var target = new goog.fx.AbstractDragDrop();

  group.addTarget(target);
  var container = document.getElementById('container1');
  group.addScrollableContainer(container);

  var childEl = document.getElementById('child1');
  var item = new goog.fx.DragDropItem(childEl);
  item.currentDragElement_ = childEl;

  target.items_.push(item);
  group.recalculateDragTargets();
  group.recalculateScrollableContainers();

  // Simulare starting a drag.
  var moveEvent = {
    'clientX': 8,
    'clientY': 10,
    'type': goog.events.EventType.MOUSEMOVE,
    'relatedTarget': childEl,
    'preventDefault': function() {}
  };
  group.startDrag(moveEvent, item);

  // Simulate scrolling before the first move drag event.
  var scrollEvent = {
    'target': container
  };
  assertNotThrows(goog.bind(group.containerScrollHandler_, group, scrollEvent));
}


function testMouseMove_mouseOutBeforeThreshold() {
  // Setup dragdrop and item
  var itemEl = document.createElement(goog.dom.TagName.DIV);
  var childEl = document.createElement(goog.dom.TagName.DIV);
  itemEl.appendChild(childEl);
  var add = new goog.fx.AbstractDragDrop();
  var item = new goog.fx.DragDropItem(itemEl);
  item.setParent(add);
  add.items_.push(item);

  // Simulate maybeStartDrag
  item.startPosition_ = new goog.math.Coordinate(10, 10);
  item.currentDragElement_ = itemEl;

  // Test
  var draggedItem = null;
  add.startDrag = function(event, item) {
    draggedItem = item;
  };

  var event = {'clientX': 8, 'clientY': 10, // Drag distance is only 2
    'type': goog.events.EventType.MOUSEOUT, 'target': childEl};
  item.mouseMove_(event);
  assertEquals('DragStart should not be fired for mouseout on child element.',
      null, draggedItem);

  var event = {'clientX': 8, 'clientY': 10, // Drag distance is only 2
    'type': goog.events.EventType.MOUSEOUT, 'target': itemEl};
  item.mouseMove_(event);
  assertEquals('DragStart should be fired for mouseout on main element.',
      item, draggedItem);
}


function testGetDragElementPosition() {
  var testGroup = new goog.fx.AbstractDragDrop();
  var sourceEl = document.createElement(goog.dom.TagName.DIV);
  document.body.appendChild(sourceEl);

  var pageOffset = goog.style.getPageOffset(sourceEl);
  var pos = testGroup.getDragElementPosition(sourceEl);
  assertEquals('Drag element position should be source element page offset',
      pageOffset.x, pos.x);
  assertEquals('Drag element position should be source element page offset',
      pageOffset.y, pos.y);

  sourceEl.style.marginLeft = '5px';
  sourceEl.style.marginTop = '7px';
  pageOffset = goog.style.getPageOffset(sourceEl);
  pos = testGroup.getDragElementPosition(sourceEl);
  assertEquals('Drag element position should be adjusted for source element ' +
      'margins', pageOffset.x - 10, pos.x);
  assertEquals('Drag element position should be adjusted for source element ' +
      'margins', pageOffset.y - 14, pos.y);
}


// Helper function for manual debugging.
function drawTargets(targets, multiplier) {
  var colors = ['green', 'blue', 'red', 'lime', 'pink', 'silver', 'orange'];
  var cont = document.getElementById('cont');
  cont.innerHTML = '';
  for (var i = 0; i < targets.length; i++) {
    var box = targets[i].box_;
    var el = document.createElement(goog.dom.TagName.DIV);
    el.style.top = (box.top * multiplier) + 'px';
    el.style.left = (box.left * multiplier) + 'px';
    el.style.width = ((box.right - box.left) * multiplier) + 'px';
    el.style.height = ((box.bottom - box.top) * multiplier) + 'px';
    el.style.backgroundColor = colors[i];
    cont.appendChild(el);
  }
}
