/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Test blocks toolbox has a category menu and an auto-closing flyout.
 * The blocks in this toolbox reflect block configurations not used by
 * the standard predefined blocks, and so test alternative block rendering
 * code paths.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */


var alignCategory = {
  "kind": "CATEGORY",
  "name": "Align",
  "contents": [
    {
      "kind": "BLOCK",
      "type": "test_align_dummy_right",
    },
    {
      "kind": "BLOCK",
      "type": "test_align_all",
    },
    {
      "kind": "BLOCK",
      "type": "test_align_with_external_input",
    }
  ],
};

var basicCategory = {
  "kind": "CATEGORY",
  "name": "Basic",
  "contents": [
    {
      "kind": "BLOCK",
      "type": "test_basic_empty",
    },
    {
      "kind": "BLOCK",
      "type": "test_basic_empty_with_mutator",
    },
    {
      "kind": "BLOCK",
      "type": "test_basic_dummy",
    },
    {
      "kind": "BLOCK",
      "type": "test_basic_multiple_dummy",
    },
    {
      "kind": "BLOCK",
      "type": "test_basic_stack",
    },
    {
      "kind": "BLOCK",
      "type": "test_basic_row",
    },
    {
      "kind": "BLOCK",
      "type": "test_basic_value_to_stack",
    },
    {
      "kind": "BLOCK",
      "type": "test_basic_value_to_statement",
    },
    {
      "kind": "BLOCK",
      "type": "test_basic_limit_instances",
    },
    {
      "kind": "BLOCK",
      "type": "test_basic_tooltips"
    },
    {
      "kind": "BLOCK",
      "type": "test_basic_javascript",
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
      "type": "test_connections_row_input",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "type": "test_connections_row_blue",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "type": "test_connections_row_yellow",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "type": "test_connections_row_red",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "type": "test_connections_row_output",
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
      "type": "test_connections_multivalue_1valid",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "type": "test_connections_multivalue_2valid",
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
      "type": "test_connections_stack_next",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "type": "test_connections_stack_blue",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "type": "test_connections_stack_yellow",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "type": "test_connections_stack_red",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "type": "test_connections_stack_prev",
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
      "type": "test_connections_statement_blue",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "type": "test_connections_statement_yellow",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "type": "test_connections_statement_red",
    },
    {
      "kind": "BLOCK",
      "type": "test_connections_statement_nonext",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "type": "test_connections_multistatement_1valid",
    },
    {
      "kind": "SEP",
      "gap": "7"
    },
    {
      "kind": "BLOCK",
      "type": "test_connections_multistatement_2valid",
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
      "blockxml": "<block type=\"text_print\"><value name=\"TEXT\"><block type=\"text\"><field name=\"TEXT\">Drag me by this child</field></block></value></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"text_print\"><value name=\"TEXT\"><shadow type=\"text\"><field name=\"TEXT\">Drag me by this shadow</field></shadow></value></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"text_print\"><value name=\"TEXT\"><shadow type=\"text\"><field name=\"TEXT\">Shadow value</field></shadow></value><next><shadow type=\"text_print\"><value name=\"TEXT\"><shadow type=\"text\"><field name=\"TEXT\">Shadow statement</field></shadow></value></shadow></next></block>",
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
      "blockxml": "<block type=\"procedures_defnoreturn\"><field name=\"NAME\">without arguments</field><statement name=\"STACK\"><block type=\"text_print\"><value name=\"TEXT\"><shadow type=\"text\"><field name=\"TEXT\">No argument reference.</field></shadow></value></block></statement></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"procedures_defnoreturn\"><mutation><arg name=\"fnArgument\"></arg></mutation><field name=\"NAME\">with one argument</field><statement name=\"STACK\"><block type=\"text_print\"><value name=\"TEXT\"><shadow type=\"text\"><field name=\"TEXT\">Expected an argument reference here.</field></shadow><block type=\"variables_get\"><field name=\"VAR\">fnArgument</field></block></value></block></statement></block>",
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
      "type": "test_fields_angle",
    },
    {
      "kind": "BLOCK",
      "type": "test_fields_checkbox",
    },
    {
      "kind": "BLOCK",
      "type": "test_fields_colour",
    },
    {
      "kind": "BLOCK",
      "type": "test_fields_colour_options",
    },
    {
      "kind": "BLOCK",
      "type": "test_fields_text_input",
    },
    {
      "kind": "BLOCK",
      "type": "test_fields_only_text_input",
    },
    {
      "kind": "BLOCK",
      "type": "test_fields_multilinetext",
    },
    {
      "kind": "BLOCK",
      "type": "test_fields_variable",
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
      "type": "test_fields_label_serializable",
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
      "type": "test_fields_image",
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
      "type": "test_angles_clockwise",
    },
    {
      "kind": "BLOCK",
      "type": "test_angles_offset",
    },
    {
      "kind": "BLOCK",
      "type": "test_angles_wrap",
    },
    {
      "kind": "BLOCK",
      "type": "test_angles_round_30",
    },
    {
      "kind": "BLOCK",
      "type": "test_angles_round_0",
    },
    {
      "kind": "BLOCK",
      "type": "test_angles_protractor",
    },
    {
      "kind": "BLOCK",
      "type": "test_angles_compass",
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
      "type": "test_dropdowns_dynamic",
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
      "type": "test_dropdowns_dynamic_random",
    },
    {
      "kind": "LABEL",
      "text": "Other"
    },
    {
      "kind": "BLOCK",
      "type": "test_dropdowns_long",
    },
    {
      "kind": "BLOCK",
      "type": "test_dropdowns_images",
    },
    {
      "kind": "BLOCK",
      "type": "test_dropdowns_images_and_text",
    }
  ],
};

var fieldImages = {
  "kind": "CATEGORY",
  "name": "Images",
  "contents": [
    {
      "kind": "BLOCK",
      "type": "test_images_datauri",
    },
    {
      "kind": "BLOCK",
      "type": "test_images_small",
    },
    {
      "kind": "BLOCK",
      "type": "test_images_large",
    },
    {
      "kind": "BLOCK",
      "type": "test_images_fliprtl",
    },
    {
      "kind": "BLOCK",
      "type": "test_images_missing",
    },
    {
      "kind": "BLOCK",
      "type": "test_images_many_icons",
    },
    {
      "kind": "BLOCK",
      "type": "test_images_clickhandler",
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
      "type": "test_style_emoji",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"text\"><field name=\"TEXT\">Robot face in text field:🤖</field></block>",
    },
    {
      "kind": "BLOCK",
      "blockxml": "<block type=\"text\"><field name=\"TEXT\">Zalgo in text field:B̛̻̦̬̘̰͎̥̈̔͊͞ͅl̡͖̫̺̬̖̣̳̃̀́͑͑̕͟͠͝o̢̹͙̮̫͔͋̉̊̑̿̽̚c̸̹̹̜͙̹̠͋̒͑̊̇͝k̡͉̫͇̖̳͖̊͒́̆̄̎̂̔̕͜͞l̰̙̞̳̩̠͖̯̀̆̈́̿̈̓͗y̨̡̟͇̮͈̬̙̲̏̅̀͘͠</field></block>",
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
      "type": "test_validators_dispose_block",
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
      "type": "test_validators_angle_null",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "type": "test_validators_angle_mult30_force",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "type": "test_validators_angle_mult30_null",
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
      "type": "test_validators_checkbox_null",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "type": "test_validators_checkbox_match",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "type": "test_validators_checkbox_not_match_null",
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
      "type": "test_validators_colour_null",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "type": "test_validators_colour_force_red",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "type": "test_validators_colour_red_null",
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
      "type": "test_validators_dropdown_null",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "type": "test_validators_dropdown_force_1s",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "type": "test_validators_dropdown_1s_null",
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
      "type": "test_validators_number_null",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "type": "test_validators_number_mult10_force",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "type": "test_validators_number_mult10_null",
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
      "type": "test_validators_text_null",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "type": "test_validators_text_A",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "type": "test_validators_text_B",
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
      "type": "test_validators_variable_null",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "type": "test_validators_variable_force_1s",
    },
    {
      "kind": "SEP",
      "gap": "12"
    },
    {
      "kind": "BLOCK",
      "type": "test_validators_variable_1s_null",
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
    },
    {
      "kind": "BLOCK",
      "type": "test_mutators_noflyout",
    },
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
      "type": "test_style_hat",
    },
    {
      "kind": "LABEL",
      "text": "Colour"
    },
    {
      "kind": "BLOCK",
      "type": "test_style_hex1",
    },
    {
      "kind": "BLOCK",
      "type": "test_style_hex2",
    },
    {
      "kind": "BLOCK",
      "type": "test_style_hex3",
    },
    {
      "kind": "BLOCK",
      "type": "test_style_no_colour",
    },
    {
      "kind": "BLOCK",
      "type": "test_style_hex4",
    },
    {
      "kind": "BLOCK",
      "type": "test_style_hex5",
      "gap": "40",
    },
    {
      "kind": "BLOCK",
      "type": "test_style_hex5",
      "disabled": "true",
    },
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
