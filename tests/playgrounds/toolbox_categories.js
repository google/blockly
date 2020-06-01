var logic_category = {
  "kind": "CATEGORY",
  "name": "Logic",
  "categorystyle":"logic_category",
  "contents": [
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"controls_if\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"logic_compare\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"logic_operation\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"logic_negate\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"logic_boolean\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"logic_null\" disabled=\"true\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"logic_ternary\"></block>",
    }
  ],
};

Blockly.registry.register(Blockly.registry.Type.TOOLBOX_CATEGORY, 'logic_category', logic_category);
