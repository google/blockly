goog.require('Blockly');

Blockly.Extensions.registerMixin('refreshPinFields', {
    /**
     * Updates the content of the the pin related fields.
     * @this Blockly.Block
     */
    updateFields: function() {
        Blockly.Arduino.Boards.refreshBlockFieldDropdown(
            this, 'PIN1', 'digitalPins');
        Blockly.Arduino.Boards.refreshBlockFieldDropdown(
            this, 'PIN2', 'digitalPins');
        Blockly.Arduino.Boards.refreshBlockFieldDropdown(
            this, 'PIN3', 'digitalPins');
    }}
);

Blockly.Extensions.registerMixin('refreshServoPinFields', {
    /**
     * Updates the content of the the pin related fields.
     * @this Blockly.Block
     */
    updateFields: function () {
        Blockly.Arduino.Boards.refreshBlockFieldDropdown(
          this, 'SERVO_PIN', 'digitalPins');
      }}
);

Blockly.Extensions.registerMixin('returnAndUpdateServoRead', {
    /** @return {string} The type of return value for the block, an integer. */
  getBlockType: function () {
    return Blockly.Types.NUMBER;
  },
  /**
     * Updates the content of the the pin related fields.
     * @this Blockly.Block
     */
  updateFields: function () {
    Blockly.Arduino.Boards.refreshBlockFieldDropdown(
      this, 'SERVO_PIN', 'digitalPins');
  }}
);

Blockly.Extensions.registerMixin('inputAndUpdateAnalog', {
  /**
   * Updates the content of the the pin related fields.
   * @this Blockly.Block
   */
   updateFields: function () {
    Blockly.Arduino.Boards.refreshBlockFieldDropdown(this, 'PIN', 'pwmPins');
  },
  /** @return {!string} The type of input value for the block, an integer. */
  getBlockType: function () {
    return Blockly.Types.NUMBER;
  }}
);

Blockly.Extensions.registerMixin('returnAndUpdateTrig', {
  /** @return {string} The type of return value for the block, an integer. */
  getBlockType: function () {
    return Blockly.Types.NUMBER;
  },
  /**
     * Updates the content of the the pin related fields.
     * @this Blockly.Block
     */
  updateFields: function () {
    Blockly.Arduino.Boards.refreshBlockFieldDropdown(
      this, 'TRIG_PIN', 'digitalPins');
  }}
);

Blockly.Extensions.registerMixin('updateDisplay', {
  /**
     * Updates the content of the the row related fields.
     * @this Blockly.Block
     */
   updateFields: function () {
    Blockly.Arduino.Boards.refreshBlockFieldDropdown(
      this, 'DISPLAY_ROW', 'displayRows');
  }}
);

Blockly.Extensions.register('setDeletableFalse', function () {
  this.appendStatementInput('STACK');
}
)