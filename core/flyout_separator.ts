import type {IBoundedElement} from './interfaces/i_bounded_element.js';
import {Rect} from './utils/rect.js';

export class FlyoutSeparator implements IBoundedElement {
  private x = 0;
  private y = 0;
  constructor(private gap: number) {}

  getBoundingRectangle(): Rect {
    return new Rect(this.y, this.y + this.gap, this.x, this.x + this.gap);
  }

  moveBy(dx: number, dy: number, _reason?: string[]) {
    this.x += dx;
    this.y += dy;
  }
}
