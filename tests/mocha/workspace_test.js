/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

suite('Workspace', function() {
  setup(function() {
    this.workspace = new Blockly.Workspace();
    Blockly.defineBlocksWithJsonArray([{
      "type": "get_var_block",
      "message0": "%1",
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variableTypes": ["", "type1", "type2"]
        }
      ]
    }]);
  });

  teardown(function() {
    delete Blockly.Blocks['get_var_block'];
    this.workspace.dispose();
  });

  suite('getTopBlocks(ordered=true)', function() {
    test('Empty workspace', function() {
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 0);
    });

    test('Flat workspace one block', function() {
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 1);
    });

    test('Flat workspace one block after dispose', function() {
      var blockA = this.workspace.newBlock('');
      this.workspace.newBlock('');
      blockA.dispose();
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 1);
    });

    test('Flat workspace two blocks', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 2);
    });

    test('Clear', function() {
      this.workspace.clear();
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 0,
          'Clear empty workspace');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.clear();
      chai.assert.equal(this.workspace.getTopBlocks(true).length, 0);
    });
  });

  suite('getTopBlocks(ordered=false)', function() {
    test('Empty workspace', function() {
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 0);
    });

    test('Flat workspace one block', function() {
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 1);
    });

    test('Flat workspace one block after dispose', function() {
      var blockA = this.workspace.newBlock('');
      this.workspace.newBlock('');
      blockA.dispose();
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 1);
    });

    test('Flat workspace two blocks', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 2);
    });

    test('Clear empty workspace', function() {
      this.workspace.clear();
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 0);
    });

    test('Clear non-empty workspace', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.clear();
      chai.assert.equal(this.workspace.getTopBlocks(false).length, 0);
    });
  });

  suite('getAllBlocks', function() {
    test('Empty workspace', function() {
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 0);
    });

    test('Flat workspace one block', function() {
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 1);
    });

    test('Flat workspace one block after dispose', function() {
      var blockA = this.workspace.newBlock('');
      this.workspace.newBlock('');
      blockA.dispose();
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 1);
    });

    test('Flat workspace two blocks', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 2);
    });

    test('Clear', function() {
      this.workspace.clear();
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 0,
          'Clear empty workspace');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.clear();
      chai.assert.equal(this.workspace.getAllBlocks(true).length, 0);
    });
  });

  suite('remainingCapacity', function() {
    setup(function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
    });

    test('No block limit', function() {
      chai.assert.equal(this.workspace.remainingCapacity(), Infinity);
    });

    test('Under block limit', function() {
      this.workspace.options.maxBlocks = 3;
      chai.assert.equal(this.workspace.remainingCapacity(), 1);
      this.workspace.options.maxBlocks = 4;
      chai.assert.equal(this.workspace.remainingCapacity(), 2);
    });

    test('At block limit', function() {
      this.workspace.options.maxBlocks = 2;
      chai.assert.equal(this.workspace.remainingCapacity(), 0);
    });

    test('At block limit of 0 after clear', function() {
      this.workspace.options.maxBlocks = 0;
      this.workspace.clear();
      chai.assert.equal(this.workspace.remainingCapacity(), 0);
    });

    test('Over block limit', function() {
      this.workspace.options.maxBlocks = 1;
      chai.assert.equal(this.workspace.remainingCapacity(), -1);
    });

    test('Over block limit of 0', function() {
      this.workspace.options.maxBlocks = 0;
      chai.assert.equal(this.workspace.remainingCapacity(), -2);
    });
  });

  suite('remainingCapacityOfType', function() {
    setup(function() {
      this.workspace.newBlock('get_var_block');
      this.workspace.newBlock('get_var_block');
      this.workspace.options.maxInstances = {};
    });

    test('No instance limit', function() {
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          Infinity);
    });

    test('Under instance limit', function() {
      this.workspace.options.maxInstances['get_var_block'] = 3;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          1, 'With maxInstances limit 3');
      this.workspace.options.maxInstances['get_var_block'] = 4;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          2, 'With maxInstances limit 4');
    });

    test('Under instance limit with multiple block types', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.options.maxInstances['get_var_block'] = 3;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          1, 'With maxInstances limit 3');
      this.workspace.options.maxInstances['get_var_block'] = 4;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          2, 'With maxInstances limit 4');
    });

    test('At instance limit', function() {
      this.workspace.options.maxInstances['get_var_block'] = 2;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          0, 'With maxInstances limit 2');
    });

    test.skip('At instance limit of 0 after clear', function() {
      // TODO(3837): Un-skip test after resolving.
      this.workspace.clear();
      this.workspace.options.maxInstances['get_var_block'] = 0;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          0);
    });

    test('At instance limit with multiple block types', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.options.maxInstances['get_var_block'] = 2;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          0, 'With maxInstances limit 2');
    });

    test.skip('At instance limit of 0 with multiple block types', function() {
      // TODO(3837): Un-skip test after resolving.
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.options.maxInstances['get_var_block'] = 0;
      this.workspace.clear();
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          0);
    });

    test('Over instance limit', function() {
      this.workspace.options.maxInstances['get_var_block'] = 1;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          -1,'With maxInstances limit 1');
    });

    test.skip('Over instance limit of 0', function() {
      // TODO(3837): Un-skip test after resolving.
      this.workspace.options.maxInstances['get_var_block'] = 0;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          -2,'With maxInstances limit 0');
    });

    test('Over instance limit with multiple block types', function() {
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.options.maxInstances['get_var_block'] = 1;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          -1,'With maxInstances limit 1');
    });

    test.skip('Over instance limit of 0 with multiple block types', function() {
      // TODO(3837): Un-skip test after resolving.
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.newBlock('');
      this.workspace.options.maxInstances['get_var_block'] = 0;
      chai.assert.equal(this.workspace.remainingCapacityOfType('get_var_block'),
          -2,'With maxInstances limit 0');
    });

    suite.skip('Max blocks and max instance interaction', function() {
      // TODO(3836): Un-skip test suite after resolving.
      test('Under block limit and no instance limit', function() {
        this.workspace.options.maxBlocks = 3;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'), 1);
      });

      test('At block limit and no instance limit', function() {
        this.workspace.options.maxBlocks = 2;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'), 0);
      });

      test.skip('Over block limit of 0 and no instance limit', function() {
        // TODO(3837|3836): Un-skip test after resolving both.
        this.workspace.options.maxBlocks = 0;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'), -2);
      });

      test('Over block limit but under instance limit', function() {
        this.workspace.options.maxBlocks = 1;
        this.workspace.options.maxInstances['get_var_block'] = 3;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'),
            -2,
            'With maxBlocks limit 1 and maxInstances limit 3');
      });

      test.skip('Over block limit of 0 but under instance limit', function() {
        // TODO(3837|3836): Un-skip test after resolving both.
        this.workspace.options.maxBlocks = 0;
        this.workspace.options.maxInstances['get_var_block'] = 3;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'),
            -2,
            'With maxBlocks limit 0 and maxInstances limit 3');
      });

      test('Over block limit but at instance limit', function() {
        this.workspace.options.maxBlocks = 1;
        this.workspace.options.maxInstances['get_var_block'] = 2;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'),
            -2,
            'With maxBlocks limit 1 and maxInstances limit 2');
      });

      test('Over block limit and over instance limit', function() {
        this.workspace.options.maxBlocks = 1;
        this.workspace.options.maxInstances['get_var_block'] = 1;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'),
            -1,
            'With maxBlocks limit 1 and maxInstances limit 1');
      });

      test.skip('Over block limit of 0 and over instance limit', function() {
        // TODO(3837|3836): Un-skip test after resolving both.
        this.workspace.options.maxBlocks = 0;
        this.workspace.options.maxInstances['get_var_block'] = 1;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'),
            -2,
            'With maxBlocks limit 0 and maxInstances limit 1');
      });

      test('Over block limit and over instance limit of 0', function() {
        this.workspace.options.maxBlocks = 1;
        this.workspace.options.maxInstances['get_var_block'] = 0;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'),
            -1,
            'With maxBlocks limit 1 and maxInstances limit 0');
      });

      test.skip('Over block limit of 0 and over instance limit of 0', function() {
        // TODO(3837|3836): Un-skip test after resolving both.
        this.workspace.options.maxBlocks = 0;
        this.workspace.options.maxInstances['get_var_block'] = 0;
        chai.assert.equal(
            this.workspace.remainingCapacityOfType('get_var_block'),-1);
      });
    });
  });

});
