const n = 20;
const blocksIds = [];
for (let i = 0; i < n; i++) {
  blocksIds.push(`test_mutator_category_${i}`);
}

const defineBlocks = blocksIds.map((t) => ({
  type: t,
  message0: "colour %1",
  args0: [
    {
      type: "field_colour",
      name: "COLOUR",
      colour: "#ff0000"
    }
  ],
  style: "colour_blocks"
}));

Blockly.defineBlocksWithJsonArray([
  {
    type: "test_mutators_many",
    message0: "noflyout mutator",
    mutator: "test_many_blocks_mutator",
    colour: "#000000"
  },
  ...defineBlocks
]);

/**
 * Mutator methods added to the test_mutators_noflyout block.
 * @mixin
 * @augments Blockly.Block
 * @package
 * @readonly
 */
const MANY_BLOCKS_MUTATOR = {
  /**
   * Create XML to represent the block mutation.
   * @return {Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement("mutation");
    container.setAttribute("colour", this.colour_);
    this.setColour(this.colour_);
    return container;
  },
  /**
   * Restore a block from XML.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    this.colour_ = xmlElement.getAttribute("colour");
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this {Blockly.Block}
   */
  decompose: function (workspace) {
    const containerBlock = workspace.newBlock("test_mutators_noflyout_block");
    containerBlock.getField("COLOUR").setValue(this.colour_);
    containerBlock.initSvg();
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  compose: function (containerBlock) {
    this.colour_ = containerBlock.getFieldValue("COLOUR");
    this.setColour(this.colour_);
  }
};

Blockly.Extensions.unregister("test_many_blocks_mutator");

/**
 * Register custom mutator used by the test_mutators_noflyout block.
 */
Blockly.Extensions.registerMutator(
  "test_many_blocks_mutator",
  MANY_BLOCKS_MUTATOR,
  null,
  [...blocksIds]
);
