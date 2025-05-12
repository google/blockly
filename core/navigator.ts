/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {INavigable} from './interfaces/i_navigable.js';
import type {INavigationPolicy} from './interfaces/i_navigation_policy.js';

type RuleMap<T> = Map<new (...args: any) => T, INavigationPolicy<T>>;

/**
 * Class responsible for determining where focus should move in response to
 * keyboard navigation commands.
 */
export class Navigator {
  /**
   * Map from classes to a corresponding ruleset to handle navigation from
   * instances of that class.
   */
  private rules: RuleMap<any> = new Map();

  /**
   * Associates a navigation ruleset with its corresponding class.
   *
   * @param key The class whose object instances should have their navigation
   *     controlled by the associated policy.
   * @param policy A ruleset that determines where focus should move starting
   *     from an instance of the given class.
   */
  set<T extends INavigable<T>>(
    key: new (...args: any) => T,
    policy: INavigationPolicy<T>,
  ) {
    this.rules.set(key, policy);
  }

  /**
   * Returns the navigation ruleset associated with the given object instance's
   * class.
   *
   * @param key An object to retrieve a navigation ruleset for.
   * @returns The navigation ruleset of objects of the given object's class, or
   *     undefined if no ruleset has been registered for the object's class.
   */
  private get<T extends INavigable<T>>(
    key: T,
  ): INavigationPolicy<T> | undefined {
    return this.rules.get(key.getClass());
  }

  /**
   * Returns the first child of the given object instance, if any.
   *
   * @param current The object to retrieve the first child of.
   * @returns The first child node of the given object, if any.
   */
  getFirstChild<T extends INavigable<T>>(current: T): INavigable<any> | null {
    const result = this.get(current)?.getFirstChild(current);
    if (!result) return null;
    // If the child isn't navigable, don't traverse into it; check its peers.
    if (!this.get(result)?.isNavigable(result))
      return this.getNextSibling(result);
    return result;
  }

  /**
   * Returns the parent of the given object instance, if any.
   *
   * @param current The object to retrieve the parent of.
   * @returns The parent node of the given object, if any.
   */
  getParent<T extends INavigable<T>>(current: T): INavigable<any> | null {
    const result = this.get(current)?.getParent(current);
    if (!result) return null;
    if (!this.get(result)?.isNavigable(result)) return this.getParent(result);
    return result;
  }

  /**
   * Returns the next sibling of the given object instance, if any.
   *
   * @param current The object to retrieve the next sibling node of.
   * @returns The next sibling node of the given object, if any.
   */
  getNextSibling<T extends INavigable<T>>(current: T): INavigable<any> | null {
    const result = this.get(current)?.getNextSibling(current);
    if (!result) return null;
    if (!this.get(result)?.isNavigable(result))
      return this.getNextSibling(result);
    return result;
  }

  /**
   * Returns the previous sibling of the given object instance, if any.
   *
   * @param current The object to retrieve the previous sibling node of.
   * @returns The previous sibling node of the given object, if any.
   */
  getPreviousSibling<T extends INavigable<T>>(
    current: T,
  ): INavigable<any> | null {
    const result = this.get(current)?.getPreviousSibling(current);
    if (!result) return null;
    if (!this.get(result)?.isNavigable(result))
      return this.getPreviousSibling(result);
    return result;
  }
}
