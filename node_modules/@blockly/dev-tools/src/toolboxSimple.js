export default {
  kind: 'flyoutToolbox',
  contents: [
    {
      type: 'controls_ifelse',
      kind: 'block',
    },
    {
      type: 'logic_compare',
      kind: 'block',
      fields: {
        OP: 'EQ',
      },
    },
    {
      type: 'logic_operation',
      kind: 'block',
      fields: {
        OP: 'AND',
      },
    },
    {
      type: 'controls_repeat_ext',
      kind: 'block',
      inputs: {
        TIMES: {
          shadow: {
            type: 'math_number',
            fields: {
              NUM: 10,
            },
          },
        },
      },
    },
    {
      type: 'logic_operation',
      kind: 'block',
      fields: {
        OP: 'AND',
      },
    },
    {
      type: 'logic_negate',
      kind: 'block',
    },
    {
      type: 'logic_boolean',
      kind: 'block',
      fields: {
        BOOL: 'TRUE',
      },
    },
    {
      type: 'logic_null',
      kind: 'block',
      enabled: false,
    },
    {
      type: 'logic_ternary',
      kind: 'block',
    },
    {
      type: 'text_charAt',
      kind: 'block',
      fields: {
        WHERE: 'FROM_START',
      },
      inputs: {
        VALUE: {
          block: {
            type: 'variables_get',
            fields: {
              VAR: {
                name: 'text',
              },
            },
          },
        },
      },
    },
  ],
};
