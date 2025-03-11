import type {IBoundedElement} from './interfaces/i_bounded_element.js';

/**
 * Representation of an item displayed in a flyout.
 */
export class FlyoutItem {
  /**
   * Creates a new FlyoutItem.
   *
   * @param element The element that will be displayed in the flyout.
   * @param type The type of element. Should correspond to the type of the
   *     flyout inflater that created this object.
   * @param focusable True if the element should be allowed to be focused by
   *     e.g. keyboard navigation in the flyout.
   */
  constructor(
    private element: IBoundedElement,
    private type: string,
    private focusable: boolean,
  ) {}

  /**
   * Returns the element displayed in the flyout.
   */
  getElement() {
    return this.element;
  }

  /**
   * Returns the type of flyout element this item represents.
   */
  getType() {
    return this.type;
  }

  /**
   * Returns whether or not the flyout element can receive focus.
   */
  isFocusable() {
    return this.focusable;
  }
}
