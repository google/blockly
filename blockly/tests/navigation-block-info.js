var blockInfo={}; //create a hashtable

//LOGIC BLOCKS
blockInfo['logic_compare']=['value,A', 'value,B']; //each value has its name separated by a comma
blockInfo['logic_operation']=['value,A', 'value,B']; //each name of a block is entered as the key for the table
blockInfo['logic_negate']=['value,BOOL'];
blockInfo['logic_boolean']=['field,BOOL'];
blockInfo['logic_null'] = [];
blockInfo['logic_ternary']=['value,IF','value,THEN','value,ELSE'];

//MATH BLOCKS
blockInfo['math_number']=['field,NUM'];
blockInfo['math_arithmetic']=['field,OP','value,A','value,B'];
blockInfo['math_single']=['field,OP','value,NUM'];
blockInfo['math_trig']=['field,OP','value,NUM'];
blockInfo['math_constant']=['field,CONSTANT'];
blockInfo['math_change']=['field,VAR','value,DELTA'];
blockInfo['math_round']=['field,OP','value,NUM'];
blockInfo['math_on_list']=['field,OP','value,LIST'];
blockInfo['math_modulo']=['value,DIVIDEND','value,DIVISOR'];
blockInfo['math_constrain']=['value,VALUE','value,LOW','value,HIGH'];
blockInfo['math_random_int']=['value,FROM','value,TO'];
blockInfo['math_random_float']=[];

//LIST BLOCKS NEEDS TO BE DONE

//LOOP BLOCKS
blockInfo['controls_repeat_ext']=['value,TIMES','statement,DO'];
blockInfo['controls_whileUntil']=['field,MODE','value,BOOL','statement,DO'];
blockInfo['controls_for']=['field,VAR','value,FROM','value,TO','value,BY','statement,DO']
blockInfo['controls_forEach']=['field,VAR','value,LIST','statement,DO'];
blockInfo['controls_flow_statements']=['field,FLOW'];

//COLOR BLOCKS
blockInfo['colour_picker']=['field,COLOUR'];
blockInfo['colour_random']=[];
blockInfo['colour_rgb']=['value,RED','value,GREEN','value,BLUE'];
blockInfo['colour_blend']=['value,COLOUR1','value,COLOUR2','value,RATIO'];


