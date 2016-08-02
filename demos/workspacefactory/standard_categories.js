/**
 * @fileoverview Contains a map of standard Blockly categories used to load
 * standard Blockly categories into the user's toolbox. The map is keyed by
 * the lower case name of the category, and contains the Category object for
 * that particular category.
 *
 * @author Emma Dauterman (evd2014)
 */

FactoryController.prototype.standardCategories = Object.create(null);

FactoryController.prototype.standardCategories['logic'] =
    new ListElement(ListElement.TYPE_CATEGORY, 'Logic');
FactoryController.prototype.standardCategories['logic'].xml =
    Blockly.Xml.textToDom(
    '<xml>' +
    '<block type="controls_if" x="13" y="13"></block>' +
    '<block type="logic_compare" x="13" y="88"></block>' +
    '<block type="logic_operation" x="13" y="138"></block>' +
    '<block type="logic_negate" x="13" y="188"></block>' +
    '<block type="logic_boolean" x="13" y="238"></block>' +
    '<block type="logic_null" x="13" y="288"></block>' +
    '<block type="logic_ternary" x="13" y="338"></block>' +
    '</xml>');
FactoryController.prototype.standardCategories['logic'].color = '#5C81A6';

FactoryController.prototype.standardCategories['loops'] =
    new ListElement(ListElement.TYPE_CATEGORY, 'Loops');
FactoryController.prototype.standardCategories['loops'].xml =
    Blockly.Xml.textToDom(
    '<xml>' +
    '<block type="controls_repeat_ext" x="13" y="13">' +
      '<value name="TIMES">' +
        '<shadow type="math_number">' +
          '<field name="NUM">10</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="controls_whileUntil" x="12" y="113"></block>' +
    '<block type="controls_for" x="12" y="213">' +
      '<value name="FROM">' +
        '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="TO">' +
        '<shadow type="math_number">' +
          '<field name="NUM">10</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="BY">' +
        '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="controls_forEach" x="12" y="313"></block>' +
    '<block type="controls_flow_statements" x="12" y="413"></block>' +
    '</xml>');
FactoryController.prototype.standardCategories['loops'].color = '#5CA65C';

FactoryController.prototype.standardCategories['math'] =
    new ListElement(ListElement.TYPE_CATEGORY, 'Math');
FactoryController.prototype.standardCategories['math'].xml =
    Blockly.Xml.textToDom(
    '<xml>' +
    '<block type="math_number" x="13" y="13"></block>' +
    '<block type="math_arithmetic" x="13" y="63">' +
      '<value name="A">' +
        '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="B">' +
        '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="math_single" x="13" y="113">' +
      '<value name="NUM">' +
        '<shadow type="math_number">' +
          '<field name="NUM">9</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="math_trig" x="13" y="163">' +
      '<value name="NUM">' +
        '<shadow type="math_number">' +
          '<field name="NUM">45</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="math_constant" x="13" y="213"></block>' +
    '<block type="math_number_property" x="13" y="263">' +
      '<value name="NUMBER_TO_CHECK">' +
        '<shadow type="math_number">' +
          '<field name="NUM">0</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="math_change" x="13" y="313">' +
      '<value name="DELTA">' +
        '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="math_round" x="13" y="363">' +
      '<value name="NUM">' +
        '<shadow type="math_number">' +
          '<field name="NUM">3.1</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="math_on_list" x="13" y="413"></block>' +
    '<block type="math_modulo" x="13" y="463">' +
      '<value name="DIVIDEND">' +
        '<shadow type="math_number">' +
          '<field name="NUM">64</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="DIVISOR">' +
        '<shadow type="math_number">' +
          '<field name="NUM">10</field>'+
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="math_constrain" x="13" y="512">' +
      '<value name="VALUE">' +
        '<shadow type="math_number">' +
          '<field name="NUM">50</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="LOW">' +
        '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="HIGH">' +
        '<shadow type="math_number">' +
          '<field name="NUM">100</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="math_random_int" x="13" y="562">' +
      '<value name="FROM">' +
        '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="TO">' +
        '<shadow type="math_number">' +
          '<field name="NUM">100</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="math_random_float" x="13" y="612"></block>' +
    '</xml>');
FactoryController.prototype.standardCategories['math'].color = '#5C68A6';

FactoryController.prototype.standardCategories['text'] =
    new ListElement(ListElement.TYPE_CATEGORY, 'Text');
FactoryController.prototype.standardCategories['text'].xml =
    Blockly.Xml.textToDom(
    '<xml>' +
    '<block type="text" x="13" y="13"></block>' +
    '<block type="text_join" x="13" y="63"></block>' +
    '<block type="text_append" x="13" y="138">' +
      '<value name="TEXT">' +
        '<shadow type="text"></shadow>' +
      '</value>' +
    '</block>' +
    '<block type="text_length" x="13" y="188">' +
      '<value name="VALUE">' +
        '<shadow type="text">' +
          '<field name="TEXT">abc</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="text_isEmpty" x="13" y="238">' +
      '<value name="VALUE">' +
        '<shadow type="text">' +
          '<field name="TEXT"></field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="text_indexOf" x="13" y="288">' +
      '<value name="VALUE">' +
        '<block type="variables_get">' +
          '<field name="VAR">text</field>' +
        '</block>' +
      '</value>' +
      '<value name="FIND">' +
        '<shadow type="text">' +
          '<field name="TEXT">abc</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="text_charAt" x="13" y="337">' +
      '<value name="VALUE">' +
        '<block type="variables_get">' +
          '<field name="VAR">text</field>' +
        '</block>' +
      '</value>' +
    '</block>' +
    '<block type="text_getSubstring" x="13" y="387">' +
      '<value name="STRING">' +
        '<block type="variables_get">' +
          '<field name="VAR">text</field>' +
        '</block>' +
      '</value>' +
    '</block>' +
    '<block type="text_changeCase" x="13" y="437">' +
      '<value name="TEXT">' +
        '<shadow type="text">' +
          '<field name="TEXT">abc</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="text_trim" x="13" y="488">' +
      '<value name="TEXT">' +
        '<shadow type="text">' +
          '<field name="TEXT">abc</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="text_print" x="13" y="538">' +
      '<value name="TEXT">' +
        '<shadow type="text">' +
          '<field name="TEXT">abc</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="text_prompt_ext" x="13" y="588">' +
      '<value name="TEXT">' +
        '<shadow type="text">' +
          '<field name="TEXT">abc</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '</xml>');
FactoryController.prototype.standardCategories['text'].color = '#5CA68D';

FactoryController.prototype.standardCategories['lists'] =
    new ListElement(ListElement.TYPE_CATEGORY, 'Lists');
FactoryController.prototype.standardCategories['lists'].xml =
    Blockly.Xml.textToDom(
    '<xml>' +
    '<block type="lists_create_with" x="13" y="-187">' +
      '<mutation items="0"></mutation>' +
    '</block>' +
    '<block type="lists_create_with"  x="13" y="-137"></block>' +
    '<block type="lists_repeat" x="13" y="-37">' +
      '<value name="NUM">' +
        '<shadow type="math_number">' +
          '<field name="NUM">5</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="lists_length" x="13" y="13" ></block>' +
    '<block type="lists_isEmpty" x="13" y="63"></block>' +
    '<block type="lists_indexOf" x="13" y="113">' +
      '<value name="VALUE">' +
        '<block type="variables_get">' +
          '<field name="VAR">list</field>' +
        '</block>' +
      '</value>' +
    '</block>' +
    '<block type="lists_getIndex" x="13" y="162">' +
      '<value name="VALUE">' +
        '<block type="variables_get">' +
          '<field name="VAR">list</field>' +
        '</block>' +
      '</value>' +
    '</block>' +
    '<block type="lists_setIndex" x="13" y="212">' +
      '<value name="LIST">' +
        '<block type="variables_get">' +
          '<field name="VAR">list</field>' +
        '</block>' +
      '</value>' +
    '</block>' +
    '<block type="lists_getSublist" x="13" y="262">' +
      '<value name="LIST">' +
        '<block type="variables_get">' +
          '<field name="VAR">list</field>' +
        '</block>' +
      '</value>' +
    '</block>' +
    '<block type="lists_split" x="13" y="312">' +
      '<value name="DELIM">' +
        '<shadow type="text">' +
          '<field name="TEXT">,</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="lists_sort" x="13" y="362"></block>' +
    '</xml>');
FactoryController.prototype.standardCategories['lists'].color = '#745CA6';

FactoryController.prototype.standardCategories['colour'] =
    new ListElement(ListElement.TYPE_CATEGORY, 'Colour');
FactoryController.prototype.standardCategories['colour'].xml =
    Blockly.Xml.textToDom(
    '<xml>' +
    '<block type="colour_picker" x="13" y="13"></block>' +
    '<block type="colour_random" x="13" y="63"></block>' +
    '<block type="colour_rgb" x="13" y="113">' +
      '<value name="RED">' +
        '<shadow type="math_number">' +
          '<field name="NUM">100</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="GREEN">' +
        '<shadow type="math_number">' +
          '<field name="NUM">50</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="BLUE">' +
        '<shadow type="math_number">' +
          '<field name="NUM">0</field>' +
        '</shadow>' +
      '</value>' +
    '</block>' +
    '<block type="colour_blend" x="13" y="213">' +
      '<value name="COLOUR1">' +
        '<shadow type="colour_picker">' +
          '<field name="COLOUR">#ff0000</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="COLOUR2">' +
        '<shadow type="colour_picker">' +
          '<field name="COLOUR">#3333ff</field>' +
        '</shadow>' +
      '</value>' +
      '<value name="RATIO">' +
        '<shadow type="math_number">' +
          '<field name="NUM">0.5</field>' +
       '</shadow>' +
      '</value>' +
    '</block>' +
    '</xml>');
FactoryController.prototype.standardCategories['colour'].color = '#A6745C';

FactoryController.prototype.standardCategories['functions'] =
    new ListElement(ListElement.TYPE_CATEGORY, 'Functions');
FactoryController.prototype.standardCategories['functions'].color = '#9A5CA6'
FactoryController.prototype.standardCategories['functions'].custom =
    'PROCEDURE';

FactoryController.prototype.standardCategories['variables'] =
    new ListElement(ListElement.TYPE_CATEGORY, 'Variables');
FactoryController.prototype.standardCategories['variables'].color = '#A65C81';
FactoryController.prototype.standardCategories['variables'].custom = 'VARIABLE';
