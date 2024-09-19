import type {IBoundedElement} from './i_bounded_element.js';
import type {WorkspaceSvg} from '../workspace_svg.js';

export interface IFlyoutInflater {
  /**
   * Loads the object represented by the given state onto the workspace.
   *
   * Note that this method's interface is indentical to that in ISerializer, to
   * allow for code reuse.
   *
   * @param state A JSON representation of an element to inflate on the flyout.
   * @param flyoutWorkspace The flyout's workspace, where the inflated element
   *    should be created. If the inflated element is an `IRenderedElement` it
   *    itself or the inflater should append it to the workspace; the flyout
   *    will not do so itself. The flyout is responsible for positioning the
   *    element, however.
   * @returns The newly inflated flyout element.
   */
  load(state: Object, flyoutWorkspace: WorkspaceSvg): IBoundedElement;

  /**
   * Disposes of the given element.
   *
   * If the element in question resides on the flyout workspace, it should remove
   * itself. Implementers are not otherwise required to fully dispose of the
   * element; it may be e.g. cached for performance purposes.
   *
   * @param element The flyout element to dispose of.
   */
  disposeElement(element: IBoundedElement);
}
