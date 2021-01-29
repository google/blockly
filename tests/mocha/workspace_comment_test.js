/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

goog.require('Blockly.WorkspaceComment');

suite('Workspace comment', function() {
  setup(function() {
    sharedTestSetup.call(this);
    this.workspace = new Blockly.Workspace();
  });

  teardown(function() {
    sharedTestTeardown.call(this);
  });

  suite('getTopComments(ordered=true)', function() {
    test('No comments', function() {
      chai.assert.equal(this.workspace.getTopComments(true).length, 0);
    });

    test('One comment', function() {
      var comment = new Blockly.WorkspaceComment(
          this.workspace, 'comment text', 0, 0, 'comment id');
      chai.assert.equal(this.workspace.getTopComments(true).length, 1);
      chai.assert.equal(this.workspace.commentDB_['comment id'], comment);
    });

    test('After clear empty workspace', function() {
      this.workspace.clear();
      chai.assert.equal(this.workspace.getTopComments(true).length, 0);
    });

    test('After clear non-empty workspace', function() {
      new Blockly.WorkspaceComment(
          this.workspace, 'comment text', 0, 0, 'comment id');
      this.workspace.clear();
      chai.assert.equal(this.workspace.getTopComments(true).length, 0);
      chai.assert.isFalse('comment id' in this.workspace.commentDB_);
    });

    test('After dispose', function() {
      var comment = new Blockly.WorkspaceComment(
          this.workspace, 'comment text', 0, 0, 'comment id');
      comment.dispose();
      chai.assert.equal(this.workspace.getTopComments(true).length, 0);
      chai.assert.isFalse('comment id' in this.workspace.commentDB_);
    });
  });

  suite('getTopComments(ordered=false)', function() {
    test('No comments', function() {
      chai.assert.equal(this.workspace.getTopComments(false).length, 0);
    });

    test('One comment', function() {
      var comment = new Blockly.WorkspaceComment(
          this.workspace, 'comment text', 0, 0, 'comment id');
      chai.assert.equal(this.workspace.getTopComments(false).length, 1);
      chai.assert.equal(this.workspace.commentDB_['comment id'], comment);
    });

    test('After clear empty workspace', function() {
      this.workspace.clear();
      chai.assert.equal(this.workspace.getTopComments(false).length, 0);
    });

    test('After clear non-empty workspace', function() {
      new Blockly.WorkspaceComment(
          this.workspace, 'comment text', 0, 0, 'comment id');
      this.workspace.clear();
      chai.assert.equal(this.workspace.getTopComments(false).length, 0);
      chai.assert.isFalse('comment id' in this.workspace.commentDB_);
    });

    test('After dispose', function() {
      var comment = new Blockly.WorkspaceComment(
          this.workspace, 'comment text', 0, 0, 'comment id');
      comment.dispose();
      chai.assert.equal(this.workspace.getTopComments(false).length, 0);
      chai.assert.isFalse('comment id' in this.workspace.commentDB_);
    });
  });

  suite('getCommentById', function() {
    test('Trivial', function() {
      var comment = new Blockly.WorkspaceComment(
          this.workspace, 'comment text', 0, 0, 'comment id');
      chai.assert.equal(this.workspace.getCommentById(comment.id), comment);
    });

    test('Null id', function() {
      chai.assert.isNull(this.workspace.getCommentById(null));
    });

    test('Non-existent id', function() {
      chai.assert.isNull(this.workspace.getCommentById('badId'));
    });

    test('After dispose', function() {
      var comment = new Blockly.WorkspaceComment(
          this.workspace, 'comment text', 0, 0, 'comment id');
      comment.dispose();
      chai.assert.isNull(this.workspace.getCommentById(comment.id));
    });
  });

  suite('dispose', function() {
    test('Called twice', function() {
      var comment = new Blockly.WorkspaceComment(
          this.workspace, 'comment text', 0, 0, 'comment id');
      comment.dispose();
      // Nothing should go wrong the second time dispose is called.
      comment.dispose();
    });
  });

  suite('Width and height', function() {
    setup(function() {
      this.comment = new Blockly.WorkspaceComment(
          this.workspace, 'comment text', 10, 20, 'comment id');
    });

    test('Initial values', function() {
      chai.assert.equal(this.comment.getWidth(), 20, 'Width');
      chai.assert.equal(this.comment.getHeight(), 10, 'Height');
    });

    test('setWidth does not affect height', function() {
      this.comment.setWidth(30);
      chai.assert.equal(this.comment.getWidth(), 30, 'Width');
      chai.assert.equal(this.comment.getHeight(), 10, 'Height');
    });

    test('setHeight does not affect width', function() {
      this.comment.setHeight(30);
      chai.assert.equal(this.comment.getWidth(), 20, 'Width');
      chai.assert.equal(this.comment.getHeight(), 30, 'Height');
    });
  });

  suite('XY position', function() {
    setup(function() {
      this.comment = new Blockly.WorkspaceComment(
          this.workspace, 'comment text', 10, 20, 'comment id');
    });

    test('Initial position', function() {
      var xy = this.comment.getXY();
      chai.assert.equal(xy.x, 0, 'Initial X position');
      chai.assert.equal(xy.y, 0,'Initial Y position');
    });

    test('moveBy', function() {
      this.comment.moveBy(10, 100);
      var xy = this.comment.getXY();
      chai.assert.equal(xy.x, 10, 'New X position');
      chai.assert.equal(xy.y, 100, 'New Y position');
    });

  });

  suite('Content', function() {
    setup(function() {

      this.comment = new Blockly.WorkspaceComment(
          this.workspace, 'comment text', 0, 0, 'comment id');
    });

    teardown(function() {
      sinon.restore();
    });

    test('After creation', function() {
      chai.assert.equal(
          this.comment.getContent(), 'comment text');
      chai.assert.equal(
          this.workspace.undoStack_.length, 1,'Workspace undo stack');
    });

    test('Set to same value', function() {
      this.comment.setContent('comment text');
      chai.assert.equal(this.comment.getContent(), 'comment text');
      // Setting the text to the old value does not fire an event.
      chai.assert.equal(
          this.workspace.undoStack_.length, 1, 'Workspace undo stack');
    });

    test('Set to different value', function() {
      this.comment.setContent('new comment text');
      chai.assert.equal(this.comment.getContent(), 'new comment text');
      chai.assert.equal(
          this.workspace.undoStack_.length, 2, 'Workspace undo stack');
    });
  });
});
