/**
 * @license
 * Blockly Tests
 *
 * Copyright 2017 Google Inc.
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
'use strict';

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
  {
    "type": "empty_block",
    "message0": "",
    "args0": []
  },
  {
    "type": "example_dropdown_long",
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
    "type": "example_dropdown_images",
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "FIELDNAME",
        "options": [
          [{"src": "../media/test_a.png", "width": 32, "height": 32, "alt": "A"}, "A"],
          [{"src": "../media/test_b.png", "width": 32, "height": 32, "alt": "B"}, "B"],
          [{"src": "../media/test_c.png", "width": 32, "height": 32, "alt": "C"}, "C"],
          [{"src": "../media/test_d.png", "width": 32, "height": 32, "alt": "D"}, "D"],
          [{"src": "../media/test_e.png", "width": 32, "height": 32, "alt": "E"}, "E"],
          [{"src": "../media/test_f.png", "width": 32, "height": 32, "alt": "F"}, "F"],
          [{"src": "../media/test_g.png", "width": 32, "height": 32, "alt": "G"}, "G"],
          [{"src": "../media/test_h.png", "width": 32, "height": 32, "alt": "H"}, "H"],
          [{"src": "../media/test_i.png", "width": 32, "height": 32, "alt": "I"}, "I"],
          [{"src": "../media/test_j.png", "width": 32, "height": 32, "alt": "J"}, "J"],
          [{"src": "../media/test_k.png", "width": 32, "height": 32, "alt": "K"}, "K"],
          [{"src": "../media/test_l.png", "width": 32, "height": 32, "alt": "L"}, "L"],
          [{"src": "../media/test_m.png", "width": 32, "height": 32, "alt": "M"}, "M"]
        ]
      }
    ]
  },
  {
    "type": "example_dropdown_images_and_text",
    "message0": "%1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "FIELDNAME",
        "options": [
          ["images and text", "IMAGES AND TEXT"],
          [{"src": "../media/test_a.png", "width": 32, "height": 32, "alt": "A"}, "A"],
          [{"src": "../media/test_b.png", "width": 32, "height": 32, "alt": "B"}, "B"],
          [{"src": "../media/test_c.png", "width": 32, "height": 32, "alt": "C"}, "C"],
          [{"src": "../media/test_d.png", "width": 32, "height": 32, "alt": "D"}, "D"],
          [{"src": "../media/test_e.png", "width": 32, "height": 32, "alt": "E"}, "E"],
          [{"src": "../media/test_f.png", "width": 32, "height": 32, "alt": "F"}, "F"],
          [{"src": "../media/test_g.png", "width": 32, "height": 32, "alt": "G"}, "G"],
          [{"src": "../media/test_h.png", "width": 32, "height": 32, "alt": "H"}, "H"],
          ["xyz", "LMNOP"],
          [{"src": "../media/test_i.png", "width": 32, "height": 32, "alt": "I"}, "I"],
          [{"src": "../media/test_j.png", "width": 32, "height": 32, "alt": "J"}, "J"],
          [{"src": "../media/test_k.png", "width": 32, "height": 32, "alt": "K"}, "K"],
          [{"src": "../media/test_l.png", "width": 32, "height": 32, "alt": "L"}, "L"],
          [{"src": "../media/test_m.png", "width": 32, "height": 32, "alt": "M"}, "M"]
        ]
      }
    ]
  },
  {
    "type": "example_angle",
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
      ]
  },
  {
    "type": "example_date",
    "message0": "date: %1",
    "args0": [
      {
        "type": "field_date",
        "name": "FIELDNAME",
        "date": "2020-02-20",
        "alt":
          {
            "type": "field_label",
            "text": "NO DATE FIELD"
          }
      }
    ]
  },
  {
    "type": "test_number",
    "message0": "float %1",
    "args0": [
      {
        "type": "field_number",
        "name": "NUM",
        "text": "0"
      }
    ],
    "colour": 230,
    "output": "Number",
    "tooltip": "A number."
  },
  {
    "type": "test_integer",
    "message0": "integer %1",
    "args0": [
      {
        "type": "field_number",
        "name": "NUM",
        "precision": 1,
        "text": "0"
      }
    ],
    "colour": 230,
    "output": "Number",
    "tooltip": "An integer."
  },
  {
    "type": "test_number_hundredths",
    "message0": "$ %1",
    "args0": [
      {
        "type": "field_number",
        "name": "NUM",
        "precision": 0.01,
        "text": "0"
      }
    ],
    "colour": 230,
    "output": "Number",
    "tooltip": "A dollar amount."
  },
  {
    "type": "test_integer_bounded",
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
    "colour": 230,
    "output": "Note",
    "tooltip": "A midi note."
  },
  {
    "type": "image_datauri",
    "message0": "Image data: URI %1",
    "args0": [
      {
        "type": "field_image",
        "src": "data:image/png;base64,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",
        "width": 50,
        "height": 50,
        "alt": "*"
      }
    ],
    "colour": 160
  },
  {
    "type": "image_small",
    "message0": "Image too small %1",
    "args0": [
      {
        "type": "field_image",
        "src": "../media/test_30px.png",
        "width": 50,
        "height": 50,
        "alt": "*"
      }
    ],
    "colour": 160
  },
  {
    "type": "image_large",
    "message0": "Image too large %1",
    "args0": [
      {
        "type": "field_image",
        "src": "../media/test_200px.png",
        "width": 50,
        "height": 50,
        "alt": "*"
      }
    ],
    "colour": 160
  },
  {
    "type": "image_missing",
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
    "colour": 160
  },
  {
    "type": "test_with_lots_of_network_icons",
    "message0": "Lots of network icons: %1 %2 %3 %4 %5 %6 %7 %8 %9 %10 %11 %12 %13 %14 %15 %16 %17 %18",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/media/test_a.png",
        "width": 32,
        "height": 32,
        "alt": "A"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/media/test_b.png",
        "width": 32,
        "height": 32,
        "alt": "B"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/media/test_c.png",
        "width": 32,
        "height": 32,
        "alt": "C"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/media/test_d.png",
        "width": 32,
        "height": 32,
        "alt": "D"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/media/test_e.png",
        "width": 32,
        "height": 32,
        "alt": "E"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/media/test_f.png",
        "width": 32,
        "height": 32,
        "alt": "F"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/media/test_g.png",
        "width": 32,
        "height": 32,
        "alt": "G"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/media/test_h.png",
        "width": 32,
        "height": 32,
        "alt": "H"
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/media/test_a.png",
        "width": 32,
        "height": 32,
        "alt": "A"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/media/test_b.png",
        "width": 32,
        "height": 32,
        "alt": "B"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/media/test_c.png",
        "width": 32,
        "height": 32,
        "alt": "C"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/media/test_d.png",
        "width": 32,
        "height": 32,
        "alt": "D"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/media/test_e.png",
        "width": 32,
        "height": 32,
        "alt": "E"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/media/test_f.png",
        "width": 32,
        "height": 32,
        "alt": "F"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/media/test_g.png",
        "width": 32,
        "height": 32,
        "alt": "G"
      },
      {
        "type": "field_image",
        "src": "https://blockly-demo.appspot.com/static/media/test_h.png",
        "width": 32,
        "height": 32,
        "alt": "H"
      }
    ],
    "colour": 160
  },
  {
    "type": "styled_event_cap",
    "message0": "Hat block (event)",
    "nextStatement": null,
    "colour": 330,
    "style": {
      "hat": "cap"
    }
  },
  {
    "type": "block_colour_hex1",
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
    "type": "block_colour_hex2",
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
    "type": "block_colour_hex3",
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
    "type": "block_no_colour",
    "message0": "Block color: unset"
  },
  {
    "type": "block_colour_hex4",
    "message0": "Block color: #RRGGBBAA (invalid)",
    "colour": "#992aff99"
  },
  {
    "type": "block_colour_hex5",
    "message0": "Block color: #RRGGBB (invalid)",
    "colour": "#NotHex"
  },
  {
    "type": "emoji_label_robot_face",
    "message0": "Robot Face: \uD83E\uDD16",
    "colour": "#AAAAAA"
  }
]);  // END JSON EXTRACT (Do not delete this comment.)

Blockly.Blocks['empty_block_with_mutator'] = {
  init: function() {
    this.setMutator(new Blockly.Mutator(['math_number']));
  }
};