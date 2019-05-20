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
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fenichel@google.com (Rachel Fenichel)
 */

//'use strict';
goog.provide('Blockly.BlockRendering.Drawer');



/**
 * Render the given block.
 * @param {!Blockly.BlockSvg} block The block to render
 * @public
 */
Blockly.BlockRendering.render = function(block) {
  new Blockly.BlockRendering.Drawer(block).draw_();
};

/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render
 * @param {!Blockly.BlockRendering.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @private
 */
Blockly.BlockRendering.Drawer = function(block) {
  this.block_ = block;
  this.topLeft_ = block.getRelativeToSurfaceXY();
  this.info_ = new Blockly.BlockRendering.RenderInfo(block);
  this.pathObject_ = new Blockly.BlockSvg.PathObject();
  this.steps_ = this.pathObject_.steps;
  this.inlineSteps_ = this.pathObject_.inlineSteps;
  this.highlighter_ =
      new Blockly.BlockRendering.Highlighter(this.info_, this.pathObject_);
};

/**
 * Draw the block to the workspace. Here "drawing" means setting SVG path
 * elements and moving fields, icons, and connections on the screen.
 *
 * The pieces of the paths are pushed into arrays of "steps", which are then
 * joined with spaces and set directly on the block.  This guarantees that
 * the steps are separated by spaces for improved readability, but isn't
 * required.
 * @private
 */
Blockly.BlockRendering.Drawer.prototype.draw_ = function() {
  this.block_.height = this.info_.height;
  this.block_.width = this.info_.widthWithChildren;
  this.drawOutline_();
  this.drawInternals_();
  this.block_.setPaths_(this.pathObject_);
  this.moveConnections_();
  Blockly.BlockRendering.Debug.drawDebug(this.block_, this.info_, this.pathObject_);

  // Someone out there depends on this existing.
  this.block_.startHat_ = this.info_.topRow.startHat;
};


/**
 * Create the outline of the block.  This is a single continuous path.
 * @private
 */
Blockly.BlockRendering.Drawer.prototype.drawOutline_ = function() {
  this.drawTop_();
  for (var r = 1; r < this.info_.rows.length - 1; r++) {
    var row = this.info_.rows[r];
    if (row.hasStatement) {
      this.drawStatementInput_(row);
    } else if (row.hasExternalInput) {
      this.drawValueInput_(row);
    } else {
      this.drawRightSideRow_(row);
    }
  }
  this.drawBottom_();
  this.drawLeft_();
};


/**
 * Add steps for the top corner of the block, taking into account
 * details such as hats and rounded corners.
 * @private
 */
Blockly.BlockRendering.Drawer.prototype.drawTop_ = function() {
  var topRow = this.info_.topRow;
  var elements = topRow.elements;

  this.highlighter_.drawTopCorner(topRow);
  this.highlighter_.drawRightSideRow(topRow);

  for (var i = 0; i < elements.length; i++) {
    var elem = elements[i];
    if (elem.type === 'square corner') {
      this.steps_.push(BRC.START_POINT);
    } else if (elem.type === 'round corner') {
      this.steps_.push(BRC.TOP_LEFT_CORNER_START, BRC.TOP_LEFT_CORNER);
    } else if (elem.type === 'previous connection') {
      this.steps_.push(BRC.NOTCH_PATH_LEFT);
    } else if (elem.type === 'hat') {
      this.steps_.push(BRC.START_HAT_PATH);
    } else if (elem.isSpacer()) {
      this.steps_.push('h', elem.width);
    }
  }
  this.steps_.push('v', topRow.height);
};


/**
 * Add steps for an external value input, rendered as a notch in the side
 * of the block.
 * @param {!Blockly.BlockRendering.Row} row The row that this input
 *     belongs to.
 * @private
 */
Blockly.BlockRendering.Drawer.prototype.drawValueInput_ = function(row) {
  this.highlighter_.drawValueInput(row);
  this.steps_.push('H', row.width);
  this.steps_.push(BRC.TAB_PATH_DOWN);
  this.steps_.push('v', row.height - BRC.TAB_HEIGHT);
  // Move the connection.
  var input = row.getLastInput();
  if (input.connection) {
    input.connection.setOffsetInBlock(row.width + 1, row.yPos);
  }
};

/**
 * Add steps for a statement input.
 * @param {!Blockly.BlockRendering.Row} row The row that this input
 *     belongs to.
 * @private
 */
Blockly.BlockRendering.Drawer.prototype.drawStatementInput_ = function(row) {
  this.highlighter_.drawStatementInput(row);
  var x = row.statementEdge + BRC.NOTCH_OFFSET_RIGHT;
  this.steps_.push('H', x);
  this.steps_.push(BRC.INNER_TOP_LEFT_CORNER);
  this.steps_.push('v', row.height - 2 * BRC.CORNER_RADIUS);
  this.steps_.push(BRC.INNER_BOTTOM_LEFT_CORNER);
  this.steps_.push('H', this.info_.width);

  // Move the connection.
  var input = row.getLastInput();
  if (input.connection) {
    var connX = row.statementEdge + BRC.NOTCH_OFFSET_LEFT + 1;
    if (this.info_.RTL) {
      connX *= -1;
    }
    input.connection.setOffsetInBlock(
        connX, row.yPos + 1);
  }
};

/**
 * Add steps for the right side of a row that does not have value or
 * statement input connections.
 * @param {!Blockly.BlockRendering.Row} row The row to draw the
 *     side of.
 * @private
 */
Blockly.BlockRendering.Drawer.prototype.drawRightSideRow_ = function(row) {
  this.highlighter_.drawRightSideRow(row);
  this.steps_.push('H', row.width);
  this.steps_.push('v', row.height);
};


/**
 * Add steps for the bottom edge of a block, possibly including a notch
 * for the next connection
 * @private
 */
Blockly.BlockRendering.Drawer.prototype.drawBottom_ = function() {
  var bottomRow = this.info_.bottomRow;
  this.highlighter_.drawBottomCorner(bottomRow);
  if (bottomRow.hasNextConnection) {
    this.steps_.push('v', bottomRow.height - BRC.NOTCH_HEIGHT);
    this.steps_.push('H', (BRC.NOTCH_OFFSET_RIGHT + (this.info_.RTL ? 0.5 : - 0.5)) +
        ' ' + BRC.NOTCH_PATH_RIGHT);
  } else {
    this.steps_.push('v', bottomRow.height);
  }

  this.steps_.push('H', BRC.CORNER_RADIUS);

  if (bottomRow.squareCorner) {
    this.steps_.push('H 0');
  } else {
    this.steps_.push(BRC.BOTTOM_LEFT_CORNER);
  }



  if (bottomRow.hasNextConnection) {
    var connectionX;
    if (this.info_.RTL) {
      connectionX = -BRC.NOTCH_OFFSET_LEFT;
    } else {
      connectionX = BRC.NOTCH_OFFSET_LEFT;
    }

    bottomRow.connection.setOffsetInBlock(connectionX,
        this.info_.height - BRC.NOTCH_HEIGHT - 1);
    bottomRow.connection.moveToOffset(this.topLeft_);
    if (bottomRow.connection.isConnected()) {
      bottomRow.connection.tighten_();
    }
  }

};

/**
 * Add steps for the left side of the block, which may include an output
 * connection
 * @private
 */
Blockly.BlockRendering.Drawer.prototype.drawLeft_ = function() {
  this.highlighter_.drawLeft();

  if (this.info_.hasOutputConnection) {
    // Draw a line up to the bottom of the tab.
    this.steps_.push('V', BRC.TAB_OFFSET_FROM_TOP + BRC.TAB_HEIGHT);
    this.steps_.push(BRC.TAB_PATH_UP);
    this.block_.outputConnection.setOffsetInBlock(0, BRC.TAB_OFFSET_FROM_TOP);
  }
  // Close off the path.  This draws a vertical line up to the start of the
  // block's path, which may be either a rounded or a sharp corner.
  this.steps_.push('z');
};

/**
 * Draw the internals of the block: inline inputs, fields, and icons.  These do
 * not depend on the outer path for placement.
 * @private
 */
Blockly.BlockRendering.Drawer.prototype.drawInternals_ = function() {
  for (var r = 0; r < this.info_.rows.length; r++) {
    var row = this.info_.rows[r];
    if (!(row.isSpacer())) {
      for (var e = 0; e < row.elements.length; e++) {
        var elem = row.elements[e];
        if (elem.isInlineInput()) {
          this.drawInlineInput_(elem);
        } else if (elem.isIcon() || elem.isField()) {
          this.layoutField_(elem);
        }
      }
    }
  }
};

/**
 * Some fields are terrible and render offset from where they claim to be
 * rendered.  This function calculates an x offset for fields that need it.
 * No one is happy about this.
 * @param {!Blockly.Field} field The field to find an offset for.
 * @return {number} How far to offset the field in the x direction.
 * @private
 */
Blockly.BlockRendering.Drawer.prototype.dealWithJackassFields_ = function(field) {
  if (field instanceof Blockly.FieldDropdown
      || field instanceof Blockly.FieldTextInput) {
    return 5;
  }
  return 0;
};

/**
 * Push a field or icon's new position to its SVG root.
 * @param {!Blockly.BlockRendering.Icon|!Blockly.BlockRendering.Field} fieldInfo
 *     The rendering information for the field or icon.
 * @private
 */
Blockly.BlockRendering.Drawer.prototype.layoutField_ = function(fieldInfo) {
  var yPos = fieldInfo.centerline - fieldInfo.height / 2;
  var xPos = fieldInfo.xPos;
  if (this.info_.RTL) {
    xPos = -(xPos + fieldInfo.width);
  }
  if (fieldInfo.type == 'icon') {
    var icon = fieldInfo.icon;
    icon.iconGroup_.setAttribute('display', 'block');
    icon.iconGroup_.setAttribute('transform', 'translate(' + xPos + ',' +
        yPos + ')');
    icon.computeIconLocation();
  } else {
    xPos += this.dealWithJackassFields_(fieldInfo.field);

    fieldInfo.field.getSvgRoot().setAttribute('transform',
        'translate(' + xPos + ',' + yPos + ')');
  }
};

/**
 * Add steps for an inline input.
 * @param {Blockly.BlockRendering.RenderableInput} input The information about the
 * input to render.
 * @private
 */
Blockly.BlockRendering.Drawer.prototype.drawInlineInput_ = function(input) {
  this.highlighter_.drawInlineInput(input);
  var width = input.width;
  var height = input.height;
  var yPos = input.centerline - height / 2;

  this.inlineSteps_.push('M', (input.xPos + BRC.TAB_WIDTH) + ',' + yPos);
  this.inlineSteps_.push('v ', BRC.TAB_OFFSET_FROM_TOP);
  this.inlineSteps_.push(BRC.TAB_PATH_DOWN);
  this.inlineSteps_.push('v', height - BRC.TAB_HEIGHT - BRC.TAB_OFFSET_FROM_TOP);
  this.inlineSteps_.push('h', width - BRC.TAB_WIDTH);
  this.inlineSteps_.push('v', -height);
  this.inlineSteps_.push('z');

  // Move the connection.
  if (input.connection) {
    var connX = input.xPos + BRC.TAB_WIDTH + 1;
    if (this.info_.RTL) {
      connX *= -1;
    }
    input.connection.setOffsetInBlock(
        connX, yPos + BRC.TAB_OFFSET_FROM_TOP + 1);
  }
};

/**
 * Update all of the connections on this block with the new locations calculated
 * in renderCompute.  Also move all of the connected blocks based on the new
 * connection locations.
 * @private
 */
Blockly.BlockRendering.Drawer.prototype.moveConnections_ = function() {
  var blockTL = this.block_.getRelativeToSurfaceXY();
  // Don't tighten previous or output connections because they are inferior
  // connections.
  var topRow = this.info_.topRow;
  if (topRow.hasPreviousConnection) {
    var connectionX = (this.info_.RTL ? -BRC.NOTCH_OFFSET_LEFT : BRC.NOTCH_OFFSET_LEFT);


    console.log('previous connection goes to ' + connectionX + ', 0');
    topRow.connection.setOffsetInBlock(connectionX, 0);
    topRow.connection.moveToOffset(blockTL);
  }
  if (this.block_.outputConnection) {
    this.block_.outputConnection.moveToOffset(blockTL);
  }

  // for (var i = 0; i < this.inputList.length; i++) {
  //   var conn = this.inputList[i].connection;
  //   if (conn) {
  //     conn.moveToOffset(blockTL);
  //     if (conn.isConnected()) {
  //       conn.tighten_();
  //     }
  //   }
  // }

};
