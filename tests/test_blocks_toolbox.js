/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Test blocks toolbox has a category menu and an auto-closing flyout.
 * The blocks in this toolbox reflect block configurations not used by
 * the standard predefined blocks, and so test alternative block rendering
 * code paths.
 */


var alignCategory = {
  "kind": "CATEGORY",
  "name": "Align",
  "contents": [
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_align_dummy_right\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_align_all\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_align_with_external_input\"></block>",
    }
  ],
};

var basicCategory = {
  "kind": "CATEGORY",
  "name": "Basic",
  "contents": [
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_basic_empty\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_basic_empty_with_mutator\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_basic_dummy\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_basic_multiple_dummy\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_basic_stack\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_basic_row\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_basic_value_to_stack\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_basic_value_to_statement\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_basic_limit_instances\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_basic_tooltips\"></block>"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_basic_javascript\"></block>",
    }
  ],
};

var rowCategory = {
  "kind": "CATEGORY",
  "name": "Row",
  "contents": [
    {
      "kind": "LABEL",
      "text": "blocks have"
    },
    {
      "kind": "SEP",
      "gap": "-1"
    },
    {
      "kind": "LABEL",
      "text": "tooltips"
    },
    {
      "kind": "BUTTON",
      "text": "insert",
      "callbackkey": "insertConnectionRows"
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_row_input\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_row_blue\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_row_yellow\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_row_red\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_row_output\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_row_yellow\"><value name=\"NAME\"><block type=\"test_connections_row_yellow\" movable=\"false\"></block></value></block>",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_multivalue_1valid\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_multivalue_2valid\"></block>",
    }
  ],
};

var stackCategory = {
  "kind": "CATEGORY",
  "name": "Stack",
  "contents": [
    {
      "kind": "LABEL",
      "text": "blocks have"
    },
    {
      "kind": "SEP",
      "gap": "-1"
    },
    {
      "kind": "LABEL",
      "text": "tooltips"
    },
    {
      "kind": "BUTTON",
      "text": "insert",
      "callbackkey": "insertConnectionStacks"
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_stack_next\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_stack_blue\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_stack_yellow\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_stack_red\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_stack_prev\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_stack_yellow\"><next><block type=\"test_connections_stack_yellow\" movable=\"false\"></block></next></block>",
    }
  ],
};

var statementCategory = {
  "kind": "CATEGORY",
  "name": "Statement",
  "contents": [
    {
      "kind": "LABEL",
      "text": "blocks have"
    },
    {
      "kind": "SEP",
      "gap": "-1"
    },
    {
      "kind": "LABEL",
      "text": "tooltips"
    },
    {
      "kind": "BUTTON",
      "text": "insert",
      "callbackkey": "insertConnectionStatements"
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_statement_blue\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_statement_yellow\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_statement_red\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_statement_nonext\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_multistatement_1valid\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_connections_multistatement_2valid\"></block>",
    }
  ],
};

var dragCategory = {
  "kind": "CATEGORY",
  "name": "Drag",
  "contents": [
    {
      "kind": "LABEL",
      "text": "Drag each to the workspace"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"text_print\"><value name=\"TEXT\"><block type=\"text\"><field name=\"TEXT\">Dragmebythischild</field></block></value></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"text_print\"><value name=\"TEXT\"><shadow type=\"text\"><field name=\"TEXT\">Dragmebythisshadow</field></shadow></value></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"text_print\"><value name=\"TEXT\"><shadow type=\"text\"><field name=\"TEXT\">Shadowvalue</field></shadow></value><next><shadow type=\"text_print\"><value name=\"TEXT\"><shadow type=\"text\"><field name=\"TEXT\">Shadowstatement</field></shadow></value></shadow></next></block>",
    },
    {
      "kind": "LABEL",
      "text": "Multiple Variable Refs"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"text_print\"><value name=\"TEXT\"><block type=\"variables_get\"><field name=\"VAR\" id=\"item\">item</field></block></value><next><block type=\"text_print\"><value name=\"TEXT\"><block type=\"variables_get\"><field name=\"VAR\" id=\"item\">item</field></block></value></block></next></block>",
    },
    {
      "kind": "LABEL",
      "text": "Procedure Definitions"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"procedures_defnoreturn\"><field name=\"NAME\">withoutarguments</field><statement name=\"STACK\"><block type=\"text_print\"><value name=\"TEXT\"><shadow type=\"text\"><field name=\"TEXT\">Noargumentreference.</field></shadow></value></block></statement></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"procedures_defnoreturn\"><mutation><arg name=\"fnArgument\"></arg></mutation><field name=\"NAME\">withoneargument</field><statement name=\"STACK\"><block type=\"text_print\"><value name=\"TEXT\"><shadow type=\"text\"><field name=\"TEXT\">Expectedanargumentreferencehere.</field></shadow><block type=\"variables_get\"><field name=\"VAR\">fnArgument</field></block></value></block></statement></block>",
    }
  ],
};

var fieldDefaults = {
  "kind": "CATEGORY",
  "name": "Defaults",
  "contents": [
    {
      "kind": "BUTTON",
      "text": "add blocks to workspace",
      "callbackkey": "addAllBlocksToWorkspace"
    },
    {
      "kind": "SEP",
      "gap": "8"
    },
    {
      "kind": "BUTTON",
      "text": "set random style",
      "callbackkey": "setRandomStyle"
    },
    {
      "kind": "SEP",
      "gap": "8"
    },
    {
      "kind": "BUTTON",
      "text": "toggle enabled",
      "callbackkey": "toggleEnabled"
    },
    {
      "kind": "SEP",
      "gap": "8"
    },
    {
      "kind": "BUTTON",
      "text": "toggle shadow",
      "callbackkey": "toggleShadow"
    },
    {
      "kind": "SEP",
      "gap": "8"
    },
    {
      "kind": "BUTTON",
      "text": "toggle collapsed",
      "callbackkey": "toggleCollapsed"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_fields_angle\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_fields_checkbox\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_fields_colour\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_fields_colour_options\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_fields_text_input\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_fields_only_text_input\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_fields_multilinetext\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_fields_variable\"></block>",
    },
    {
      "kind": "BUTTON",
      "text": "randomize label text",
      "callbackkey": "randomizeLabelText"
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_fields_label_serializable\"></block>",
    },
    {
      "kind": "BUTTON",
      "text": "change image",
      "callbackkey": "changeImage"
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_fields_image\"></block>",
    }
  ],
};

var fieldNumbers = {
  "kind": "CATEGORY",
  "name": "Numbers",
  "contents": [
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_numbers_float\"><field name=\"NUM\">123.456</field></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_numbers_hundredths\"><field name=\"NUM\">123.456</field></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_numbers_halves\"><field name=\"NUM\">123.456</field></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_numbers_whole\"><field name=\"NUM\">123.456</field></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_numbers_three_halves\"><field name=\"NUM\">123.456</field></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_numbers_whole_bounded\"><field name=\"NOTE\">60</field></block>",
    }
  ],
};

var fieldAngles = {
  "kind": "CATEGORY",
  "name": "Angles",
  "contents": [
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_angles_clockwise\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_angles_offset\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_angles_wrap\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_angles_round_30\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_angles_round_0\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_angles_protractor\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_angles_compass\"></block>",
    }
  ],
};

var fieldDropDowns = {
  "kind": "CATEGORY",
  "name": "Drop-downs",
  "contents": [
    {
      "kind": "LABEL",
      "text": "Dynamic"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_dropdowns_dynamic\"></block>",
    },
    {
      "kind": "BUTTON",
      "text": "Add option",
      "callbackkey": "addDynamicOption"
    },
    {
      "kind": "BUTTON",
      "text": "Remove option",
      "callbackkey": "removeDynamicOption"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_dropdowns_dynamic_random\"></block>",
    },
    {
      "kind": "LABEL",
      "text": "Other"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_dropdowns_long\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_dropdowns_images\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_dropdowns_images_and_text\"></block>",
    }
  ],
};

var fieldImages = {
  "kind": "CATEGORY",
  "name": "Images",
  "contents": [
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_images_datauri\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_images_small\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_images_large\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_images_fliprtl\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_images_missing\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_images_many_icons\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_images_clickhandler\"></block>",
    }
  ],
};

var fieldEmoji = {
  "kind": "CATEGORY",
  "name": "Emoji! o((*^ᴗ^*))o",
  "contents": [
    {
      "kind": "LABEL",
      "text": "Unicode & Emojis"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_style_emoji\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"text\"><field name=\"TEXT\">Robotfaceintextfield:🤖</field></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"text\"><field name=\"TEXT\">Zalgointextfield:B̛̻̦̬̘̰͎̥̈̔͊͞ͅl̡͖̫̺̬̖̣̳̃̀́͑͑̕͟͠͝o̢̹͙̮̫͔͋̉̊̑̿̽̚c̸̹̹̜͙̹̠͋̒͑̊̇͝k̡͉̫͇̖̳͖̊͒́̆̄̎̂̔̕͜͞l̰̙̞̳̩̠͖̯̀̆̈́̿̈̓͗y̨̡̟͇̮͈̬̙̲̏̅̀͘͠</field></block>",
    }
  ]
};

var fieldValidators = {
  "kind": "CATEGORY",
  "name": "Validators",
  "contents": [
    {
      "kind": "BUTTON",
      "text": "add blocks to workspace",
      "callbackkey": "addAllBlocksToWorkspace"
    },
    {
      "kind": "SEP",
      "gap": "8"
    },
    {
      "kind": "BUTTON",
      "text": "set input",
      "callbackkey": "setInput"
    },
    {
      "kind": "LABEL",
      "text": "Dispose block"
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_dispose_block\"></block>",
    },
    {
      "kind": "LABEL",
      "text": "Angles"
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_angle_null\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_angle_mult30_force\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_angle_mult30_null\"></block>",
    },
    {
      "kind": "LABEL",
      "text": "Checkboxes"
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_checkbox_null\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_checkbox_match\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_checkbox_not_match_null\"></block>",
    },
    {
      "kind": "LABEL",
      "text": "Colours"
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_colour_null\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_colour_force_red\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_colour_red_null\"></block>",
    },
    {
      "kind": "LABEL",
      "text": "Dropdowns"
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_dropdown_null\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_dropdown_force_1s\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_dropdown_1s_null\"></block>",
    },
    {
      "kind": "LABEL",
      "text": "Numbers"
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_number_null\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_number_mult10_force\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_number_mult10_null\"></block>",
    },
    {
      "kind": "LABEL",
      "text": "Text"
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_text_null\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_text_A\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_text_B\"></block>",
    },
    {
      "kind": "LABEL",
      "text": "Variables"
    },
    {
      "kind": "SEP",
      "gap": "8"
    },
    {
      "kind": "BUTTON",
      "text": "add test variables",
      "callbackkey": "addVariables",
      "web-class": "modifiesWorkspace"
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_variable_null\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_variable_force_1s\"></block>",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_validators_variable_1s_null\"></block>",
    }
  ],
};

var mutators = {
  "kind": "CATEGORY",
  "name": "Mutators",
  "contents": [
    {
      "kind": "LABEL",
      "text": "logic_compare"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"logic_compare\"><value name=\"A\"><shadow type=\"math_number\"><field name=\"NUM\">10</field></shadow></value><value name=\"B\"><shadow type=\"math_number\"><field name=\"NUM\">10</field></shadow></value></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"logic_compare\"><value name=\"A\"><block type=\"math_number\"><field name=\"NUM\">10</field></block></value><value name=\"B\"><block type=\"math_number\"><field name=\"NUM\">10</field></block></value></block>",
    }
  ],
};

var style = {
  "kind": "CATEGORY",
  "name": "Style",
  "contents": [
    {
      "kind": "LABEL",
      "text": "Hats"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_style_hat\"></block>",
    },
    {
      "kind": "LABEL",
      "text": "Colour"
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_style_hex1\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_style_hex2\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_style_hex3\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_style_no_colour\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_style_hex4\"></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"test_style_hex5\"></block>",
    }
  ],
};

/* exported testBlocksToolbox */
var testBlocksToolbox = [
  alignCategory,
  basicCategory,
  {
    "kind": "CATEGORY",
    "name": "Connections",
    "expanded": "true",
    "contents": [
      rowCategory,
      stackCategory,
      statementCategory
    ],
  },
  dragCategory,
  {
    "kind": "CATEGORY",
    "name": "Fields",
    "expanded": "true",
    "contents": [
      fieldDefaults,
      fieldNumbers,
      fieldAngles,
      fieldDropDowns,
      fieldImages,
      fieldEmoji,
      fieldValidators
    ],
  },
  mutators,
  style
];
