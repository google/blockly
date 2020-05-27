/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Extensions', function() {
  setup(function() {
    this.workspace = new Blockly.Workspace();
    this.blockTypesCleanup_ = [];
    this.extensionsCleanup_ = [];
  });
  teardown(function() {
    var i;
    for (i = 0; i < this.blockTypesCleanup_.length; i++) {
      var blockType = this.blockTypesCleanup_[i];
      delete Blockly.Blocks[blockType];
    }
    for (i = 0; i < this.extensionsCleanup_.length; i++) {
      var extension = this.extensionsCleanup_[i];
      delete Blockly.Extensions.ALL_[extension];
    }
    this.workspace.dispose();
    // Clear Blockly.Event state.
    Blockly.Events.setGroup(false);
    Blockly.Events.disabled_ = 0;
    sinon.restore();
  });

  test('Definition before and after block type', function() {
    this.extensionsCleanup_.push('extensions_test_before');
    this.extensionsCleanup_.push('extensions_test_after');
    this.blockTypesCleanup_.push('extension_test_block');

    chai.assert.isUndefined(Blockly.Extensions.ALL_['extensions_test_before']);
    var beforeCallback = sinon.spy();
    // Extension defined before the block type is defined.
    Blockly.Extensions.register('extensions_test_before', beforeCallback);

    Blockly.defineBlocksWithJsonArray([{
      "type": "extension_test_block",
      "message0": "extension_test_block",
      "extensions": ["extensions_test_before", "extensions_test_after"]
    }]);

    chai.assert.isUndefined(Blockly.Extensions.ALL_['extensions_test_after']);
    var afterCallback = sinon.spy();
    // Extension defined after the block type (but before instantiation).
    Blockly.Extensions.register('extensions_test_after', afterCallback);

    chai.assert.typeOf(Blockly.Extensions.ALL_['extensions_test_before'], 'function');
    chai.assert.typeOf(Blockly.Extensions.ALL_['extensions_test_after'], 'function');
    sinon.assert.notCalled(beforeCallback);
    sinon.assert.notCalled(afterCallback);

    var block = new Blockly.Block(this.workspace, 'extension_test_block');

    sinon.assert.calledOnce(beforeCallback);
    sinon.assert.calledOnce(afterCallback);
    sinon.assert.calledOn(beforeCallback, block);
    sinon.assert.calledOn(afterCallback, block);
  });

  test('Parent tooltip when inline', function() {
    this.blockTypesCleanup_.push('test_parent_tooltip_when_inline');
    this.blockTypesCleanup_.push('test_parent');

    var defaultTooltip = "defaultTooltip";
    var parentTooltip = "parentTooltip";
    Blockly.defineBlocksWithJsonArray([
      {
        "type": "test_parent_tooltip_when_inline",
        "message0": "test_parent_tooltip_when_inline",
        "output": true,
        "tooltip": defaultTooltip,
        "extensions": ["parent_tooltip_when_inline"]
      },
      {
        "type": "test_parent",
        "message0": "%1",
        "args0": [
          {
            "type": "input_value",
            "name": "INPUT"
          }
        ],
        "tooltip": parentTooltip
      }
    ]);

    var block =
        new Blockly.Block(this.workspace, 'test_parent_tooltip_when_inline');

    // Tooltip is dynamic after extension initialization.
    chai.assert.typeOf(block.tooltip, 'function');
    chai.assert.equal(block.tooltip(), defaultTooltip);

    // Tooltip is normal before connected to parent.
    var parent = new Blockly.Block(this.workspace, 'test_parent');
    chai.assert.equal(parent.tooltip, parentTooltip);
    chai.assert.isFalse(!!parent.inputsInline);

    // Tooltip is normal when parent is not inline.
    parent.getInput('INPUT').connection.connect(block.outputConnection);
    chai.assert.equal(block.getParent(), parent);
    chai.assert.equal(block.tooltip(), defaultTooltip);

    // Tooltip is parent's when parent is inline.
    parent.setInputsInline(true);
    chai.assert.equal(block.tooltip(), parentTooltip);

    // Tooltip revert when disconnected.
    parent.getInput('INPUT').connection.disconnect();
    chai.assert.notExists(block.getParent());
    chai.assert.equal(block.tooltip(), defaultTooltip);
  });

  suite('Mixin', function() {
    test('Basic', function() {
      this.extensionsCleanup_.push('mixin_test');
      this.blockTypesCleanup_.push('test_block_mixin');

      var testMixin = {
        field: 'FIELD',
        method: function() {
          console.log('TEXT_MIXIN method()');
        }
      };

      chai.assert.isUndefined(Blockly.Extensions.ALL_['mixin_test']);
      // Extension defined before the block type is defined.
      Blockly.Extensions.registerMixin('mixin_test', testMixin);

      chai.assert.typeOf(Blockly.Extensions.ALL_['mixin_test'], 'function');

      Blockly.defineBlocksWithJsonArray([{
        "type": "test_block_mixin",
        "message0": "test_block_mixin",
        "extensions": ["mixin_test"]
      }]);

      var block = new Blockly.Block(this.workspace, 'test_block_mixin');

      chai.assert.equal(testMixin.field, block.field);
      chai.assert.equal(testMixin.method, block.method);
    });

    suite('Mutator', function() {
      test('Basic', function() {
        this.extensionsCleanup_.push('mutator_test');
        this.blockTypesCleanup_.push('mutator_test_block');

        Blockly.defineBlocksWithJsonArray([{
          "type": "mutator_test_block",
          "message0": "mutator_test_block",
          "mutator": "mutator_test"
        }]);

        // Events code calls mutationToDom and expects it to give back a meaningful
        // value.
        Blockly.Events.disable();
        Blockly.Extensions.registerMutator('mutator_test',
            {
              domToMutation: function() {
                return 'domToMutationFn';
              },
              mutationToDom: function() {
                return 'mutationToDomFn';
              },
              compose: function() {
                return 'composeFn';
              },
              decompose: function() {
                return 'decomposeFn';
              }
            });

        var block = new Blockly.Block(this.workspace, 'mutator_test_block');

        // Make sure all of the functions were installed correctly.
        chai.assert.equal(block.domToMutation(), 'domToMutationFn');
        chai.assert.equal(block.mutationToDom(), 'mutationToDomFn');
        chai.assert.equal(block.compose(), 'composeFn');
        chai.assert.equal(block.decompose(), 'decomposeFn');
      });

      test('With helper function', function() {
        this.extensionsCleanup_.push('extensions_test');
        this.blockTypesCleanup_.push('mutator_test_block');

        Blockly.defineBlocksWithJsonArray([{
          "type": "mutator_test_block",
          "message0": "mutator_test_block",
          "mutator": ["extensions_test"]
        }]);

        // Events code calls mutationToDom and expects it to give back a
        // meaningful value.
        Blockly.Events.disable();
        chai.assert.isUndefined(Blockly.Extensions.ALL_['extensions_test']);
        var helperFunctionSpy = sinon.spy();
        Blockly.Extensions.registerMutator('extensions_test',
            {
              domToMutation: function() {
                return 'domToMutationFn';
              },
              mutationToDom: function() {
                return 'mutationToDomFn';
              }
            },
            helperFunctionSpy
        );

        var _ = new Blockly.Block(this.workspace, 'mutator_test_block');

        sinon.assert.calledOnce(helperFunctionSpy);
      });

      test('No dialog', function() {
        this.extensionsCleanup_.push('mutator_test');
        this.blockTypesCleanup_.push('mutator_test_block');

        Blockly.defineBlocksWithJsonArray([{
          "type": "mutator_test_block",
          "message0": "mutator_test_block",
          "mutator": "mutator_test"
        }]);

        // Events code calls mutationToDom and expects it to give back a
        // meaningful value.
        Blockly.Events.disable();
        chai.assert.isUndefined(Blockly.Extensions.ALL_['mutator_test']);
        Blockly.Extensions.registerMutator('mutator_test',
            {
              domToMutation: function() {
                return 'domToMutationFn';
              },
              mutationToDom: function() {
                return 'mutationToDomFn';
              }
            });

        var block = new Blockly.Block(this.workspace, 'mutator_test_block');

        // Make sure all of the functions were installed correctly.
        chai.assert.equal(block.domToMutation(), 'domToMutationFn');
        chai.assert.equal(block.mutationToDom(), 'mutationToDomFn');
        chai.assert.isFalse(block.hasOwnProperty('compose'));
        chai.assert.isFalse(block.hasOwnProperty('decompose'));
      });
    });
  });

  suite('Error cases', function() {
    test('Missing extension', function() {
      this.blockTypesCleanup_.push('missing_extension_block');

      Blockly.defineBlocksWithJsonArray([{
        "type": "missing_extension_block",
        "message0": "missing_extension_block",
        "extensions": ["missing_extension"]
      }]);

      chai.assert.isUndefined(Blockly.Extensions.ALL_['missing_extension']);
      var workspace = this.workspace;
      chai.assert.throws(function() {
        var _ = new Blockly.Block(workspace, 'missing_extension_block');
      });
    });

    test('Mixin overwrites local value', function() {
      this.extensionsCleanup_.push('mixin_bad_inputList');
      this.blockTypesCleanup_.push('test_block_bad_inputList');

      var TEST_MIXIN_BAD_INPUTLIST = {
        inputList: 'bad inputList'  // Defined in constructor
      };

      chai.assert.isUndefined(Blockly.Extensions.ALL_['mixin_bad_inputList']);
      // Extension defined before the block type is defined.
      Blockly.Extensions.registerMixin('mixin_bad_inputList', TEST_MIXIN_BAD_INPUTLIST);
      chai.assert.typeOf(Blockly.Extensions.ALL_['mixin_bad_inputList'], 'function');

      Blockly.defineBlocksWithJsonArray([{
        "type": "test_block_bad_inputList",
        "message0": "test_block_bad_inputList",
        "extensions": ["mixin_bad_inputList"]
      }]);

      var workspace = this.workspace;
      chai.assert.throws(function() {
        var _ = new Blockly.Block(workspace, 'test_block_bad_inputList');
      }, /inputList/);
    });

    test('Mixin overwrites prototype', function() {
      this.extensionsCleanup_.push('mixin_bad_colour_');
      this.blockTypesCleanup_.push('test_block_bad_colour');

      var TEST_MIXIN_BAD_COLOUR = {
        colour_: 'bad colour_' // Defined on prototype
      };

      chai.assert.isUndefined(Blockly.Extensions.ALL_['mixin_bad_colour_']);
      // Extension defined before the block type is defined.
      Blockly.Extensions.registerMixin('mixin_bad_colour_', TEST_MIXIN_BAD_COLOUR);
      chai.assert.typeOf(Blockly.Extensions.ALL_['mixin_bad_colour_'], 'function');

      Blockly.defineBlocksWithJsonArray([{
        "type": "test_block_bad_colour",
        "message0": "test_block_bad_colour",
        "extensions": ["mixin_bad_colour_"]
      }]);

      var workspace = this.workspace;
      chai.assert.throws(function() {
        var _ = new Blockly.Block(workspace, 'test_block_bad_colour');
      }, /colour_/);
    });

    test('Use mutator as extension', function() {
      this.extensionsCleanup_.push('mutator_test');
      this.blockTypesCleanup_.push('mutator_test_block');

      Blockly.defineBlocksWithJsonArray([{
        "type": "mutator_test_block",
        "message0": "mutator_test_block",
        "extensions": ["mutator_test"]
      }]);

      // Events code calls mutationToDom and expects it to give back a
      // meaningful value.
      Blockly.Events.disable();
      chai.assert.isUndefined(Blockly.Extensions.ALL_['mutator_test']);
      Blockly.Extensions.registerMutator('mutator_test',
          {
            domToMutation: function() {
              return 'domToMutationFn';
            },
            mutationToDom: function() {
              return 'mutationToDomFn';
            }
          });

      var workspace = this.workspace;
      chai.assert.throws(function() {
        var _ = new Blockly.Block(workspace, 'mutator_test_block');
      });
      // Should have failed on apply, not on register.
      chai.assert.isNotNull(Blockly.Extensions.ALL_['mutator_test']);
    });

    test('Use mutator mixin as extension', function() {
      this.extensionsCleanup_.push('mutator_test');
      this.blockTypesCleanup_.push('mutator_test_block');

      Blockly.defineBlocksWithJsonArray([{
        "type": "mutator_test_block",
        "message0": "mutator_test_block",
        "extensions": ["mutator_test"]
      }]);

      // Events code calls mutationToDom and expects it to give back a
      // meaningful value.
      Blockly.Events.disable();
      chai.assert.isUndefined(Blockly.Extensions.ALL_['mutator_test']);
      Blockly.Extensions.registerMixin('mutator_test',
          {
            domToMutation: function() {
              return 'domToMutationFn';
            },
            mutationToDom: function() {
              return 'mutationToDomFn';
            }
          });

      var workspace = this.workspace;
      chai.assert.throws(function() {
        var _ = new Blockly.Block(workspace, 'mutator_test_block');
      });
      // Should have failed on apply, not on register.
      chai.assert.isNotNull(Blockly.Extensions.ALL_['mutator_test']);
    });

    test('Use extension as mutator', function() {
      this.extensionsCleanup_.push('extensions_test');
      this.blockTypesCleanup_.push('mutator_test_block');

      Blockly.defineBlocksWithJsonArray([{
        "type": "mutator_test_block",
        "message0": "mutator_test_block",
        "mutator": ["extensions_test"]
      }]);

      // Events code calls mutationToDom and expects it to give back a
      // meaningful value.
      Blockly.Events.disable();
      chai.assert.isUndefined(Blockly.Extensions.ALL_['extensions_test']);
      Blockly.Extensions.register('extensions_test', function() {
        return 'extensions_test_fn';
      });

      var workspace = this.workspace;
      chai.assert.throws(function() {
        var _ = new Blockly.Block(workspace, 'mutator_test_block');
      });
      // Should have failed on apply, not on register.
      chai.assert.isNotNull(Blockly.Extensions.ALL_['extensions_test']);
    });

    suite('register', function() {
      test('Just a string', function() {
        this.extensionsCleanup_.push('extension_just_a_string');
        chai.assert.isUndefined(Blockly.Extensions.ALL_['extension_just_a_string']);
        chai.assert.throws(function() {
          Blockly.Extensions.register('extension_just_a_string', null);
        });
      });

      test('Null', function() {
        this.extensionsCleanup_.push('extension_is_null');
        chai.assert.isUndefined(Blockly.Extensions.ALL_['extension_is_null']);
        chai.assert.throws(function() {
          Blockly.Extensions.register('extension_is_null', null);
        });
      });

      test('Undefined', function() {
        this.extensionsCleanup_.push('extension_is_undefined');
        chai.assert.isUndefined(Blockly.Extensions.ALL_['extension_is_undefined']);
        chai.assert.throws(function() {
          Blockly.Extensions.register('extension_is_undefined', null);
        });
      });
    });

    suite('registerMutator', function() {
      test('No domToMutation', function() {
        this.extensionsCleanup_.push('mutator_test');
        chai.assert.throws(function() {
          Blockly.Extensions.registerMutator('mutator_test',
              {
                mutationToDom: function() {
                  return 'mutationToDomFn';
                },
                compose: function() {
                  return 'composeFn';
                },
                decompose: function() {
                  return 'decomposeFn';
                }
              });
        }, /domToMutation/);
      });

      test('No mutationToDom', function() {
        this.extensionsCleanup_.push('mutator_test');
        chai.assert.throws(function() {
          Blockly.Extensions.registerMutator('mutator_test',
              {
                domToMutation: function() {
                  return 'domToMutationFn';
                },
                compose: function() {
                  return 'composeFn';
                },
                decompose: function() {
                  return 'decomposeFn';
                }
              });
        }, /mutationToDom/);
      });

      test('Has decompose but no compose', function() {
        this.extensionsCleanup_.push('mutator_test');
        chai.assert.throws(function() {
          Blockly.Extensions.registerMutator('mutator_test',
              {
                domToMutation: function() {
                  return 'domToMutationFn';
                },
                mutationToDom: function() {
                  return 'mutationToDomFn';
                },
                decompose: function() {
                  return 'decomposeFn';
                }
              });
        }, /compose/);
      });

      test('Has compose but no decompose', function() {
        this.extensionsCleanup_.push('mutator_test');
        chai.assert.throws(function() {
          Blockly.Extensions.registerMutator('mutator_test',
              {
                domToMutation: function() {
                  return 'domToMutationFn';
                },
                mutationToDom: function() {
                  return 'mutationToDomFn';
                },
                compose: function() {
                  return 'composeFn';
                }
              });
        }, /decompose/);
      });
    });
  });
});
