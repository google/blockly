// Do not edit this file; automatically generated by build.py.
'use strict';

this.IS_NODE_JS = !!(typeof module !== 'undefined' && module.exports);

this.BLOCKLY_DIR = (function(root) {
  if (!root.IS_NODE_JS) {
    // Find name of current directory.
    var scripts = document.getElementsByTagName('script');
    var re = new RegExp('(.+)[\/]blockly_(.*)uncompressed\.js$');
    for (var i = 0, script; script = scripts[i]; i++) {
      var match = re.exec(script.src);
      if (match) {
        return match[1];
      }
    }
    alert('Could not detect Blockly\'s directory name.');
  }
  return '';
})(this);

this.BLOCKLY_BOOT = function(root) {
  var dir = '';
  if (root.IS_NODE_JS) {
    dir = 'blockly';
  } else {
    dir = this.BLOCKLY_DIR.match(/[^\/]+$/)[0];
  }
  // Execute after Closure has loaded.
goog.addDependency("../../../" + dir + "/core/block.js", ['Blockly.Block'], ['Blockly.Blocks', 'Blockly.Comment', 'Blockly.Connection', 'Blockly.Events', 'Blockly.Events.BlockChange', 'Blockly.Events.BlockCreate', 'Blockly.Events.BlockDelete', 'Blockly.Events.BlockMove', 'Blockly.Extensions', 'Blockly.Input', 'Blockly.Mutator', 'Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.fieldRegistry', 'Blockly.utils.string', 'Blockly.Warning', 'Blockly.Workspace']);
goog.addDependency("../../../" + dir + "/core/block_animations.js", ['Blockly.blockAnimations'], ['Blockly.utils.dom']);
goog.addDependency("../../../" + dir + "/core/block_drag_surface.js", ['Blockly.BlockDragSurfaceSvg'], ['Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.utils.dom']);
goog.addDependency("../../../" + dir + "/core/block_dragger.js", ['Blockly.BlockDragger'], ['Blockly.blockAnimations', 'Blockly.Events', 'Blockly.Events.BlockMove', 'Blockly.InsertionMarkerManager', 'Blockly.utils.Coordinate', 'Blockly.utils.dom']);
goog.addDependency("../../../" + dir + "/core/block_events.js", ['Blockly.Events.BlockBase', 'Blockly.Events.BlockChange', 'Blockly.Events.BlockCreate', 'Blockly.Events.BlockDelete', 'Blockly.Events.BlockMove', 'Blockly.Events.Change', 'Blockly.Events.Create', 'Blockly.Events.Delete', 'Blockly.Events.Move'], ['Blockly.Events', 'Blockly.Events.Abstract', 'Blockly.utils.Coordinate', 'Blockly.utils.xml']);
goog.addDependency("../../../" + dir + "/core/block_render_svg.js", ['Blockly.BlockSvg.render'], ['Blockly.blockRendering', 'Blockly.BlockSvg', 'Blockly.utils.dom']);
goog.addDependency("../../../" + dir + "/core/block_svg.js", ['Blockly.BlockSvg'], ['Blockly.Block', 'Blockly.blockAnimations', 'Blockly.ContextMenu', 'Blockly.Events', 'Blockly.Events.Ui', 'Blockly.Events.BlockMove', 'Blockly.Grid', 'Blockly.Msg', 'Blockly.RenderedConnection', 'Blockly.Tooltip', 'Blockly.Touch', 'Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.utils.dom', 'Blockly.utils.Rect']);
goog.addDependency("../../../" + dir + "/core/blockly.js", ['Blockly'], ['Blockly.BlockSvg.render', 'Blockly.Events', 'Blockly.Events.Ui', 'Blockly.FieldAngle', 'Blockly.FieldCheckbox', 'Blockly.FieldColour', 'Blockly.FieldDropdown', 'Blockly.FieldLabelSerializable', 'Blockly.FieldImage', 'Blockly.FieldTextInput', 'Blockly.FieldMultilineInput', 'Blockly.FieldNumber', 'Blockly.FieldVariable', 'Blockly.Generator', 'Blockly.navigation', 'Blockly.Procedures', 'Blockly.Toolbox', 'Blockly.Tooltip', 'Blockly.Touch', 'Blockly.WidgetDiv', 'Blockly.WorkspaceSvg', 'Blockly.constants', 'Blockly.inject', 'Blockly.utils', 'Blockly.Xml']);
goog.addDependency("../../../" + dir + "/core/blocks.js", ['Blockly.Blocks'], []);
goog.addDependency("../../../" + dir + "/core/bubble.js", ['Blockly.Bubble'], ['Blockly.Touch', 'Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.utils.dom', 'Blockly.utils.math', 'Blockly.utils.userAgent', 'Blockly.Workspace']);
goog.addDependency("../../../" + dir + "/core/bubble_dragger.js", ['Blockly.BubbleDragger'], ['Blockly.Bubble', 'Blockly.Events', 'Blockly.Events.CommentMove', 'Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.WorkspaceCommentSvg']);
goog.addDependency("../../../" + dir + "/core/comment.js", ['Blockly.Comment'], ['Blockly.Bubble', 'Blockly.Events', 'Blockly.Events.BlockChange', 'Blockly.Events.Ui', 'Blockly.Icon', 'Blockly.utils.dom', 'Blockly.utils.userAgent']);
goog.addDependency("../../../" + dir + "/core/components/component.js", ['Blockly.Component', 'Blockly.Component.Error'], ['Blockly.utils.dom', 'Blockly.utils.IdGenerator', 'Blockly.utils.style']);
goog.addDependency("../../../" + dir + "/core/components/menu/menu.js", ['Blockly.Menu'], ['Blockly.Component', 'Blockly.utils.dom', 'Blockly.utils.aria']);
goog.addDependency("../../../" + dir + "/core/components/menu/menuitem.js", ['Blockly.MenuItem'], ['Blockly.Component', 'Blockly.utils.dom', 'Blockly.utils.aria']);
goog.addDependency("../../../" + dir + "/core/components/tree/basenode.js", ['Blockly.tree.BaseNode'], ['Blockly.Component', 'Blockly.utils.aria', 'Blockly.utils.KeyCodes', 'Blockly.utils.style']);
goog.addDependency("../../../" + dir + "/core/components/tree/treecontrol.js", ['Blockly.tree.TreeControl'], ['Blockly.tree.TreeNode', 'Blockly.tree.BaseNode', 'Blockly.utils.aria', 'Blockly.utils.style']);
goog.addDependency("../../../" + dir + "/core/components/tree/treenode.js", ['Blockly.tree.TreeNode'], ['Blockly.tree.BaseNode', 'Blockly.utils.KeyCodes']);
goog.addDependency("../../../" + dir + "/core/connection.js", ['Blockly.Connection'], ['Blockly.Events', 'Blockly.Events.BlockMove', 'Blockly.Xml']);
goog.addDependency("../../../" + dir + "/core/connection_db.js", ['Blockly.ConnectionDB'], ['Blockly.Connection']);
goog.addDependency("../../../" + dir + "/core/constants.js", ['Blockly.constants'], []);
goog.addDependency("../../../" + dir + "/core/contextmenu.js", ['Blockly.ContextMenu'], ['Blockly.Events', 'Blockly.Events.BlockCreate', 'Blockly.Menu', 'Blockly.MenuItem', 'Blockly.Msg', 'Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.utils.dom', 'Blockly.utils.uiMenu', 'Blockly.utils.userAgent', 'Blockly.Xml']);
goog.addDependency("../../../" + dir + "/core/css.js", ['Blockly.Css'], []);
goog.addDependency("../../../" + dir + "/core/dragged_connection_manager.js", ['Blockly.DraggedConnectionManager'], ['Blockly.blockAnimations', 'Blockly.RenderedConnection']);
goog.addDependency("../../../" + dir + "/core/dropdowndiv.js", ['Blockly.DropDownDiv'], ['Blockly.utils.math', 'Blockly.utils.style']);
goog.addDependency("../../../" + dir + "/core/events.js", ['Blockly.Events'], ['Blockly.utils']);
goog.addDependency("../../../" + dir + "/core/events_abstract.js", ['Blockly.Events.Abstract'], ['Blockly.Events']);
goog.addDependency("../../../" + dir + "/core/extensions.js", ['Blockly.Extensions'], ['Blockly.Mutator', 'Blockly.utils']);
goog.addDependency("../../../" + dir + "/core/field.js", ['Blockly.Field'], ['Blockly.Events', 'Blockly.Events.BlockChange', 'Blockly.Gesture', 'Blockly.utils', 'Blockly.utils.dom', 'Blockly.utils.Size', 'Blockly.utils.userAgent', 'Blockly.utils.style']);
goog.addDependency("../../../" + dir + "/core/field_angle.js", ['Blockly.FieldAngle'], ['Blockly.DropDownDiv', 'Blockly.fieldRegistry', 'Blockly.FieldTextInput', 'Blockly.utils.dom', 'Blockly.utils.math', 'Blockly.utils.userAgent']);
goog.addDependency("../../../" + dir + "/core/field_checkbox.js", ['Blockly.FieldCheckbox'], ['Blockly.Events', 'Blockly.Events.BlockChange', 'Blockly.Field', 'Blockly.fieldRegistry', 'Blockly.utils.dom', 'Blockly.utils.Size']);
goog.addDependency("../../../" + dir + "/core/field_colour.js", ['Blockly.FieldColour'], ['Blockly.DropDownDiv', 'Blockly.Events', 'Blockly.Events.BlockChange', 'Blockly.Field', 'Blockly.fieldRegistry', 'Blockly.utils.aria', 'Blockly.utils.dom', 'Blockly.utils.IdGenerator', 'Blockly.utils.colour', 'Blockly.utils.Size']);
goog.addDependency("../../../" + dir + "/core/field_date.js", ['Blockly.FieldDate'], ['Blockly.Events', 'Blockly.Field', 'Blockly.fieldRegistry', 'Blockly.utils.dom', 'Blockly.utils.string', 'goog.date', 'goog.date.DateTime', 'goog.events', 'goog.i18n.DateTimeSymbols', 'goog.i18n.DateTimeSymbols_he', 'goog.ui.DatePicker']);
goog.addDependency("../../../" + dir + "/core/field_dropdown.js", ['Blockly.FieldDropdown'], ['Blockly.Events', 'Blockly.Events.BlockChange', 'Blockly.Field', 'Blockly.fieldRegistry', 'Blockly.Menu', 'Blockly.MenuItem', 'Blockly.utils', 'Blockly.utils.dom', 'Blockly.utils.Size', 'Blockly.utils.string', 'Blockly.utils.uiMenu', 'Blockly.utils.userAgent']);
goog.addDependency("../../../" + dir + "/core/field_image.js", ['Blockly.FieldImage'], ['Blockly.Field', 'Blockly.fieldRegistry', 'Blockly.utils', 'Blockly.utils.dom', 'Blockly.utils.Size']);
goog.addDependency("../../../" + dir + "/core/field_label.js", ['Blockly.FieldLabel'], ['Blockly.Field', 'Blockly.fieldRegistry', 'Blockly.utils', 'Blockly.utils.dom', 'Blockly.utils.Size']);
goog.addDependency("../../../" + dir + "/core/field_label_serializable.js", ['Blockly.FieldLabelSerializable'], ['Blockly.FieldLabel', 'Blockly.fieldRegistry', 'Blockly.utils']);
goog.addDependency("../../../" + dir + "/core/field_multilineinput.js", ['Blockly.FieldMultilineInput'], ['Blockly.DropDownDiv', 'Blockly.Field', 'Blockly.Msg', 'Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.utils.dom', 'Blockly.utils.userAgent']);
goog.addDependency("../../../" + dir + "/core/field_number.js", ['Blockly.FieldNumber'], ['Blockly.fieldRegistry', 'Blockly.FieldTextInput']);
goog.addDependency("../../../" + dir + "/core/field_registry.js", ['Blockly.fieldRegistry'], []);
goog.addDependency("../../../" + dir + "/core/field_textinput.js", ['Blockly.FieldTextInput'], ['Blockly.Events', 'Blockly.Events.BlockChange', 'Blockly.Field', 'Blockly.fieldRegistry', 'Blockly.Msg', 'Blockly.utils', 'Blockly.utils.aria', 'Blockly.utils.Coordinate', 'Blockly.utils.dom', 'Blockly.utils.Size', 'Blockly.utils.userAgent']);
goog.addDependency("../../../" + dir + "/core/field_variable.js", ['Blockly.FieldVariable'], ['Blockly.Events', 'Blockly.Events.BlockChange', 'Blockly.FieldDropdown', 'Blockly.fieldRegistry', 'Blockly.Msg', 'Blockly.utils', 'Blockly.utils.Size', 'Blockly.VariableModel', 'Blockly.Variables', 'Blockly.Xml']);
goog.addDependency("../../../" + dir + "/core/flyout_base.js", ['Blockly.Flyout'], ['Blockly.Block', 'Blockly.Events', 'Blockly.Events.BlockCreate', 'Blockly.Events.VarCreate', 'Blockly.FlyoutButton', 'Blockly.Gesture', 'Blockly.Tooltip', 'Blockly.Touch', 'Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.utils.dom', 'Blockly.WorkspaceSvg', 'Blockly.Xml']);
goog.addDependency("../../../" + dir + "/core/flyout_button.js", ['Blockly.FlyoutButton'], ['Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.utils.dom']);
goog.addDependency("../../../" + dir + "/core/flyout_dragger.js", ['Blockly.FlyoutDragger'], ['Blockly.WorkspaceDragger']);
goog.addDependency("../../../" + dir + "/core/flyout_horizontal.js", ['Blockly.HorizontalFlyout'], ['Blockly.Block', 'Blockly.Flyout', 'Blockly.FlyoutButton', 'Blockly.utils', 'Blockly.utils.Rect']);
goog.addDependency("../../../" + dir + "/core/flyout_vertical.js", ['Blockly.VerticalFlyout'], ['Blockly.Block', 'Blockly.Flyout', 'Blockly.FlyoutButton', 'Blockly.utils', 'Blockly.utils.Rect', 'Blockly.utils.userAgent']);
goog.addDependency("../../../" + dir + "/core/generator.js", ['Blockly.Generator'], ['Blockly.Block']);
goog.addDependency("../../../" + dir + "/core/gesture.js", ['Blockly.Gesture'], ['Blockly.blockAnimations', 'Blockly.BlockDragger', 'Blockly.BubbleDragger', 'Blockly.constants', 'Blockly.Events', 'Blockly.Events.Ui', 'Blockly.FlyoutDragger', 'Blockly.Tooltip', 'Blockly.Touch', 'Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.WorkspaceDragger']);
goog.addDependency("../../../" + dir + "/core/grid.js", ['Blockly.Grid'], ['Blockly.utils.dom', 'Blockly.utils.userAgent']);
goog.addDependency("../../../" + dir + "/core/icon.js", ['Blockly.Icon'], ['Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.utils.dom', 'Blockly.utils.Size']);
goog.addDependency("../../../" + dir + "/core/inject.js", ['Blockly.inject'], ['Blockly.BlockDragSurfaceSvg', 'Blockly.Component', 'Blockly.Css', 'Blockly.DropDownDiv', 'Blockly.Events', 'Blockly.Grid', 'Blockly.Options', 'Blockly.Tooltip', 'Blockly.utils', 'Blockly.utils.dom', 'Blockly.utils.userAgent', 'Blockly.WorkspaceDragSurfaceSvg', 'Blockly.WorkspaceSvg']);
goog.addDependency("../../../" + dir + "/core/input.js", ['Blockly.Input'], ['Blockly.Connection', 'Blockly.FieldLabel']);
goog.addDependency("../../../" + dir + "/core/insertion_marker_manager.js", ['Blockly.InsertionMarkerManager'], ['Blockly.blockAnimations', 'Blockly.Events', 'Blockly.RenderedConnection']);
goog.addDependency("../../../" + dir + "/core/keyboard_nav/action.js", ['Blockly.Action'], []);
goog.addDependency("../../../" + dir + "/core/keyboard_nav/ast_node.js", ['Blockly.ASTNode'], []);
goog.addDependency("../../../" + dir + "/core/keyboard_nav/cursor.js", ['Blockly.Cursor'], []);
goog.addDependency("../../../" + dir + "/core/keyboard_nav/cursor_svg.js", ['Blockly.CursorSvg'], ['Blockly.Cursor']);
goog.addDependency("../../../" + dir + "/core/keyboard_nav/key_map.js", ['Blockly.user.keyMap'], ['Blockly.utils.KeyCodes']);
goog.addDependency("../../../" + dir + "/core/keyboard_nav/navigation.js", ['Blockly.navigation'], ['Blockly.Action', 'Blockly.ASTNode', 'Blockly.user.keyMap']);
goog.addDependency("../../../" + dir + "/core/msg.js", ['Blockly.Msg'], []);
goog.addDependency("../../../" + dir + "/core/mutator.js", ['Blockly.Mutator'], ['Blockly.Bubble', 'Blockly.Events', 'Blockly.Events.BlockChange', 'Blockly.Events.Ui', 'Blockly.Icon', 'Blockly.utils', 'Blockly.utils.dom', 'Blockly.utils.global', 'Blockly.utils.xml', 'Blockly.WorkspaceSvg', 'Blockly.Xml']);
goog.addDependency("../../../" + dir + "/core/names.js", ['Blockly.Names'], []);
goog.addDependency("../../../" + dir + "/core/options.js", ['Blockly.Options'], ['Blockly.Themes.Classic', 'Blockly.utils.userAgent', 'Blockly.Xml']);
goog.addDependency("../../../" + dir + "/core/procedures.js", ['Blockly.Procedures'], ['Blockly.Blocks', 'Blockly.constants', 'Blockly.Events', 'Blockly.Events.BlockChange', 'Blockly.Field', 'Blockly.Msg', 'Blockly.Names', 'Blockly.utils.xml', 'Blockly.Workspace', 'Blockly.Xml']);
goog.addDependency("../../../" + dir + "/core/rendered_connection.js", ['Blockly.RenderedConnection'], ['Blockly.Connection', 'Blockly.Events', 'Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.utils.dom']);
goog.addDependency("../../../" + dir + "/core/renderers/common/block_rendering.js", ['Blockly.blockRendering'], ['Blockly.geras.Renderer', 'Blockly.thrasos.Renderer', 'Blockly.zelos.Renderer']);
goog.addDependency("../../../" + dir + "/core/renderers/common/constants.js", ['Blockly.blockRendering.ConstantProvider'], ['Blockly.utils.svgPaths']);
goog.addDependency("../../../" + dir + "/core/renderers/common/debugger.js", ['Blockly.blockRendering.Debug'], ['Blockly.blockRendering.RenderInfo', 'Blockly.blockRendering.Measurable', 'Blockly.blockRendering.Types', 'Blockly.blockRendering.BottomRow', 'Blockly.blockRendering.InputRow', 'Blockly.blockRendering.Row', 'Blockly.blockRendering.SpacerRow', 'Blockly.blockRendering.TopRow']);
goog.addDependency("../../../" + dir + "/core/renderers/common/drawer.js", ['Blockly.blockRendering.Drawer'], ['Blockly.blockRendering.Debug', 'Blockly.blockRendering.RenderInfo', 'Blockly.blockRendering.Measurable', 'Blockly.blockRendering.Types', 'Blockly.blockRendering.BottomRow', 'Blockly.blockRendering.InputRow', 'Blockly.blockRendering.Row', 'Blockly.blockRendering.SpacerRow', 'Blockly.blockRendering.TopRow', 'Blockly.utils.svgPaths']);
goog.addDependency("../../../" + dir + "/core/renderers/common/info.js", ['Blockly.blockRendering.RenderInfo'], ['Blockly.blockRendering.Measurable', 'Blockly.blockRendering.Types', 'Blockly.blockRendering.BottomRow', 'Blockly.blockRendering.InputRow', 'Blockly.blockRendering.Row', 'Blockly.blockRendering.SpacerRow', 'Blockly.blockRendering.TopRow', 'Blockly.blockRendering.InlineInput', 'Blockly.blockRendering.ExternalValueInput', 'Blockly.blockRendering.StatementInput', 'Blockly.blockRendering.PreviousConnection', 'Blockly.blockRendering.NextConnection', 'Blockly.blockRendering.OutputConnection', 'Blockly.RenderedConnection']);
goog.addDependency("../../../" + dir + "/core/renderers/common/renderer.js", ['Blockly.blockRendering.Renderer'], ['Blockly.blockRendering.ConstantProvider', 'Blockly.blockRendering.Debug', 'Blockly.blockRendering.Drawer', 'Blockly.blockRendering.RenderInfo']);
goog.addDependency("../../../" + dir + "/core/renderers/geras/drawer.js", ['Blockly.geras.Drawer'], ['Blockly.blockRendering.ConstantProvider', 'Blockly.blockRendering.Drawer', 'Blockly.geras.Highlighter', 'Blockly.geras.RenderInfo', 'Blockly.utils.svgPaths']);
goog.addDependency("../../../" + dir + "/core/renderers/geras/highlight_constants.js", ['Blockly.geras.HighlightConstantProvider'], ['Blockly.blockRendering.ConstantProvider', 'Blockly.utils.svgPaths']);
goog.addDependency("../../../" + dir + "/core/renderers/geras/highlighter.js", ['Blockly.geras.Highlighter'], ['Blockly.blockRendering.RenderInfo', 'Blockly.blockRendering.Measurable', 'Blockly.blockRendering.Types', 'Blockly.blockRendering.BottomRow', 'Blockly.blockRendering.InputRow', 'Blockly.blockRendering.Row', 'Blockly.blockRendering.SpacerRow', 'Blockly.blockRendering.TopRow', 'Blockly.utils.svgPaths']);
goog.addDependency("../../../" + dir + "/core/renderers/geras/info.js", ['Blockly.geras', 'Blockly.geras.RenderInfo'], ['Blockly.blockRendering.RenderInfo', 'Blockly.blockRendering.Measurable', 'Blockly.blockRendering.Types', 'Blockly.blockRendering.BottomRow', 'Blockly.blockRendering.InputRow', 'Blockly.blockRendering.Row', 'Blockly.blockRendering.SpacerRow', 'Blockly.blockRendering.TopRow', 'Blockly.blockRendering.InlineInput', 'Blockly.blockRendering.ExternalValueInput', 'Blockly.blockRendering.StatementInput', 'Blockly.blockRendering.PreviousConnection', 'Blockly.blockRendering.NextConnection', 'Blockly.blockRendering.OutputConnection', 'Blockly.RenderedConnection']);
goog.addDependency("../../../" + dir + "/core/renderers/geras/renderer.js", ['Blockly.geras.Renderer'], ['Blockly.blockRendering.ConstantProvider', 'Blockly.blockRendering.Debug', 'Blockly.blockRendering.Renderer', 'Blockly.geras.Drawer', 'Blockly.geras.HighlightConstantProvider', 'Blockly.geras.RenderInfo']);
goog.addDependency("../../../" + dir + "/core/renderers/measurables/base.js", ['Blockly.blockRendering.Measurable'], ['Blockly.blockRendering.Types']);
goog.addDependency("../../../" + dir + "/core/renderers/measurables/connections.js", ['Blockly.blockRendering.Connection', 'Blockly.blockRendering.NextConnection', 'Blockly.blockRendering.OutputConnection', 'Blockly.blockRendering.PreviousConnection'], ['Blockly.blockRendering.Measurable', 'Blockly.blockRendering.Types', 'Blockly.RenderedConnection']);
goog.addDependency("../../../" + dir + "/core/renderers/measurables/inputs.js", ['Blockly.blockRendering.InputConnection', 'Blockly.blockRendering.InlineInput', 'Blockly.blockRendering.StatementInput', 'Blockly.blockRendering.ExternalValueInput'], ['Blockly.blockRendering.Connection', 'Blockly.blockRendering.Measurable', 'Blockly.blockRendering.Types']);
goog.addDependency("../../../" + dir + "/core/renderers/measurables/row_elements.js", ['Blockly.blockRendering.Field', 'Blockly.blockRendering.Hat', 'Blockly.blockRendering.Icon', 'Blockly.blockRendering.InRowSpacer', 'Blockly.blockRendering.JaggedEdge', 'Blockly.blockRendering.RoundCorner', 'Blockly.blockRendering.SquareCorner'], ['Blockly.blockRendering.Types', 'Blockly.blockRendering.Measurable']);
goog.addDependency("../../../" + dir + "/core/renderers/measurables/rows.js", ['Blockly.blockRendering.BottomRow', 'Blockly.blockRendering.InputRow', 'Blockly.blockRendering.Row', 'Blockly.blockRendering.SpacerRow', 'Blockly.blockRendering.TopRow'], ['Blockly.blockRendering.InputConnection', 'Blockly.blockRendering.InRowSpacer', 'Blockly.blockRendering.Measurable', 'Blockly.blockRendering.NextConnection', 'Blockly.blockRendering.PreviousConnection', 'Blockly.blockRendering.Types', 'Blockly.RenderedConnection']);
goog.addDependency("../../../" + dir + "/core/renderers/measurables/types.js", ['Blockly.blockRendering.Types'], []);
goog.addDependency("../../../" + dir + "/core/renderers/thrasos/info.js", ['Blockly.thrasos', 'Blockly.thrasos.RenderInfo'], ['Blockly.blockRendering.RenderInfo', 'Blockly.blockRendering.Measurable', 'Blockly.blockRendering.Types', 'Blockly.blockRendering.BottomRow', 'Blockly.blockRendering.InputRow', 'Blockly.blockRendering.Row', 'Blockly.blockRendering.SpacerRow', 'Blockly.blockRendering.TopRow', 'Blockly.blockRendering.InlineInput', 'Blockly.blockRendering.ExternalValueInput', 'Blockly.blockRendering.StatementInput', 'Blockly.blockRendering.PreviousConnection', 'Blockly.blockRendering.NextConnection', 'Blockly.blockRendering.OutputConnection', 'Blockly.RenderedConnection']);
goog.addDependency("../../../" + dir + "/core/renderers/thrasos/renderer.js", ['Blockly.thrasos.Renderer'], ['Blockly.blockRendering.ConstantProvider', 'Blockly.blockRendering.Debug', 'Blockly.blockRendering.Drawer', 'Blockly.blockRendering.Renderer', 'Blockly.thrasos.RenderInfo']);
goog.addDependency("../../../" + dir + "/core/renderers/zelos/constants.js", ['Blockly.zelos.ConstantProvider'], ['Blockly.blockRendering.ConstantProvider', 'Blockly.utils.svgPaths']);
goog.addDependency("../../../" + dir + "/core/renderers/zelos/drawer.js", ['Blockly.zelos.Drawer'], ['Blockly.blockRendering.ConstantProvider', 'Blockly.blockRendering.Drawer', 'Blockly.blockRendering.Types', 'Blockly.zelos.RenderInfo']);
goog.addDependency("../../../" + dir + "/core/renderers/zelos/info.js", ['Blockly.zelos', 'Blockly.zelos.RenderInfo'], ['Blockly.blockRendering.RenderInfo', 'Blockly.blockRendering.Measurable', 'Blockly.blockRendering.BottomRow', 'Blockly.blockRendering.InputRow', 'Blockly.blockRendering.Row', 'Blockly.blockRendering.SpacerRow', 'Blockly.blockRendering.TopRow', 'Blockly.blockRendering.Types', 'Blockly.blockRendering.InlineInput', 'Blockly.blockRendering.ExternalValueInput', 'Blockly.blockRendering.StatementInput', 'Blockly.blockRendering.PreviousConnection', 'Blockly.blockRendering.NextConnection', 'Blockly.blockRendering.OutputConnection', 'Blockly.RenderedConnection', 'Blockly.zelos.AfterStatementSpacerRow', 'Blockly.zelos.BeforeStatementSpacerRow', 'Blockly.zelos.BottomRow', 'Blockly.zelos.TopRow']);
goog.addDependency("../../../" + dir + "/core/renderers/zelos/measurables/rows.js", ['Blockly.zelos.BottomRow', 'Blockly.zelos.TopRow', 'Blockly.zelos.AfterStatementSpacerRow', 'Blockly.zelos.BeforeStatementSpacerRow'], ['Blockly.blockRendering.BottomRow', 'Blockly.blockRendering.TopRow', 'Blockly.blockRendering.SpacerRow']);
goog.addDependency("../../../" + dir + "/core/renderers/zelos/renderer.js", ['Blockly.zelos.Renderer'], ['Blockly.blockRendering.Debug', 'Blockly.blockRendering.Renderer', 'Blockly.zelos.ConstantProvider', 'Blockly.zelos.Drawer', 'Blockly.zelos.RenderInfo']);
goog.addDependency("../../../" + dir + "/core/scrollbar.js", ['Blockly.Scrollbar', 'Blockly.ScrollbarPair'], ['Blockly.Touch', 'Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.utils.dom']);
goog.addDependency("../../../" + dir + "/core/theme.js", ['Blockly.Theme'], []);
goog.addDependency("../../../" + dir + "/core/theme/classic.js", ['Blockly.Themes.Classic'], ['Blockly.Theme']);
goog.addDependency("../../../" + dir + "/core/theme/highcontrast.js", ['Blockly.Themes.HighContrast'], ['Blockly.Theme']);
goog.addDependency("../../../" + dir + "/core/theme/modern.js", ['Blockly.Themes.Modern'], ['Blockly.Theme']);
goog.addDependency("../../../" + dir + "/core/toolbox.js", ['Blockly.Toolbox'], ['Blockly.Events', 'Blockly.Events.Ui', 'Blockly.Flyout', 'Blockly.HorizontalFlyout', 'Blockly.Touch', 'Blockly.tree.TreeControl', 'Blockly.tree.TreeNode', 'Blockly.utils', 'Blockly.utils.aria', 'Blockly.utils.colour', 'Blockly.utils.dom', 'Blockly.utils.Rect', 'Blockly.VerticalFlyout']);
goog.addDependency("../../../" + dir + "/core/tooltip.js", ['Blockly.Tooltip'], ['Blockly.utils.string']);
goog.addDependency("../../../" + dir + "/core/touch.js", ['Blockly.Touch'], ['Blockly.utils', 'Blockly.utils.global', 'Blockly.utils.string']);
goog.addDependency("../../../" + dir + "/core/touch_gesture.js", ['Blockly.TouchGesture'], ['Blockly.Gesture', 'Blockly.utils', 'Blockly.utils.Coordinate']);
goog.addDependency("../../../" + dir + "/core/trashcan.js", ['Blockly.Trashcan'], ['Blockly.utils.dom', 'Blockly.utils.Rect', 'Blockly.Xml']);
goog.addDependency("../../../" + dir + "/core/ui_events.js", ['Blockly.Events.Ui'], ['Blockly.Events', 'Blockly.Events.Abstract']);
goog.addDependency("../../../" + dir + "/core/ui_menu_utils.js", ['Blockly.utils.uiMenu'], ['Blockly.utils.style']);
goog.addDependency("../../../" + dir + "/core/utils.js", ['Blockly.utils'], ['Blockly.Msg', 'Blockly.utils.Coordinate', 'Blockly.utils.global', 'Blockly.utils.string', 'Blockly.utils.userAgent', 'Blockly.utils.style']);
goog.addDependency("../../../" + dir + "/core/utils/aria.js", ['Blockly.utils.aria'], []);
goog.addDependency("../../../" + dir + "/core/utils/colour.js", ['Blockly.utils.colour'], ['Blockly.utils']);
goog.addDependency("../../../" + dir + "/core/utils/coordinate.js", ['Blockly.utils.Coordinate'], []);
goog.addDependency("../../../" + dir + "/core/utils/dom.js", ['Blockly.utils.dom'], ['Blockly.utils.userAgent']);
goog.addDependency("../../../" + dir + "/core/utils/global.js", ['Blockly.utils.global'], []);
goog.addDependency("../../../" + dir + "/core/utils/idgenerator.js", ['Blockly.utils.IdGenerator'], []);
goog.addDependency("../../../" + dir + "/core/utils/keycodes.js", ['Blockly.utils.KeyCodes'], []);
goog.addDependency("../../../" + dir + "/core/utils/math.js", ['Blockly.utils.math'], []);
goog.addDependency("../../../" + dir + "/core/utils/rect.js", ['Blockly.utils.Rect'], []);
goog.addDependency("../../../" + dir + "/core/utils/size.js", ['Blockly.utils.Size'], []);
goog.addDependency("../../../" + dir + "/core/utils/string.js", ['Blockly.utils.string'], []);
goog.addDependency("../../../" + dir + "/core/utils/style.js", ['Blockly.utils.style'], ['Blockly.utils.Coordinate', 'Blockly.utils.Size']);
goog.addDependency("../../../" + dir + "/core/utils/svg_paths.js", ['Blockly.utils.svgPaths'], []);
goog.addDependency("../../../" + dir + "/core/utils/useragent.js", ['Blockly.utils.userAgent'], ['Blockly.utils.global']);
goog.addDependency("../../../" + dir + "/core/utils/xml.js", ['Blockly.utils.xml'], []);
goog.addDependency("../../../" + dir + "/core/variable_events.js", ['Blockly.Events.VarBase', 'Blockly.Events.VarCreate', 'Blockly.Events.VarDelete', 'Blockly.Events.VarRename'], ['Blockly.Events', 'Blockly.Events.Abstract']);
goog.addDependency("../../../" + dir + "/core/variable_map.js", ['Blockly.VariableMap'], ['Blockly.Events', 'Blockly.Events.VarDelete', 'Blockly.Events.VarRename', 'Blockly.Msg', 'Blockly.utils']);
goog.addDependency("../../../" + dir + "/core/variable_model.js", ['Blockly.VariableModel'], ['Blockly.Events', 'Blockly.Events.VarCreate', 'Blockly.utils']);
goog.addDependency("../../../" + dir + "/core/variables.js", ['Blockly.Variables'], ['Blockly.Blocks', 'Blockly.Msg', 'Blockly.utils.xml', 'Blockly.VariableModel', 'Blockly.Xml']);
goog.addDependency("../../../" + dir + "/core/variables_dynamic.js", ['Blockly.VariablesDynamic'], ['Blockly.Variables', 'Blockly.Blocks', 'Blockly.Msg', 'Blockly.utils.xml', 'Blockly.VariableModel', 'Blockly.Xml']);
goog.addDependency("../../../" + dir + "/core/warning.js", ['Blockly.Warning'], ['Blockly.Bubble', 'Blockly.Events', 'Blockly.Events.Ui', 'Blockly.Icon', 'Blockly.utils.dom']);
goog.addDependency("../../../" + dir + "/core/widgetdiv.js", ['Blockly.WidgetDiv'], ['Blockly.Css', 'Blockly.utils.style']);
goog.addDependency("../../../" + dir + "/core/workspace.js", ['Blockly.Workspace'], ['Blockly.Cursor', 'Blockly.Events', 'Blockly.Themes.Classic', 'Blockly.utils', 'Blockly.utils.math', 'Blockly.VariableMap', 'Blockly.WorkspaceComment']);
goog.addDependency("../../../" + dir + "/core/workspace_audio.js", ['Blockly.WorkspaceAudio'], ['Blockly.utils', 'Blockly.utils.global', 'Blockly.utils.userAgent']);
goog.addDependency("../../../" + dir + "/core/workspace_comment.js", ['Blockly.WorkspaceComment'], ['Blockly.Events', 'Blockly.Events.CommentChange', 'Blockly.Events.CommentCreate', 'Blockly.Events.CommentDelete', 'Blockly.Events.CommentMove', 'Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.utils.xml']);
goog.addDependency("../../../" + dir + "/core/workspace_comment_render_svg.js", ['Blockly.WorkspaceCommentSvg.render'], ['Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.utils.dom', 'Blockly.WorkspaceCommentSvg']);
goog.addDependency("../../../" + dir + "/core/workspace_comment_svg.js", ['Blockly.WorkspaceCommentSvg'], ['Blockly.Events', 'Blockly.Events.CommentCreate', 'Blockly.Events.CommentDelete', 'Blockly.Events.CommentMove', 'Blockly.Events.Ui', 'Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.utils.dom', 'Blockly.utils.Rect', 'Blockly.WorkspaceComment']);
goog.addDependency("../../../" + dir + "/core/workspace_drag_surface_svg.js", ['Blockly.WorkspaceDragSurfaceSvg'], ['Blockly.utils', 'Blockly.utils.dom']);
goog.addDependency("../../../" + dir + "/core/workspace_dragger.js", ['Blockly.WorkspaceDragger'], ['Blockly.utils.Coordinate']);
goog.addDependency("../../../" + dir + "/core/workspace_events.js", ['Blockly.Events.FinishedLoading'], ['Blockly.Events', 'Blockly.Events.Abstract']);
goog.addDependency("../../../" + dir + "/core/workspace_svg.js", ['Blockly.WorkspaceSvg'], ['Blockly.blockRendering', 'Blockly.ConnectionDB', 'Blockly.constants', 'Blockly.CursorSvg', 'Blockly.Events', 'Blockly.Events.BlockCreate', 'Blockly.Gesture', 'Blockly.Grid', 'Blockly.Msg', 'Blockly.Options', 'Blockly.ScrollbarPair', 'Blockly.Touch', 'Blockly.TouchGesture', 'Blockly.Trashcan', 'Blockly.utils', 'Blockly.utils.Coordinate', 'Blockly.utils.dom', 'Blockly.utils.Rect', 'Blockly.VariablesDynamic', 'Blockly.Workspace', 'Blockly.WorkspaceAudio', 'Blockly.WorkspaceComment', 'Blockly.WorkspaceCommentSvg', 'Blockly.WorkspaceCommentSvg.render', 'Blockly.WorkspaceDragSurfaceSvg', 'Blockly.Xml', 'Blockly.ZoomControls']);
goog.addDependency("../../../" + dir + "/core/ws_comment_events.js", ['Blockly.Events.CommentBase', 'Blockly.Events.CommentChange', 'Blockly.Events.CommentCreate', 'Blockly.Events.CommentDelete', 'Blockly.Events.CommentMove'], ['Blockly.Events', 'Blockly.Events.Abstract', 'Blockly.utils.Coordinate', 'Blockly.utils.xml', 'Blockly.Xml']);
goog.addDependency("../../../" + dir + "/core/xml.js", ['Blockly.Xml'], ['Blockly.Events', 'Blockly.Events.BlockCreate', 'Blockly.Events.FinishedLoading', 'Blockly.Events.VarCreate', 'Blockly.utils', 'Blockly.utils.dom', 'Blockly.utils.global', 'Blockly.utils.xml']);
goog.addDependency("../../../" + dir + "/core/zoom_controls.js", ['Blockly.ZoomControls'], ['Blockly.Touch', 'Blockly.utils.dom']);
goog.addDependency("base.js", [], []);

// Load Blockly.
goog.require('Blockly');
goog.require('Blockly.ASTNode');
goog.require('Blockly.Action');
goog.require('Blockly.Block');
goog.require('Blockly.BlockDragSurfaceSvg');
goog.require('Blockly.BlockDragger');
goog.require('Blockly.BlockSvg');
goog.require('Blockly.BlockSvg.render');
goog.require('Blockly.Blocks');
goog.require('Blockly.Bubble');
goog.require('Blockly.BubbleDragger');
goog.require('Blockly.Comment');
goog.require('Blockly.Component');
goog.require('Blockly.Component.Error');
goog.require('Blockly.Connection');
goog.require('Blockly.ConnectionDB');
goog.require('Blockly.ContextMenu');
goog.require('Blockly.Css');
goog.require('Blockly.Cursor');
goog.require('Blockly.CursorSvg');
goog.require('Blockly.DraggedConnectionManager');
goog.require('Blockly.DropDownDiv');
goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');
goog.require('Blockly.Events.BlockBase');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Events.BlockCreate');
goog.require('Blockly.Events.BlockDelete');
goog.require('Blockly.Events.BlockMove');
goog.require('Blockly.Events.Change');
goog.require('Blockly.Events.CommentBase');
goog.require('Blockly.Events.CommentChange');
goog.require('Blockly.Events.CommentCreate');
goog.require('Blockly.Events.CommentDelete');
goog.require('Blockly.Events.CommentMove');
goog.require('Blockly.Events.Create');
goog.require('Blockly.Events.Delete');
goog.require('Blockly.Events.FinishedLoading');
goog.require('Blockly.Events.Move');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.Events.VarBase');
goog.require('Blockly.Events.VarCreate');
goog.require('Blockly.Events.VarDelete');
goog.require('Blockly.Events.VarRename');
goog.require('Blockly.Extensions');
goog.require('Blockly.Field');
goog.require('Blockly.FieldAngle');
goog.require('Blockly.FieldCheckbox');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldImage');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.FieldLabelSerializable');
goog.require('Blockly.FieldMultilineInput');
goog.require('Blockly.FieldNumber');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.FieldVariable');
goog.require('Blockly.Flyout');
goog.require('Blockly.FlyoutButton');
goog.require('Blockly.FlyoutDragger');
goog.require('Blockly.Generator');
goog.require('Blockly.Gesture');
goog.require('Blockly.Grid');
goog.require('Blockly.HorizontalFlyout');
goog.require('Blockly.Icon');
goog.require('Blockly.Input');
goog.require('Blockly.InsertionMarkerManager');
goog.require('Blockly.Menu');
goog.require('Blockly.MenuItem');
goog.require('Blockly.Msg');
goog.require('Blockly.Mutator');
goog.require('Blockly.Names');
goog.require('Blockly.Options');
goog.require('Blockly.Procedures');
goog.require('Blockly.RenderedConnection');
goog.require('Blockly.Scrollbar');
goog.require('Blockly.ScrollbarPair');
goog.require('Blockly.Theme');
goog.require('Blockly.Themes.Classic');
goog.require('Blockly.Themes.HighContrast');
goog.require('Blockly.Themes.Modern');
goog.require('Blockly.Toolbox');
goog.require('Blockly.Tooltip');
goog.require('Blockly.Touch');
goog.require('Blockly.TouchGesture');
goog.require('Blockly.Trashcan');
goog.require('Blockly.VariableMap');
goog.require('Blockly.VariableModel');
goog.require('Blockly.Variables');
goog.require('Blockly.VariablesDynamic');
goog.require('Blockly.VerticalFlyout');
goog.require('Blockly.Warning');
goog.require('Blockly.WidgetDiv');
goog.require('Blockly.Workspace');
goog.require('Blockly.WorkspaceAudio');
goog.require('Blockly.WorkspaceComment');
goog.require('Blockly.WorkspaceCommentSvg');
goog.require('Blockly.WorkspaceCommentSvg.render');
goog.require('Blockly.WorkspaceDragSurfaceSvg');
goog.require('Blockly.WorkspaceDragger');
goog.require('Blockly.WorkspaceSvg');
goog.require('Blockly.Xml');
goog.require('Blockly.ZoomControls');
goog.require('Blockly.blockAnimations');
goog.require('Blockly.blockRendering');
goog.require('Blockly.blockRendering.BottomRow');
goog.require('Blockly.blockRendering.Connection');
goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.blockRendering.Debug');
goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.blockRendering.ExternalValueInput');
goog.require('Blockly.blockRendering.Field');
goog.require('Blockly.blockRendering.Hat');
goog.require('Blockly.blockRendering.Icon');
goog.require('Blockly.blockRendering.InRowSpacer');
goog.require('Blockly.blockRendering.InlineInput');
goog.require('Blockly.blockRendering.InputConnection');
goog.require('Blockly.blockRendering.InputRow');
goog.require('Blockly.blockRendering.JaggedEdge');
goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.NextConnection');
goog.require('Blockly.blockRendering.OutputConnection');
goog.require('Blockly.blockRendering.PreviousConnection');
goog.require('Blockly.blockRendering.RenderInfo');
goog.require('Blockly.blockRendering.Renderer');
goog.require('Blockly.blockRendering.RoundCorner');
goog.require('Blockly.blockRendering.Row');
goog.require('Blockly.blockRendering.SpacerRow');
goog.require('Blockly.blockRendering.SquareCorner');
goog.require('Blockly.blockRendering.StatementInput');
goog.require('Blockly.blockRendering.TopRow');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.constants');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.geras');
goog.require('Blockly.geras.Drawer');
goog.require('Blockly.geras.HighlightConstantProvider');
goog.require('Blockly.geras.Highlighter');
goog.require('Blockly.geras.RenderInfo');
goog.require('Blockly.geras.Renderer');
goog.require('Blockly.inject');
goog.require('Blockly.navigation');
goog.require('Blockly.thrasos');
goog.require('Blockly.thrasos.RenderInfo');
goog.require('Blockly.thrasos.Renderer');
goog.require('Blockly.tree.BaseNode');
goog.require('Blockly.tree.TreeControl');
goog.require('Blockly.tree.TreeNode');
goog.require('Blockly.user.keyMap');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.IdGenerator');
goog.require('Blockly.utils.KeyCodes');
goog.require('Blockly.utils.Rect');
goog.require('Blockly.utils.Size');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.colour');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.global');
goog.require('Blockly.utils.math');
goog.require('Blockly.utils.string');
goog.require('Blockly.utils.style');
goog.require('Blockly.utils.svgPaths');
goog.require('Blockly.utils.uiMenu');
goog.require('Blockly.utils.userAgent');
goog.require('Blockly.utils.xml');
goog.require('Blockly.zelos');
goog.require('Blockly.zelos.AfterStatementSpacerRow');
goog.require('Blockly.zelos.BeforeStatementSpacerRow');
goog.require('Blockly.zelos.BottomRow');
goog.require('Blockly.zelos.ConstantProvider');
goog.require('Blockly.zelos.Drawer');
goog.require('Blockly.zelos.RenderInfo');
goog.require('Blockly.zelos.Renderer');
goog.require('Blockly.zelos.TopRow');

delete root.BLOCKLY_DIR;
delete root.BLOCKLY_BOOT;
delete root.IS_NODE_JS;
};

if (this.IS_NODE_JS) {
  this.BLOCKLY_BOOT(this);
  module.exports = Blockly;
} else {
  // Delete any existing Closure (e.g. Soy's nogoog_shim).
  document.write('<script>var goog = undefined;</script>');
  // Load fresh Closure Library.
  document.write('<script src="' + this.BLOCKLY_DIR +
      '/closure/goog/base.js"></script>');
  document.write('<script>this.BLOCKLY_BOOT(this);</script>');
}
