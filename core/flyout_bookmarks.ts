/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Flyout bookmarks for faster picking blocks category
 */

import {Flyout} from './flyout_base.js';
import {Workspace} from './workspace.js';
import {FlyoutButton} from './flyout_button.js';
import {WorkspaceSvg} from './workspace_svg';

/**
 * Flyout bookmarks for faster picking blocks category
 * @class
 */
// goog.module('Blockly.FlyoutBookmarks');

type Bookmark = {
  div: Element;
  button: FlyoutButton;
  callback(): void;
  text: string;
};

export class FlyoutBookmarks {
  private flyout_: Flyout;
  private workspace_: Workspace;
  private inserted: boolean;
  private bookmarks_: Bookmark[];
  private currentActiveBookmark_: Bookmark | null;
  private rootDiv_: HTMLDivElement | null;

  constructor(flyout: Flyout) {
    this.flyout_ = flyout;
    this.workspace_ = flyout.workspace_;
    this.inserted = false;
    this.bookmarks_ = [];
    this.currentActiveBookmark_ = null;
    this.rootDiv_ = null;
  }

  show() {
    if (!this.flyout_.buttons_.length) return;

    if (!this.inserted) {
      this.rootDiv_ = document.createElement('div');
      this.rootDiv_.classList.add('blocklyFlyoutBookmarks');

      // insert close button after the flyout svg
      const flyoutSVG = this.flyout_.workspace_.getParentSvg();
      flyoutSVG.parentElement?.insertBefore(
        this.rootDiv_,
        flyoutSVG.nextSibling,
      );
      this.inserted = true;
    }

    this.hide();

    const flyoutSVG = this.flyout_.workspace_.getParentSvg();
    const flyoutParentEl = flyoutSVG.parentElement;

    const flyoutClientRect = flyoutSVG.getBoundingClientRect();
    const flyoutParentClientRect = flyoutParentEl?.getBoundingClientRect();

    // @ts-ignore:next-line
    const top = flyoutClientRect.top - flyoutParentClientRect.top + 40; // gap in top
    // @ts-ignore:next-line
    const left = flyoutClientRect.right - flyoutParentClientRect.left;

    // @ts-ignore:next-line
    this.rootDiv_.style.top = `${top}px`;
    // @ts-ignore:next-line
    this.rootDiv_.style.left = `${left}px`;
    // @ts-ignore:next-line
    this.rootDiv_.style.display = 'flex';

    this.createBookmarks_();
  }

  createBookmarks_() {
    this.flyout_.buttons_.forEach((button) => {
      if (button.isLabel()) {
        this.createBookmark_(button);
      }
    });
  }

  createBookmark_(button: FlyoutButton) {
    const bookmarkDiv = document.createElement('div');
    bookmarkDiv.classList.add('blocklyFlyoutBookmark');

    const categoryColor = getComputedStyle(button.svgText!).fill;
    bookmarkDiv.style.backgroundColor = categoryColor;
    bookmarkDiv.style.boxShadow = `inset -2px 0px 2px ${categoryColor}`;

    const firstCharSpan = document.createElement('span');
    const fullTextSpan = document.createElement('span');
    fullTextSpan.classList.add('blocklyFlyoutBookmarkFullText');

    bookmarkDiv.appendChild(firstCharSpan);
    bookmarkDiv.appendChild(fullTextSpan);

    firstCharSpan.textContent = button.info.text.charAt(0);
    fullTextSpan.textContent = button.info.text.slice(1);

    this.rootDiv_?.appendChild(bookmarkDiv);

    const callback = () => {
      if (this.flyout_.isScrollable()) {
        const buttonPosition = button.getPosition().y;
        const flyoutScale = this.flyout_.workspace_.scale;

        // @ts-ignore:next-line
        const buttonHeight = button.svgGroup?.getBBox().height;

        if (!buttonHeight) return;

        const targetY =
          buttonPosition * flyoutScale - buttonHeight * flyoutScale * 2;
        (this.workspace_ as WorkspaceSvg).scrollbar?.setY(targetY);
      }
    };

    bookmarkDiv.addEventListener('click', callback.bind(this));

    this.bookmarks_.push({
      button,
      div: bookmarkDiv,
      text: button.info.text,
      callback,
    });
  }

  hide() {
    if (this.rootDiv_) this.rootDiv_.style.display = 'none';

    this.bookmarks_.forEach((bookmark) => {
      bookmark.div.removeEventListener('click', bookmark.callback);
      bookmark.div.remove();
    });
    this.bookmarks_ = [];
  }

  updatePosition(scrollPosition: number) {
    if (!this.bookmarks_.length) return;

    const scrollMetrics = this.flyout_.workspace_
      .getMetricsManager()
      .getScrollMetrics();
    const scrollHeight = scrollMetrics.height;
    const scale = this.flyout_.workspace_.scale;
    let foundCurrentBookmark = false;

    this.bookmarks_.forEach((bookmark, i, bookmarks) => {
      const bookMarkStartPosition =
        (bookmark.button.getPosition().y * scale) / scrollHeight;

      if (bookMarkStartPosition > scrollPosition) return;

      if (bookmarks.length - 1 === i) {
        foundCurrentBookmark = true;
        this.markAsCurrent_(bookmark);
        return;
      }

      const nextBookmarkPosition =
        (bookmarks[i + 1].button.getPosition().y * scale) / scrollHeight;
      if (
        bookMarkStartPosition < scrollPosition &&
        scrollPosition < nextBookmarkPosition
      ) {
        foundCurrentBookmark = true;
        this.markAsCurrent_(bookmark);
      }
    });

    if (!foundCurrentBookmark && this.currentActiveBookmark_) {
      this.currentActiveBookmark_.div.classList.remove(
        'blocklyFlyoutBookmarkActive',
      );
    }
  }

  markAsCurrent_(bookmark: Bookmark) {
    if (this.currentActiveBookmark_) {
      this.currentActiveBookmark_.div.classList.remove(
        'blocklyFlyoutBookmarkActive',
      );
    }

    bookmark.div.classList.add('blocklyFlyoutBookmarkActive');
    this.currentActiveBookmark_ = bookmark;
  }
}
