import {Coordinate} from '../utils/coordinate';

/**
 * Represents the state of a drag operation.
 */
interface DragState {
  /** The starting point of the drag. */
  startPoint: Coordinate;
  /** The current drag delta. */
  dragDeltaXY: Coordinate | null;
  /** The current workspace scale. */
  scale: number;
}

const dragState: DragState = {
  startPoint: new Coordinate(0, 0),
  dragDeltaXY: null,
  scale: 1,
};

/**
 * Initializes the drag state.
 *
 * @param startPoint The starting point of the drag.
 * @param dragDeltaXY The initial drag delta.
 * @param scale The current workspace scale.
 */
export function initDrag(
  startPoint: Coordinate,
  dragDeltaXY: Coordinate,
  scale: number,
): void {
  dragState.startPoint = startPoint;
  dragState.dragDeltaXY = dragDeltaXY;
  dragState.scale = scale;
}

/**
 * Updates the drag based on the current point.
 *
 * @param currentPoint The current point of the drag.
 * @returns The new location of the dragged object.
 * @throws {Error} If drag has not been initialized.
 */
export function updateDrag(currentPoint: Coordinate): Coordinate {
  if (!dragState.dragDeltaXY) {
    throw new Error('Drag not initialized');
  }
  return Coordinate.sum(dragState.dragDeltaXY, currentPoint);
}

/**
 * Scales a point based on the current drag state scale.
 *
 * @param point The point to scale.
 * @returns The scaled point.
 */
export function scalePoint(point: Coordinate): Coordinate {
  return new Coordinate(point.x / dragState.scale, point.y / dragState.scale);
}
