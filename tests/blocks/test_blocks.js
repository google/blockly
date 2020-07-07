/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

goog.provide('Blockly.TestBlocks');

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
  {
    "type": "test_basic_empty",
    "message0": "",
    "args0": []
  },
  {
    "type": "test_basic_stack",
    "message0": "stack block",
    "previousStatement": null,
    "nextStatement": null,
    "colour": "120"
  },
  {
    "type": "test_basic_dummy",
    "message0": "dummy input %1",
    "args0": [
      {
        "type": "input_dummy"
      }
    ],
    "style": "math_blocks"
  },
  {
    "type": "test_basic_multiple_dummy",
    "message0": "first dummy %1 second dummy %2",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_dummy"
      }
    ],
    "style": "math_blocks"
  },
  {
    "type": "test_basic_row",
    "message0": "row block %1",
    "args0": [
      {
        "type": "input_value",
        "name": "INPUT"
      }
    ],
    "output": null,
    "style": "math_blocks"
  },
  {
    "type": "test_basic_value_to_stack",
    "message0": "value to stack",
    "nextStatement": null,
    "output": null,
    "style": "math_blocks"
  },
  {
    "type": "test_basic_value_to_statement",
    "message0": "value to statement %1",
    "args0": [
      {
        "type": "input_statement",
        "name": "STATEMENT"
      }
    ],
    "output": null,
    "style": "math_blocks"
  },
  {
    "type": "test_basic_limit_instances",
    "message0": "limit 3 instances %1 %2",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "STATEMENT"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "style": "math_blocks",
  },
  {
    "type": "test_basic_tooltips",
    "message0": "%1 %2 %3",
    "args0": [
      {
        "type": "field_label",
        "name": "NAME",
        "text": "field tooltip",
        "tooltip": "This is a JSON tooltip for the *field*."
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "field_label",
        "name": "NAME",
        "text": "block tooltip"
      }
    ],
    "tooltip": "This is a JSON tooltip for the *block*.",
    "style": "math_blocks"
  },
  {
    "type": "test_basic_javascript",
    "message0": "function %1(%2) { %3 %4 return %5 }",
    "args0": [
      "foo",
      "args",
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "STACK"
      },
      {
        "type": "input_value",
        "check": "number",
        "align": "right",
        "name": "RETURN"
      }
    ],
    "inputsInline": true,
    "colour": 200,
    "tooltip": "Hello world."
  },
  {
    "type": "test_align_dummy_right",
    "message0": "text right %1 long text right %2",
    "args0": [
      {
        "type": "input_dummy",
        "align": "RIGHT",
      },
      {
        "type": "input_dummy",
        "align": "RIGHT",
      },
    ],
    "style": "math_blocks"
  },
  {
    "type": "test_align_all",
    "message0": "text %1 long text left %2 text centre %3 much longer text right %4",
    "args0": [
      {
        "type": "input_dummy",
      },
      {
        "type": "input_dummy",
        "align": "LEFT",
      },
      {
        "type": "input_dummy",
        "align": "CENTRE",
      },
      {
        "type": "input_dummy",
        "align": "RIGHT",
      },
    ],
    "style": "math_blocks"
  },
  {
    "type": "test_align_with_external_input",
    "message0": "text right %1 long text centre %2 text left %3 much longer text %4",
    "args0": [
      {
        "type": "input_dummy",
        "align": "RIGHT",
      },
      {
        "type": "input_dummy",
        "align": "CENTRE",
      },
      {
        "type": "input_dummy",
        "align": "LEFT",
      },
      {
        "type": "input_value",
        "name": "VALUE"
      },
    ],
    "inputsInline": false,
    "style": "math_blocks"
  },
  {
    "type": "test_connections_row_input",
    "message0": "%1",
    "args0": [
      {
        "type": "input_value",
        "name": "NAME",
      }
    ],
    "colour": '#aaaaaa',
    "tooltip": "No Checks\n" +
        "Can connect to any output connection."
  },
  {
    "type": "test_connections_row_blue",
    "message0": "%1",
    "args0": [
      {
        "type": "input_value",
        "name": "NAME",
        "check": "greenRel"
      }
    ],
    "output": "noneOut",
    "colour": 230,
    "tooltip": "Output: noneOut\n" +
        "Input: greenRel\n" +
        "Input connection can accept yellow blocks but not red blocks."
  },
  {
    "type": "test_connections_row_yellow",
    "message0": "%1",
    "args0": [
      {
        "type": "input_value",
        "name": "NAME",
        "check": [
          "orangeRel",
          "yellowRel"
        ]
      }
    ],
    "output": [
      "yellowRel",
      "greenRel"
    ],
    "colour": 60,
    "tooltip": "Output: yellowRel, greenRel\n" +
        "Input: yellowRel, orangeRel\n" +
        "Output can connect to yellow blocks and blue blocks, but not red blocks.\n" +
        "Input can connect to yellow blocks and red blocks, but not blue blocks."
  },
  {
    "type": "test_connections_row_red",
    "message0": "%1",
    "args0": [
      {
        "type": "input_value",
        "name": "NAME",
        "check": "noneIn"
      }
    ],
    "output": "orangeRel",
    "colour": 0,
    "tooltip": "Output: orangeRel\n" +
        "Input: noneIn\n" +
        "Output can connect to yellow blocks, but not blue blocks."
  },
  {
    "type": "test_connections_row_output",
    "message0": "",
    "output": null,
    "colour": '#aaaaaa',
    "tooltip": "No Checks\n" +
        "Can connect to any input connection."
  },
  {
    "type": "test_connections_multivalue_1valid",
    "message0": "none %1 both %2",
    "args0": [
      {
        "type": "input_value",
        "name": "NAME1",
        "align": "RIGHT",
        "check": "noneIn"
      },
      {
        "type": "input_value",
        "name": "NAME2",
        "align": "RIGHT",
        "check": [
          "yellowRel",
          "orangeRel"
        ]
      }
    ],
    "output": [
      "yellowRel",
      "greenRel"
    ],
    "colour": 60,
    "tooltip": "Output: yellowRel, greenRel\n" +
        "Input Top: noneIn\n" +
        "Input Bottom: yellowRel, orangeRel\n" +
        "Output can connect to yellow blocks and blue blocks, but not red blocks.\n" +
        "Top Input can connect to nothing, except grey blocks.\n" +
        "Bottom Input can connect to yellow blocks and red blocks, but not blue" +
        " blocks."
  },
  {
    "type": "test_connections_multivalue_2valid",
    "message0": "both %1 both %2",
    "args0": [
      {
        "type": "input_value",
        "name": "NAME1",
        "align": "RIGHT",
        "check": [
          "yellowRel",
          "orangeRel"
        ]
      },
      {
        "type": "input_value",
        "name": "NAME2",
        "align": "RIGHT",
        "check": [
          "yellowRel",
          "orangeRel"
        ]
      }
    ],
    "output": [
      "yellowRel",
      "greenRel"
    ],
    "colour": 60,
    "tooltip": "Output: yellowRel, greenRel\n" +
        "Input Top:  yellowRel, orangeRel\n" +
        "Input Bottom: yellowRel, orangeRel\n" +
        "Output can connect to yellow blocks and blue blocks, but not red blocks.\n" +
        "Top Input can connect to yellow blocks and red blocks, but not blue" +
        " blocks.\n" +
        "Bottom Input can connect to yellow blocks and red blocks, but not blue" +
        " blocks."
  },
  {
    "type": "test_connections_stack_next",
    "message0": "",
    "nextStatement": null,
    "colour": '#aaaaaa',
    "tooltip": "No Checks\n" +
        "Can connect to any previous connection."
  },
  {
    "type": "test_connections_stack_blue",
    "message0": "",
    "previousStatement": "nonePrev",
    "nextStatement": "greenRel",
    "colour": 230,
    "tooltip": "Prev: nonePrev\n" +
        "Next: greenRel\n" +
        "Next connection can accept yellow blocks but not red blocks."
  },
  {
    "type": "test_connections_stack_yellow",
    "message0": "",
    "previousStatement": [
      "greenRel",
      "yellowRel"
    ],
    "nextStatement": [
      "yellowRel",
      "orangeRel"
    ],
    "colour": 60,
    "tooltip": "Prev: yellowRel, greenRel\n" +
        "Next: yellowRel, orangeRel\n" +
        "Prev can connect to yellow blocks and blue blocks, but not red blocks.\n" +
        "Next can connect to yellow blocks and red blocks, but not blue blocks."
  },
  {
    "type": "test_connections_stack_red",
    "message0": "",
    "previousStatement": "orangeRel",
    "nextStatement": "noneNext",
    "colour": 0,
    "tooltip": "Prev: orangeRel\n" +
        "Next: noneNext\n" +
        "Prev can connect to yellow blocks, but not blue blocks."
  },
  {
    "type": "test_connections_stack_prev",
    "message0": "",
    "previousStatement": null,
    "colour": '#aaaaaa',
    "tooltip": "No Checks\n" +
        "Can connect to any input connection."
  },
  {
    "type": "test_connections_statement_blue",
    "message0": "%1",
    "args0": [
      {
        "type": "input_statement",
        "name": "NAME",
        "check": "greenRel"
      }
    ],
    "previousStatement": "nonePrev",
    "nextStatement": "greenRel",
    "colour": 230,
    "tooltip": "Prev: nonePrev\n" +
        "Next: greenRel\n" +
        "Statement: greenRel\n" +
        "Next connection can accept yellow blocks but not red blocks.\n" +
        "Statement connection can accept yellow blocks but not red blocks."
  },
  {
    "type": "test_connections_statement_yellow",
    "message0": "%1",
    "args0": [
      {
        "type": "input_statement",
        "name": "NAME",
        "check":  [
          "yellowRel",
          "orangeRel"
        ]
      }
    ],
    "previousStatement": [
      "greenRel",
      "yellowRel"
    ],
    "nextStatement": [
      "yellowRel",
      "orangeRel"
    ],
    "colour": 60,
    "tooltip": "Prev: yellowRel, greenRel\n" +
        "Next: yellowRel, orangeRel\n" +
        "Statement: orangeRel\n" +
        "Prev can connect to yellow blocks and blue blocks, but not red" +
        " blocks.\n" +
        "Next can connect to yellow blocks and red blocks, but not blue" +
        " blocks.\n" +
        "Statement connection can accept yellow blocks and red blocks but not" +
        " blue blocks.\n"
  },
  {
    "type": "test_connections_statement_red",
    "message0": "%1",
    "args0": [
      {
        "type": "input_statement",
        "name": "NAME",
        "check": "noneNext"
      }
    ],
    "previousStatement": "orangeRel",
    "nextStatement": "noneNext",
    "colour": 0,
    "tooltip": "Prev: orangeRel\n" +
        "Next: noneNext\n" +
        "Statement: noneNext\n" +
        "Prev connection can accept yellow blocks but not blue blocks.\n" +
        "Statement connection accepts none."
  },
  {
    "type": "test_connections_statement_nonext",
    "message0": "%1",
    "args0": [
      {
        "type": "input_statement",
        "name": "NAME",
        "check":  [
          "yellowRel",
          "orangeRel"
        ]
      }
    ],
    "previousStatement": [
      "greenRel",
      "yellowRel"
    ],
    "colour": 60,
    "tooltip": "Prev: yellowRel, greenRel\n" +
        "Next: yellowRel, orangeRel\n" +
        "Statement: orangeRel\n" +
        "Prev can connect to yellow blocks and blue blocks, but not red" +
        " blocks.\n" +
        "Statement connection can accept yellow blocks and red blocks but not" +
        " blue blocks.\n"
  },
  {
    "type": "test_connections_multistatement_1valid",
    "message0": "none %1 both %2",
    "args0": [
      {
        "type": "input_statement",
        "name": "NAME",
        "check": "noneNext"
      },
      {
        "type": "input_statement",
        "name": "NAME",
        "check":  [
          "yellowRel",
          "orangeRel"
        ]
      }
    ],
    "previousStatement": [
      "greenRel",
      "yellowRel"
    ],
    "colour": 60,
    "tooltip": "Prev: yellowRel, greenRel\n" +
        "Next: yellowRel, orangeRel\n" +
        "Statement: orangeRel\n" +
        "Prev can connect to yellow blocks and blue blocks, but not red" +
        " blocks.\n" +
        "Top Statement cannot connect to anything, except grey blocks.\n" +
        "Bottom Statement connection can accept yellow blocks and red blocks" +
        " but not blue blocks.\n"
  },
  {
    "type": "test_connections_multistatement_2valid",
    "message0": "both %1 both %2",
    "args0": [
      {
        "type": "input_statement",
        "name": "NAME",
        "check": [
          "yellowRel",
          "orangeRel"
        ]
      },
      {
        "type": "input_statement",
        "name": "NAME",
        "check": [
          "yellowRel",
          "orangeRel"
        ]
      }
    ],
    "previousStatement": [
      "greenRel",
      "yellowRel"
    ],
    "colour": 60,
    "tooltip": "Prev: yellowRel, greenRel\n" +
        "Next: yellowRel, orangeRel\n" +
        "Statement: orangeRel\n" +
        "Prev can connect to yellow blocks and blue blocks, but not red" +
        " blocks.\n" +
        "Top Statement connection can accept yellow blocks and red blocks but" +
        " not blue blocks.\n" +
        "Bottom Statement connection can accept yellow blocks and red blocks" +
        " but not blue blocks.\n"
  },
  {
    "type": "test_dropdowns_long",
    "message0": "long: %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "FIELDNAME",
        "options": [
          [ "first item", "ITEM1" ],
          [ "second item", "ITEM2" ],
          [ "third item", "ITEM3" ],
          [ "fourth item", "ITEM4" ],
          [ "fifth item", "ITEM5" ],
          [ "sixth item", "ITEM6" ],
          [ "seventh item", "ITEM7" ],
          [ "eighth item", "ITEM8" ],
          [ "ninth item", "ITEM9" ],
          [ "tenth item", "ITEM10" ],
          [ "eleventh item", "ITEM11" ],
          [ "twelfth item", "ITEM12" ],
          [ "thirteenth item", "ITEM13" ],
          [ "fourteenth item", "ITEM14" ],
          [ "fifteenth item", "ITEM15" ],
          [ "sixteenth item", "ITEM16" ],
          [ "seventeenth item", "ITEM17" ],
          [ "eighteenth item", "ITEM18" ],
          [ "nineteenth item", "ITEM19" ],
          [ "twentieth item", "ITEM20" ],
          [ "twenty-first item", "ITEM21" ],
          [ "twenty-second item", "ITEM22" ],
          [ "twenty-third item", "ITEM23" ],
          [ "twenty-fourth item", "ITEM24" ],
          [ "twenty-fifth item", "ITEM25" ],
          [ "twenty-sixth item", "ITEM26" ],
          [ "twenty-seventh item", "ITEM27" ],
          [ "twenty-eighth item", "ITEM28" ],
          [ "twenty-ninth item", "ITEM29" ],
          [ "thirtieth item", "ITEM30" ],
          [ "thirty-first item", "ITEM31" ],
          [ "thirty-second item", "ITEM32" ]
        ]
      }
    ]
  },
  {
    "type": "test_dropdowns_images",
    "message0": "%1",
    "args0": [
      {
        "NOTE": "The following paths are relative to playground.html",
        "type": "field_dropdown",
        "name": "FIELDNAME",
        "options": [
          [{"src": "media/a.png", "width": 32, "height": 32, "alt": "A"}, "A"],
          [{"src": "media/b.png", "width": 32, "height": 32, "alt": "B"}, "B"],
          [{"src": "media/c.png", "width": 32, "height": 32, "alt": "C"}, "C"],
          [{"src": "media/d.png", "width": 32, "height": 32, "alt": "D"}, "D"],
          [{"src": "media/e.png", "width": 32, "height": 32, "alt": "E"}, "E"],
          [{"src": "media/f.png", "width": 32, "height": 32, "alt": "F"}, "F"],
          [{"src": "media/g.png", "width": 32, "height": 32, "alt": "G"}, "G"],
          [{"src": "media/h.png", "width": 32, "height": 32, "alt": "H"}, "H"],
          [{"src": "media/i.png", "width": 32, "height": 32, "alt": "I"}, "I"],
          [{"src": "media/j.png", "width": 32, "height": 32, "alt": "J"}, "J"],
          [{"src": "media/k.png", "width": 32, "height": 32, "alt": "K"}, "K"],
          [{"src": "media/l.png", "width": 32, "height": 32, "alt": "L"}, "L"],
          [{"src": "media/m.png", "width": 32, "height": 32, "alt": "M"}, "M"]
        ]
      }
    ]
  },
  {
    "type": "test_dropdowns_images_and_text",
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "FIELDNAME",
        "options": [
          ["images and text", "IMAGES AND TEXT"],
          [{"src": "media/a.png", "width": 32, "height": 32, "alt": "A"}, "A"],
          [{"src": "media/b.png", "width": 32, "height": 32, "alt": "B"}, "B"],
          [{"src": "media/c.png", "width": 32, "height": 32, "alt": "C"}, "C"],
          [{"src": "media/d.png", "width": 32, "height": 32, "alt": "D"}, "D"],
          [{"src": "media/e.png", "width": 32, "height": 32, "alt": "E"}, "E"],
          [{"src": "media/f.png", "width": 32, "height": 32, "alt": "F"}, "F"],
          [{"src": "media/g.png", "width": 32, "height": 32, "alt": "G"}, "G"],
          [{"src": "media/h.png", "width": 32, "height": 32, "alt": "H"}, "H"],
          ["xyz", "LMNOP"],
          [{"src": "media/i.png", "width": 32, "height": 32, "alt": "I"}, "I"],
          [{"src": "media/j.png", "width": 32, "height": 32, "alt": "J"}, "J"],
          [{"src": "media/k.png", "width": 32, "height": 32, "alt": "K"}, "K"],
          [{"src": "media/l.png", "width": 32, "height": 32, "alt": "L"}, "L"],
          [{"src": "media/m.png", "width": 32, "height": 32, "alt": "M"}, "M"]
        ]
      }
    ]
  },
  {
    "type": "test_dropdowns_in_mutator",
    "message0": "dropdown mutator",
    "mutator": "test_dropdown_mutator"
  },
  {
    "type": "test_dropdowns_in_mutator_block",
    "message0": "dropdown %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "DROPDOWN",
        "options": [
          [ "option", "ONE" ],
          [ "option", "TWO" ]
        ]
      },
    ]
  },
  {
    "type": "test_fields_angle",
    "message0": "angle: %1",
    "args0": [
      {
        "type": "field_angle",
        "name": "FIELDNAME",
        "angle": "90",
        "alt":
          {
            "type": "field_label",
            "text": "NO ANGLE FIELD"
          }
      }
    ],
    "style": "math_blocks",
  },
  {
    "type": "test_fields_text_input",
    "message0": "text input %1",
    "args0": [
      {
        "type": "field_input",
        "name": "TEXT_INPUT",
        "text": "default"
      }
    ],
    "style": "math_blocks",
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "test_fields_only_text_input",
    "message0": "%1",
    "args0": [
      {
        "type": "field_input",
        "name": "TEXT_INPUT",
        "text": "default"
      }
    ],
    "style": "textInput",
    "tooltip": "",
    "helpUrl": "",
    "output": "String"
  },
  {
    "type": "test_fields_multilinetext",
    "message0": "code %1",
    "args0": [
      {
        "type": "field_multilinetext",
        "name": "CODE",
        "text": "default1\ndefault2"
      }
    ],
    "style": "math_blocks",
    "tooltip": "test tooltip"
  },
  {
    "type": "test_fields_checkbox",
    "message0": "checkbox %1",
    "args0": [
      {
        "type": "field_checkbox",
        "name": "CHECKBOX",
        "checked": true
      }
    ],
    "style": "math_blocks",
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "test_fields_colour",
    "message0": "colour %1",
    "args0": [
      {
        "type": "field_colour",
        "name": "COLOUR",
        "colour": "#ff0000"
      }
    ],
    "style": "math_blocks",
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "test_fields_colour_options",
    "message0": "colour options %1",
    "args0": [
      {
        "type": "field_colour",
        "name": "COLOUR",
        "colour": "#ff4040",
        "colourOptions":
          ['#ff4040', '#ff8080', '#ffc0c0',
            '#4040ff', '#8080ff', '#c0c0ff'],
        "colourTitles":
          ['dark pink', 'pink', 'light pink',
            'dark blue', 'blue', 'light blue'],
        "columns": 3
      }
    ],
    "style": "math_blocks",
    "tooltip": "test tooltip"
  },
  {
    "type": "test_fields_variable",
    "message0": "variable %1",
    "args0": [
      {
        "type": "field_variable",
        "name": "VARIABLE",
        "variable": "item"
      }
    ],
    "style": "math_blocks",
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "test_fields_label_serializable",
    "message0": "label serializable %1",
    "args0": [
      {
        "type": "field_label_serializable",
        "name": "LABEL",
        "text": "default"
      }
    ],
    "style": "math_blocks",
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "test_fields_image",
    "message0": "image %1",
    "args0": [
      {
        "type": "field_image",
        "name": "IMAGE",
        "src": "https://blockly-demo.appspot.com/static/tests/media/a.png",
        "width": 32,
        "height": 32,
        "alt": "A"
      }
    ],
    "colour": 230
  },
  {
    "type": "test_numbers_float",
    "message0": "float %1",
    "args0": [
      {
        "type": "field_number",
        "name": "NUM",
        "text": "0"
      }
    ],
    "style": "math_blocks",
    "output": "Number",
    "tooltip": "A number."
  },
  {
    "type": "test_numbers_whole",
    "message0": "precision 1 %1",
    "args0": [
      {
        "type": "field_number",
        "name": "NUM",
        "precision": 1,
        "text": "0"
      }
    ],
    "style": "math_blocks",
    "output": "Number",
    "tooltip": "The number should be rounded to multiples of 1"
  },
  {
    "type": "test_numbers_hundredths",
    "message0": "precision 0.01 %1",
    "args0": [
      {
        "type": "field_number",
        "name": "NUM",
        "precision": 0.01,
        "text": "0"
      }
    ],
    "style": "math_blocks",
    "output": "Number",
    "tooltip": "The number should be rounded to multiples of 0.01"
  },
  {
    "type": "test_numbers_halves",
    "message0": "precision 0.5 %1",
    "args0": [
      {
        "type": "field_number",
        "name": "NUM",
        "precision": 0.5,
        "text": "0"
      }
    ],
    "style": "math_blocks",
    "output": "Number",
    "tooltip": "The number should be rounded to multiples of 0.5"
  },
  {
    "type": "test_numbers_three_halves",
    "message0": "precision 1.5 %1",
    "args0": [
      {
        "type": "field_number",
        "name": "NUM",
        "precision": 1.5,
        "text": "0"
      }
    ],
    "style": "math_blocks",
    "output": "Number",
    "tooltip": "The number should be rounded to multiples of 1.5"
  },
  {
    "type": "test_numbers_whole_bounded",
    "message0": "midi note %1",
    "args0": [
      {
        "type": "field_number",
        "name": "NOTE",
        "precision": 1,
        "min": 1,
        "max": 127,
        "text": "0"
      }
    ],
    "style": "math_blocks",
    "output": "Note",
    "tooltip": "A midi note."
  },
  {
    "type": "test_angles_protractor",
    "message0": "protractor %1",
    "args0": [
      {
        "type": "field_angle",
        "name": "FIELDNAME",
        "angle": 0,
        "mode": "protractor"
      }
    ],
    "style": "math_blocks",
    "tooltip": "test tooltip"
  },
  {
    "type": "test_angles_compass",
    "message0": "compass %1",
    "args0": [
      {
        "type": "field_angle",
        "name": "FIELDNAME",
        "angle": 0,
        "mode": "compass"
      }
    ],
    "style": "math_blocks",
    "tooltip": "test tooltip"
  },
  {
    "type": "test_angles_clockwise",
    "message0": "clockwise %1",
    "args0": [
      {
        "type": "field_angle",
        "name": "FIELDNAME",
        "angle": 0,
        "clockwise": true
      }
    ],
    "style": "math_blocks",
    "tooltip": "test tooltip"
  },
  {
    "type": "test_angles_offset",
    "message0": "offset 90 %1",
    "args0": [
      {
        "type": "field_angle",
        "name": "FIELDNAME",
        "angle": 0,
        "offset": 90
      }
    ],
    "style": "math_blocks",
    "tooltip": "test tooltip"
  },
  {
    "type": "test_angles_wrap",
    "message0": "wrap %1",
    "args0": [
      {
        "type": "field_angle",
        "name": "FIELDNAME",
        "angle": 0,
        "wrap": 180
      }
    ],
    "style": "math_blocks",
    "tooltip": "test tooltip"
  },
  {
    "type": "test_angles_round_30",
    "message0": "round 30 %1",
    "args0": [
      {
        "type": "field_angle",
        "name": "FIELDNAME",
        "angle": 0,
        "round": 30
      }
    ],
    "style": "math_blocks",
    "tooltip": "test tooltip"
  },
  {
    "type": "test_angles_round_0",
    "message0": "no round %1",
    "args0": [
      {
        "type": "field_angle",
        "name": "FIELDNAME",
        "angle": 0,
        "round": 0
      }
    ],
    "style": "math_blocks",
    "tooltip": "test tooltip"
  },
  {
    "type": "test_images_datauri",
    "message0": "Image data: URI %1",
    "args0": [
      {
        "type": "field_image",
        "src": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAABHZJREFUaAXtmEuPDFEUx8cwJIx4jQjxSGYt4pWQiGSIz4A1O2FtLyx8B4+MxIKEtQkRsZBIEF/AAgki3gzjNfx/Xfc/rkpVd1dXdU13OMm/z73ndc+5r6rqgYHu01wNAfqa5kTZx+1I3PtNJ35Aqe4P6VrW+9mnEl6o/g/hu0Ab6koxg0nsjn+dVF6c+Yr8SZgUaGeRfR0ry6alzEFaGuYY/AryafFODjQ++EKOlfRq+nXSxzTeY2FHGHcocM/uIvXZWoA2ZJ1td0pGjKMoRY6d9Nr8ndemXdrMyayVYr1wQ9gn3BVIhNklNluKg06fNslTFDacG4q4LgwLxIIcO+nV+HtOY5HoF2FbgXG3y3ZKwPdsAb/KTeOZIxESOhRG2SB+SrgvfBDeC/cEZKwgdFjA5wydQHFMy2rh8WWxOYx4UJybiiTBR+Fzqu/nin2kHohj0a+dmEWfNYpwAefV3iSMCiMC5+GSYD0PSgjfWVkJDmoaJLRO8EocUXulMC68EW4KpuNqUAy2+EDpePRnjdj/JMhKUASH37N/S+0FgrePV+akZLWTl3+jRt4j7BbGhCUC9EAgcbbThdC+KL5aMA2Fxi5xbLkMoKXCmEBMYjMG5DGTXgW/XuqtiuVZNr8S4nM7cbBHBbYTehcxqDZJOTGv2DvJoKuC45lvaWiSbRea+cyHNN8i0UwHgyfilwUS+SYsFkiCmSYWD7tXwkOB5J8H7uRcCL48EPEDTMYqgYngneyl8FSAPHbSq+DXSWSFYmuwIhzg4WDgSYr93GY7kjQ++OaR7fP0M3IPNiNo0mBWCcxMm+izCtbBHRM5emR5FOvxi21ZibifF6Mh96BNjSIlgX9GfRJJkwen4CLbgrj2Tcds2Y9nt6VxQYOOkyo4TsO86IrkjRGvjNvmsQ8yCox1cTu2LdQuW4gT4wYyuZ21rbxKtsHHbcdynEK8TCEM7GS5jp3k8pAB16plQdRYCRLHxjp8JwVilSpG/h0TA08IXwUSAyTFNdwM2Nge32sCsTqmTp09c8zsM4H3KB6EJMcqW5+Oj946X88jklHMGoE3AuvVbJ/KbC1G4crkW4Ptsld4KzimZ1yiGSJJF0chy4Q7Av7xta5uMfKgxbz+WPMOxv9VrMhtwcmTJDqADKIAkgVeNWS8CbAi2M4akciEMCXwusFrB0WQPJy+z0qWDh98S58RxeiYvEXgnJUVIdIJcQqBQ8ib6fCNY+FTmMpsLZIlATiH1MQHFWT+Oun+JcvSOVZk3n5zsH3TTEuKgEjCf4k6pjnyZjqvhmMRrzCVWZF4MJLwwzGW086TW1eqAA/mWXO/b/n/Qnpt6f6vyL++Ir6hzCubj7q3lscz79tC/DVoXlkhVT0QWyXkV/TxYGhueSv/lvq6CuFM8CryQjgdsqJf2VmpfK+GJLOYi+FbvtIiGKwbK+JZNo+LQlb5+WCAbqyIY5rHhXSt3Y3BPOPmXUs+Dlzld7K30iMNwD8q3Ex85lquZv8QhzimdD/W9Xyb5H0z1Zbsb+OT/8HoqhrfAAAAAElFTkSuQmCC",
        "width": 50,
        "height": 50,
        "alt": "*"
      }
    ],
    "style": "text_blocks"
  },
  {
    "type": "test_images_small",
    "message0": "Image too small %1",
    "args0": [
      {
        "type": "field_image",
        "src": "media/30px.png",
        "width": 50,
        "height": 50,
        "alt": "*"
      }
    ],
    "style": "text_blocks"
  },
  {
    "type": "test_images_large",
    "message0": "Image too large %1",
    "args0": [
      {
        "type": "field_image",
        "src": "media/200px.png",
        "width": 50,
        "height": 50,
        "alt": "*"
      }
    ],
    "style": "text_blocks"
  },
  {
    "type": "test_images_fliprtl",
    "message0": "Image flipped RTL %1",
    "args0": [
      {
        "type": "field_image",
        "src": "media/arrow.png",
        "width": 50,
        "height": 50,
        "alt": "*",
        "flipRtl": true
      }
    ],
    "colour": 160
  },
  {
    "type": "test_images_missing",
    "message0": "Image missing %1",
    "args0": [
      {
        "type": "field_image",
        "src": "missing.png",
        "width": 50,
        "height": 50,
        "alt": "*"
      }
    ],
    "style": "text_blocks"
  },
  {
    "type": "test_images_many_icons",
    "message0": "Lots of network icons: %1 %2 %3 %4 %5 %6 %7 %8 %9 %10 %11 %12 %13 %14 %15 %16 %17 %18",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/tests/media/a.png",
        "width": 32,
        "height": 32,
        "alt": "A"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/tests/media/b.png",
        "width": 32,
        "height": 32,
        "alt": "B"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/tests/media/c.png",
        "width": 32,
        "height": 32,
        "alt": "C"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/tests/media/d.png",
        "width": 32,
        "height": 32,
        "alt": "D"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/tests/media/e.png",
        "width": 32,
        "height": 32,
        "alt": "E"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/tests/media/f.png",
        "width": 32,
        "height": 32,
        "alt": "F"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/tests/media/g.png",
        "width": 32,
        "height": 32,
        "alt": "G"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/tests/media/h.png",
        "width": 32,
        "height": 32,
        "alt": "H"
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/tests/media/a.png",
        "width": 32,
        "height": 32,
        "alt": "A"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/tests/media/b.png",
        "width": 32,
        "height": 32,
        "alt": "B"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/tests/media/c.png",
        "width": 32,
        "height": 32,
        "alt": "C"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/tests/media/d.png",
        "width": 32,
        "height": 32,
        "alt": "D"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/tests/media/e.png",
        "width": 32,
        "height": 32,
        "alt": "E"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/tests/media/f.png",
        "width": 32,
        "height": 32,
        "alt": "F"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/tests/media/g.png",
        "width": 32,
        "height": 32,
        "alt": "G"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/tests/media/h.png",
        "width": 32,
        "height": 32,
        "alt": "H"
      }
    ],
    "style": "text_blocks"
  },
  {
    "type": "test_mutators_noflyout",
    "message0": "noflyout mutator",
    "mutator": "test_noflyout_mutator",
    "colour": "#000000"
  },
  {
    "type": "test_mutators_noflyout_block",
    "message0": "colour %1",
    "args0": [
      {
        "type": "field_colour",
        "name": "COLOUR",
        "colour": "#ff0000"
      }
    ],
    "style": "colour_blocks"
  },
  {
    "type": "test_style_hat",
    "message0": "Hat block (event)",
    "nextStatement": null,
    "style": "hat_blocks"
  },
  {
    "type": "test_style_hex1",
    "message0": "Block color: Bright purple %1 %2 %3 %4",
    "args0": [
      {
        "type": "field_input",
        "name": "TEXT",
        "text": "#992aff"
      },
      {
        "type": "field_dropdown",
        "name": "DROPDOWN",
        "options": [
          [ "option", "ONE" ],
          [ "option", "TWO" ]
        ]
      },
      {
        "type": "field_checkbox",
        "name": "NAME",
        "checked": true
      },
      {
        "type": "input_value",
        "name": "NAME"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#992aff"
  },
  {
    "type": "test_style_hex2",
    "message0": "Block color: White %1 %2 %3 %4",
    "args0": [
      {
        "type": "field_input",
        "name": "TEXT",
        "text": "#fefefe"
      },
      {
        "type": "field_dropdown",
        "name": "DROPDOWN",
        "options": [
          [ "option", "ONE" ],
          [ "option", "TWO" ]
        ]
      },
      {
        "type": "field_checkbox",
        "name": "NAME",
        "checked": true
      },
      {
        "type": "input_value",
        "name": "NAME"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#fefefe"
  },
  {
    "type": "test_style_hex3",
    "message0": "Block color: Black %1 %2 %3 %4",
    "args0": [
      {
        "type": "field_input",
        "name": "TEXT",
        "text": "#010101"
      },
      {
        "type": "field_dropdown",
        "name": "DROPDOWN",
        "options": [
          [ "option", "ONE" ],
          [ "option", "TWO" ]
        ]
      },
      {
        "type": "field_checkbox",
        "name": "NAME",
        "checked": true
      },
      {
        "type": "input_value",
        "name": "NAME"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": "#010101"
  },
  {
    "type": "test_style_no_colour",
    "message0": "Block color: unset"
  },
  {
    "type": "test_style_hex4",
    "message0": "Block color: #RRGGBBAA (invalid)",
    "colour": "#992aff99"
  },
  {
    "type": "test_style_hex5",
    "message0": "Block color: #RRGGBB (invalid)",
    "colour": "#NotHex"
  },
  {
    "type": "test_style_emoji",
    "message0": "Robot Face: \uD83E\uDD16",
    "colour": "#AAAAAA"
  }
]);  // END JSON EXTRACT (Do not delete this comment.)

Blockly.Blocks['test_images_clickhandler'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("Image click handler")
      .appendField(new Blockly.FieldImage(
        "https://blockly-demo.appspot.com/static/tests/media/a.png", 32, 32,
        "image with click handler", this.onClick_), "IMAGE");
    this.setStyle('text_blocks');
  },
  onClick_: function() {
    alert('Image clicked');
  }
};

Blockly.Blocks['test_validators_dispose_block'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("dispose block")
        .appendField(new Blockly.FieldTextInput("default", this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('Any changes to the text cause the block to be disposed');
  },

  validate: function(newValue) {
    if (newValue != "default") {
      this.getSourceBlock().dispose(true);
    }
  }
};

Blockly.Blocks['test_validators_text_null'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("always null")
      .appendField(new Blockly.FieldTextInput("default", this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('All input validates to null (invalid). The display' +
      ' text will remain the input text, but the value should be the default' +
      ' text. The input should be red after the first keystroke.');
  },

  validate: function(newValue) {
    return null;
  }
};
Blockly.Blocks['test_validators_text_A'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("remove \'a\'")
      .appendField(new Blockly.FieldTextInput("default", this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('All \'a\' characters are removed from field value.' +
      ' The display text will include invalid \'a\' characters while the' +
      ' field is being edited, but the value will not.');
  },

  validate: function(newValue) {
    return newValue.replace(/\a/g, '');
  }
};
Blockly.Blocks['test_validators_text_B'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("\'b\' -> null")
      .appendField(new Blockly.FieldTextInput("default", this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('Upon detecting a \'b\' character the input will' +
      ' validated to null (invalid). Upon removal it should revert to being' +
      ' valid. The display text will remain the input text, but if the input' +
      ' text is invalid the value should be the default text.');
  },

  validate: function(newValue) {
    if (newValue.indexOf('b') != -1) {
      return null;
    }
    return newValue;
  }
};

Blockly.Blocks['test_validators_angle_null'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("always null")
      .appendField(new Blockly.FieldAngle(90, this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('All input validates to null (invalid). The field' +
      ' will display the input while the field is being edited (this' +
      ' includes the text and the graphic), but the value should be the' +
      ' default value. The input should be red after the first' +
      ' keystroke.');
  },

  validate: function(newValue) {
    return null;
  }
};
Blockly.Blocks['test_validators_angle_mult30_force'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("force mult of 30")
      .appendField(new Blockly.FieldAngle(90, this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('The input value will be rounded to the nearest' +
      ' multiple of 30. The field will display the input while the field is' +
      ' being edited (this includes the text and the graphic), but the value' +
      ' will be the validated (rounded) value. Note: If you want to do' +
      ' rounding this is not the proper way, use the ROUND property of the' +
      ' field angle instead.');
  },

  validate: function(newValue) {
    return Math.round(newValue / 30) * 30;
  }
};
Blockly.Blocks['test_validators_angle_mult30_null'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("not mult of 30 -> null")
      .appendField(new Blockly.FieldAngle(90, this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('If the input value is not a multiple of 30, the' +
      ' input will validated to null (invalid). The field will display the' +
      ' input while the field is being edited (this includes the text and' +
      ' the graphic), but if the input value is invalid the value should be' +
      ' the default value.');
  },

  validate: function(newValue) {
    if (newValue % 30 != 0) {
      return null;
    }
    return newValue;
  }
};

Blockly.Blocks['test_validators_checkbox_null'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("always null")
      .appendField(new Blockly.FieldCheckbox(true, this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('The new input always validates to null (invalid).' +
      ' This means that the field value should not change.');
  },

  validate: function(newValue) {
    return null;
  }
};
Blockly.Blocks['test_validators_checkbox_match'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("force match")
      .appendField(new Blockly.FieldCheckbox(true), "MATCH")
      .appendField(new Blockly.FieldCheckbox(true, this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('The validator for this block only works on the' +
      ' end-most checkbox. The validator will always return the value of the' +
      ' start-most checkbox. Therefor they should always match.')
  },

  validate: function(newValue) {
    return this.sourceBlock_.getFieldValue('MATCH');
  }
};
Blockly.Blocks['test_validators_checkbox_not_match_null'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("not match -> null")
      .appendField(new Blockly.FieldCheckbox(true), "MATCH")
      .appendField(new Blockly.FieldCheckbox(true, this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('The validator for this block only works on the' +
      ' end-most checkbox. If the new value does not match the value of the' +
      ' start-most checkbox, it will return null (invalid), which means the' +
      ' field value should not change. Therefore they should always match.');
  },

  validate: function(newValue) {
    if (this.sourceBlock_.getFieldValue('MATCH') != newValue) {
      return null;
    }
    return newValue;
  }
};

Blockly.Blocks['test_validators_colour_null'] = {
  init: function() {
    var colourField = new Blockly.FieldColour('#ff0000', this.validate);
    colourField.setColours([
      '#ffffff', '#ffdcdc', '#ffb4b4','#ff8c8c','#ff6464','#ff3c3c','#ff1414',
      '#00ffff', '#00dcdc', '#00b4b4','#008c8c','#006464','#003c3c','#001414']);

    this.appendDummyInput()
      .appendField("always null")
      .appendField(colourField, "INPUT");
    this.setColour(230);
    this.setCommentText('All input validates to null (invalid). This means' +
      ' the field value should not change.');
  },

  validate: function(newValue) {
    return null;
  }
};
Blockly.Blocks['test_validators_colour_force_red'] = {
  init: function() {
    var colourField = new Blockly.FieldColour('#ff0000', this.validate);
    colourField.setColours([
      '#ffffff', '#ffdcdc', '#ffb4b4','#ff8c8c','#ff6464','#ff3c3c','#ff1414',
      '#00ffff', '#00dcdc', '#00b4b4','#008c8c','#006464','#003c3c','#001414']);

    this.appendDummyInput()
      .appendField("force full red")
      .appendField(colourField, "INPUT");
    this.setColour(230);
    this.setCommentText('The input will have its red value replaced with' +
      ' full red.');
  },

  validate: function(newValue) {
    return '#ff' + newValue.substr(3, 4);
  }
};
Blockly.Blocks['test_validators_colour_red_null'] = {
  init: function() {
    var colourField = new Blockly.FieldColour('#ff0000', this.validate);
    colourField.setColours([
      '#ffffff', '#ffdcdc', '#ffb4b4','#ff8c8c','#ff6464','#ff3c3c','#ff1414',
      '#00ffff', '#00dcdc', '#00b4b4','#008c8c','#006464','#003c3c','#001414']);

    this.appendDummyInput()
      .appendField("not red -> null")
      .appendField(colourField, "INPUT");
    this.setColour(230);
    this.setCommentText('If the input does not have full red, the input will' +
      ' validate to null (invalid). Otherwise it will return the input value');
  },

  validate: function(newValue) {
    if (newValue.substr(1, 2) != 'ff') {
      return null;
    }
    return newValue;
  }
};

Blockly.Blocks['test_validators_dropdown_null'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("always null")
      .appendField(new Blockly.FieldDropdown([
        ["1a","1A"], ["1b","1B"], ["1c","1C"],
        ["2a","2A"], ["2b","2B"], ["2c","2C"]], this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('All input validates to null (invalid). This means' +
      ' the field value should not change.');
  },

  validate: function(newValue) {
    return null;
  }
};
Blockly.Blocks['test_validators_dropdown_force_1s'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("force 1s")
      .appendField(new Blockly.FieldDropdown([
        ["1a","1A"], ["1b","1B"], ["1c","1C"],
        ["2a","2A"], ["2b","2B"], ["2c","2C"]], this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('The input\'s value will always change to start with' +
      ' 1.');
  },

  validate: function(newValue) {
    return '1' + newValue.charAt(1);
  }
};
Blockly.Blocks['test_validators_dropdown_1s_null'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("not 1s -> null")
      .appendField(new Blockly.FieldDropdown([
        ["1a","1A"], ["1b","1B"], ["1c","1C"],
        ["2a","2A"], ["2b","2B"], ["2c","2C"]], this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('If the input does not start with 1, the input will' +
      ' validate to null (invalid). Otherwise it will return the input value.');
  },

  validate: function(newValue) {
    if (newValue.charAt(0) != '1') {
      return null;
    }
    return newValue;
  }
};

Blockly.Blocks['test_validators_number_null'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("always null")
      .appendField(new Blockly.FieldNumber(123, null, null, null, this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('All input validates to null (invalid). The field' +
      ' will display the input while the field is being edited, but the value' +
      ' should be the default value. The input should be red after the first' +
      ' keystroke.');
  },

  validate: function(newValue) {
    return null;
  }
};
Blockly.Blocks['test_validators_number_mult10_force'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("force mult of 10")
      .appendField(new Blockly.FieldNumber(123, null, null, null, this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('The input value will be rounded to the nearest' +
      ' multiple of 10. The field will display the input while the field is' +
      ' being edited, but the value should be the validated (rounded) value.' +
      ' Note: If you want to do rounding this is not the proper way, use the' +
      ' precision option of the number field constructor instead.');
  },

  validate: function(newValue) {
    return Math.round(newValue / 10) * 10;
  }
};
Blockly.Blocks['test_validators_number_mult10_null'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("not mult of 10 -> null")
      .appendField(new Blockly.FieldNumber(123, null, null, null, this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('If the input value is not a multiple of 10, the' +
      ' input will validate to null (invalid). The field will display the' +
      ' input while the field is being edited, but if the input value is' +
      ' invalid the value should be the default value.');
  },

  validate: function(newValue) {
    if (newValue % 10 != 0) {
      return null;
    }
    return newValue;
  }
};

Blockly.Blocks['test_validators_variable_null'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("always null")
      .appendField(new Blockly.FieldVariable('1a', this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('All ids validate to null (invalid). This means' +
      ' the variable should not change.');
  },

  validate: function(newValue) {
    return null;
  }
};
Blockly.Blocks['test_validators_variable_force_1s'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("force 1s")
      .appendField(new Blockly.FieldVariable('1a', this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('The id will always change to start with 1.');
  },

  validate: function(newValue) {
    return '1' + newValue.charAt(1);
  }
};
Blockly.Blocks['test_validators_variable_1s_null'] = {
  init: function() {
    this.appendDummyInput()
      .appendField("not 1s -> null")
      .appendField(new Blockly.FieldVariable('1a', this.validate), "INPUT");
    this.setColour(230);
    this.setCommentText('If the id does not start with 1, the id will' +
      ' validate to null (invalid). Otherwise it will return the id.');
  },

  validate: function(newValue) {
    if (newValue.charAt(0) != '1') {
      return null;
    }
    return newValue;
  }
};

Blockly.Blocks['test_basic_empty_with_mutator'] = {
  init: function() {
    this.setMutator(new Blockly.Mutator(['math_number']));
  }
};

/**
 * Mutator methods added to the test_mutators_noflyout block.
 * @mixin
 * @augments Blockly.Block
 * @package
 * @readonly
 */
var NO_FLYOUT_MUTATOR = {
  /**
   * Create XML to represent the block mutation.
   * @return {Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function() {
    var container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('colour', this.colour_);
    this.setColour(this.colour_);
    return container;
  },
  /**
   * Restore a block from XML.
   * @param {!Element} xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function(xmlElement) {
    this.colour_ = xmlElement.getAttribute('colour');
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this {Blockly.Block}
   */
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('test_mutators_noflyout_block');
    containerBlock.getField('COLOUR').setValue(this.colour_);
    containerBlock.initSvg();
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  compose: function(containerBlock) {
    this.colour_ = containerBlock.getFieldValue('COLOUR');
    this.setColour(this.colour_);
  },
};

/**
 * Register custom mutator used by the test_mutators_noflyout block.
 */
Blockly.Extensions.registerMutator('test_noflyout_mutator',
  NO_FLYOUT_MUTATOR, null, []);

Blockly.Blocks['test_dropdowns_dynamic'] = {
  init: function() {
    var dropdown = new Blockly.FieldDropdown(this.dynamicOptions);
    this.appendDummyInput()
      .appendField('dynamic')
      .appendField(dropdown, 'OPTIONS');
  },

  dynamicOptions: function() {
    if (!Blockly.TestBlocks.dynamicDropdownOptions_.length) {
      return [['', 'OPTION0']];
    }
    return Blockly.TestBlocks.dynamicDropdownOptions_;
  }
};

/**
 * An array of options for the dynamic dropdown.
 * @type {!Array.<!Array>}
 * @private
 */
Blockly.TestBlocks.dynamicDropdownOptions_ = [];

/**
 * Handles "add option" button in the field test category. This will prompt
 * the user for an option to add.
 * @package
 */
Blockly.TestBlocks.addDynamicDropdownOption = function() {
  Blockly.prompt('Add an option?',
      'option '  + Blockly.TestBlocks.dynamicDropdownOptions_.length,
      function(text) {
    if (text) {
      // Do not remove this log! Helps you know if it was added correctly.
      console.log('Adding option: ' + text);
      // The option is an array containing human-readable text and a
      // language-neutral id.
      Blockly.TestBlocks.dynamicDropdownOptions_.push(
          [text, 'OPTION' + Blockly.TestBlocks.dynamicDropdownOptions_.length]);
    }
  })
};

/**
 * Handles "remove option" button in the field test category. This will prompt
 * the user for an option to remove. May remove multiple options with the
 * same name.
 * @package
 */
Blockly.TestBlocks.removeDynamicDropdownOption = function() {
  var defaultText = Blockly.TestBlocks.dynamicDropdownOptions_[0] ?
      Blockly.TestBlocks.dynamicDropdownOptions_[0][0] : '';
  Blockly.prompt('Remove an option?', defaultText, function(text) {
    for (var i = 0, option;
         option = Blockly.TestBlocks.dynamicDropdownOptions_[i];
         i++) {
      // The option is an array containing human-readable text and a
      // language-neutral id, we'll compare against the human-readable text.
      if (option[0] == text) {
        // Do not remove this log! Helps you know if it was removed correctly.
        console.log('Removing option: ' + text);
        Blockly.TestBlocks.dynamicDropdownOptions_.splice(i, 1);
      }
    }
  })
};

Blockly.Blocks['test_dropdowns_dynamic_random'] = {
  init: function() {
    var dropdown = new Blockly.FieldDropdown(this.dynamicOptions);
    this.appendDummyInput()
      .appendField('dynamic random')
      .appendField(dropdown, 'OPTIONS');
  },

  dynamicOptions: function() {
    var random = Math.floor(Math.random() * 10) + 1;
    var options = [];
    for (var i = 0; i < random; i++) {
      options.push([String(i), String(i)]);
    }
    return options;
  }
};

/**
 * Mutator methods added to the test_dropdowns_in_mutator block.
 * @mixin
 * @augments Blockly.Block
 * @package
 * @readonly
 */
var DROPDOWN_MUTATOR = {
  /**
   * Create XML to represent the block mutation.
   * @return {Element} XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function() {
    var container = Blockly.utils.xml.createElement('mutation');
    return container;
  },
  /**
   * Restore a block from XML.
   * @param {!Element} _xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function(_xmlElement) {
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this {Blockly.Block}
   */
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('test_dropdowns_in_mutator_block');
    containerBlock.initSvg();
    
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} _containerBlock Root block in mutator.
   * @this {Blockly.Block}
   */
  compose: function(_containerBlock) {  
  },
};

/**
 * Register custom mutator used by the test_dropdowns_in_mutator block.
 */
Blockly.Extensions.registerMutator('test_dropdown_mutator',
  DROPDOWN_MUTATOR, null, ['test_dropdowns_in_mutator_block']);

/**
 * Handles "insert" button in the connection row test category. This will insert
 * a group of test blocks connected in a row.
 * @package
 */
Blockly.TestBlocks.insertConnectionRows = function(button) {
  var workspace = button.getTargetWorkspace();
  Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(
      '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
      '  <block type="test_connections_row_input">\n' +
      '    <value name="NAME">\n' +
      '      <block type="test_connections_row_blue">\n' +
      '        <value name="NAME">\n' +
      '          <block type="test_connections_row_yellow">\n' +
      '            <value name="NAME">\n' +
      '              <block type="test_connections_row_yellow">\n' +
      '                <value name="NAME">\n' +
      '                  <block type="test_connections_row_red">\n' +
      '                    <value name="NAME">\n' +
      '                      <block type="test_connections_row_output"/>\n' +
      '                    </value>\n' +
      '                  </block>\n' +
      '                </value>\n' +
      '              </block>\n' +
      '            </value>\n' +
      '          </block>\n' +
      '        </value>\n' +
      '      </block>\n' +
      '    </value>\n' +
      '  </block>\n' +
      '</xml>'
  ), workspace)
};

/**
 * Handles "insert" button in the connection stack test category. This will
 * insert a group of test blocks connected in a stack.
 * @package
 */
Blockly.TestBlocks.insertConnectionStacks = function(button) {
  var workspace = button.getTargetWorkspace();
  Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(
      '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
      '  <block type="test_connections_stack_next">\n' +
      '    <next>\n' +
      '      <block type="test_connections_stack_blue">\n' +
      '        <next>\n' +
      '          <block type="test_connections_stack_yellow">\n' +
      '            <next>\n' +
      '              <block type="test_connections_stack_yellow">\n' +
      '                <next>\n' +
      '                  <block type="test_connections_stack_red">\n' +
      '                    <next>\n' +
      '                      <block type="test_connections_stack_prev"/>\n' +
      '                    </next>\n' +
      '                  </block>\n' +
      '                </next>\n' +
      '              </block>\n' +
      '            </next>\n' +
      '          </block>\n' +
      '        </next>\n' +
      '      </block>\n' +
      '    </next>\n' +
      '  </block>\n' +
      '</xml>'
  ), workspace);
};

/**
 * Handles "insert" button in the connection statement test category. This will
 * insert a group of test blocks connected as statements.
 * @package
 */
Blockly.TestBlocks.insertConnectionStatements = function(button) {
  var workspace = button.getTargetWorkspace();
  Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(
      '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
      '  <block type="test_connections_statement_blue">\n' +
      '    <statement name="NAME">\n' +
      '      <block type="test_connections_statement_yellow">\n' +
      '        <statement name="NAME">\n' +
      '          <block type="test_connections_statement_yellow">\n' +
      '            <statement name="NAME">\n' +
      '              <block type="test_connections_statement_red"/>\n' +
      '            </statement>\n' +
      '          </block>\n' +
      '        </statement>\n' +
      '      </block>\n' +
      '    </statement>\n' +
      '  </block>\n' +
      '</xml>'
  ), workspace);
};
