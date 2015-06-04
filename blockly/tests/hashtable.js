var h={}; //create a hashtable

//LOGIC BLOCKS
h['logic_compare']=['value,A', 'value,B']; //each value has its name separated by a comma
h['logic_operation']=['value,A', 'value,B']; //each name of a block is entered as the key for the table
h['logic_negate']=['value,BOOL'];
h['logic_boolean']=['field,BOOL'];
h['logic_null'] = [];
h['logic_ternary']=['value,IF','value,THEN','value,ELSE'];

//MATH BLOCKS
h['math_number']=['field,NUM'];
h['math_arithmetic']=['field,OP','value,A','value,B'];
h['math_single']=['field,OP','value,NUM'];
h['math_trig']=['field,OP','value,NUM'];
h['math_constant']=['field,CONSTANT'];
h['math_change']=['field,VAR','value,DELTA'];
h['math_round']=['field,OP','value,NUM'];
h['math_on_list']=['field,OP','value,LIST'];
h['math_modulo']=['value,DIVIDEND','value,DIVISOR'];
h['math_constrain']=['value,VALUE','value,LOW','value,HIGH'];
h['math_random_int']=['value,FROM','value,TO'];
h['math_random_float']=[];

//LIST BLOCKS NEEDS TO BE DONE

//LOOP BLOCKS
h['controls_repeat_ext']=['value,TIMES','statement,DO'];
h['controls_whileUntil']=['field,MODE','value,BOOL','statement,DO'];
h['controls_for']=['field,VAR','value,FROM','value,TO','value,BY','statement,DO']
h['controls_forEach']=['field,VAR','value,LIST','statement,DO'];
h['controls_flow_statements']=['field,FLOW'];

//COLOR BLOCKS
h['colour_picker']=['field,COLOUR'];
h['colour_random']=[];
h['colour_rgb']=['value,RED','value,GREEN','value,BLUE'];
h['colour_blend']=['value,COLOUR1','value,COLOUR2','value,RATIO'];


