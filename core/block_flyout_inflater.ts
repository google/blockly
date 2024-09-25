import type {IFlyout} from './interfaces/i_flyout.js';
import type {IFlyoutInflater} from './interfaces/i_flyout_inflater.js';
import type {IBoundedElement} from './interfaces/i_bounded_element.js';
import {BlockSvg} from './block_svg.js';
import type {WorkspaceSvg} from './workspace_svg.js';
import * as utilsXml from './utils/xml.js';
import * as eventUtils from './events/utils.js';
import * as Xml from './xml.js';
import * as blocks from './serialization/blocks.js';
import * as common from './common.js';
import * as registry from './registry.js';
import {MANUALLY_DISABLED} from './constants.js';
import type {Abstract as AbstractEvent} from './events/events_abstract.js';
import type {BlockInfo} from './utils/toolbox.js';
import * as browserEvents from './browser_events.js';

/**
 * The language-neutral ID for when the reason why a block is disabled is
 * because the workspace is at block capacity.
 */
const WORKSPACE_AT_BLOCK_CAPACITY_DISABLED_REASON =
  'WORKSPACE_AT_BLOCK_CAPACITY';

export class BlockFlyoutInflater implements IFlyoutInflater {
  protected permanentlyDisabledBlocks = new Set<BlockSvg>();
  protected listeners = new Map<string, browserEvents.Data[]>();
  protected flyoutWorkspace?: WorkspaceSvg;
  protected flyout?: IFlyout;
  private capacityFilter: (e: AbstractEvent) => void;

  constructor() {
    this.capacityFilter = (event: AbstractEvent) => {
      if (
        !this.flyoutWorkspace ||
        (event &&
          !(
            event.type === eventUtils.BLOCK_CREATE ||
            event.type === eventUtils.BLOCK_DELETE
          ))
      )
        return;

      this.flyoutWorkspace.getTopBlocks(false).forEach((block) => {
        if (!this.permanentlyDisabledBlocks.has(block)) {
          this.updateStateBasedOnCapacity(block);
        }
      });
    };
  }

  load(state: Object, flyoutWorkspace: WorkspaceSvg): IBoundedElement {
    this.setFlyoutWorkspace(flyoutWorkspace);
    this.flyout = flyoutWorkspace.targetWorkspace?.getFlyout() ?? undefined;
    const block = this.createBlock(state as BlockInfo, flyoutWorkspace);

    if (!block.isEnabled()) {
      // Record blocks that were initially disabled.
      // Do not enable these blocks as a result of capacity filtering.
      this.permanentlyDisabledBlocks.add(block);
    } else {
      this.updateStateBasedOnCapacity(block);
    }

    // Mark blocks as being inside a flyout.  This is used to detect and
    // prevent the closure of the flyout if the user right-clicks on such
    // a block.
    block.getDescendants(false).forEach((b) => (b.isInFlyout = true));
    this.addBlockListeners(block);

    return block;
  }

  createBlock(blockDefinition: BlockInfo, workspace: WorkspaceSvg): BlockSvg {
    let block;
    if (blockDefinition['blockxml']) {
      const xml = (
        typeof blockDefinition['blockxml'] === 'string'
          ? utilsXml.textToDom(blockDefinition['blockxml'])
          : blockDefinition['blockxml']
      ) as Element;
      block = Xml.domToBlockInternal(xml, workspace);
    } else {
      if (blockDefinition['enabled'] === undefined) {
        blockDefinition['enabled'] =
          blockDefinition['disabled'] !== 'true' &&
          blockDefinition['disabled'] !== true;
      }
      if (
        blockDefinition['disabledReasons'] === undefined &&
        blockDefinition['enabled'] === false
      ) {
        blockDefinition['disabledReasons'] = [MANUALLY_DISABLED];
      }
      block = blocks.appendInternal(blockDefinition as blocks.State, workspace);
    }

    return block as BlockSvg;
  }

  gapForElement(state: Object, defaultGap: number): number {
    const blockState = state as BlockInfo;
    let gap;
    if (blockState['gap']) {
      gap = parseInt(String(blockState['gap']));
    } else if (blockState['blockxml']) {
      const xml = (
        typeof blockState['blockxml'] === 'string'
          ? utilsXml.textToDom(blockState['blockxml'])
          : blockState['blockxml']
      ) as Element;
      gap = parseInt(xml.getAttribute('gap')!);
    }

    return !gap || isNaN(gap) ? defaultGap : gap;
  }

  disposeElement(element: IBoundedElement): void {
    if (!(element instanceof BlockSvg)) return;
    this.removeListeners(element.id);
    element.dispose(false, false);
  }

  protected removeListeners(blockId: string) {
    const blockListeners = this.listeners.get(blockId) ?? [];
    blockListeners.forEach((l) => browserEvents.unbind(l));
    this.listeners.delete(blockId);
  }

  protected setFlyoutWorkspace(workspace: WorkspaceSvg) {
    if (this.flyoutWorkspace === workspace) return;

    if (this.flyoutWorkspace) {
      this.flyoutWorkspace.targetWorkspace?.removeChangeListener(
        this.capacityFilter,
      );
    }
    this.flyoutWorkspace = workspace;
    this.flyoutWorkspace.targetWorkspace?.addChangeListener(
      this.capacityFilter,
    );
  }

  private updateStateBasedOnCapacity(block: BlockSvg) {
    const enable = this.flyoutWorkspace?.targetWorkspace?.isCapacityAvailable(
      common.getBlockTypeCounts(block),
    );
    let currentBlock: BlockSvg | null = block;
    while (currentBlock) {
      currentBlock.setDisabledReason(
        !enable,
        WORKSPACE_AT_BLOCK_CAPACITY_DISABLED_REASON,
      );
      currentBlock = currentBlock.getNextBlock();
    }
  }

  /**
   * Add listeners to a block that has been added to the flyout.
   *
   * @param block The block to add listeners for.
   */
  protected addBlockListeners(block: BlockSvg) {
    const blockListeners = [];

    blockListeners.push(
      browserEvents.conditionalBind(
        block.getSvgRoot(),
        'pointerdown',
        block,
        (e: PointerEvent) => {
          const gesture = this.flyoutWorkspace?.targetWorkspace?.getGesture(e);
          const flyout = this.flyoutWorkspace?.targetWorkspace?.getFlyout();
          if (gesture && flyout) {
            gesture.setStartBlock(block);
            gesture.handleFlyoutStart(e, flyout);
          }
        },
      ),
    );

    blockListeners.push(
      browserEvents.bind(block.getSvgRoot(), 'pointerenter', null, () => {
        if (!this.flyoutWorkspace?.targetWorkspace?.isDragging()) {
          block.addSelect();
        }
      }),
    );
    blockListeners.push(
      browserEvents.bind(block.getSvgRoot(), 'pointerleave', null, () => {
        if (!this.flyoutWorkspace?.targetWorkspace?.isDragging()) {
          block.removeSelect();
        }
      }),
    );

    this.listeners.set(block.id, blockListeners);
  }
}

registry.register(registry.Type.FLYOUT_INFLATER, 'block', BlockFlyoutInflater);
