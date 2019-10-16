import * as Blockly from "./blockly";

/**
 * This would be an interface exposed at Blockly.Plugins
 */
interface Plugins {
    /**
     * Register a new plugin with Blockly
     * @param id a unique identifier for the plugin to allow later reference/removal
     * @param factory a function that returns a PluginSpec.
     */
    register: (id: string, factory: PluginSpecFactory) => void

    /**
     * Unregister a plugin given its id
     * @param id
     */
    unregister: (id: string) => void

    /**
     * Register a listener function that is called whenever a plugin is registered or unregistered
     */
    registerLifecycleListener: (listener: LifecycleListener) => void

    /**
     * Unregister a listener
     */
    unregisterLifecycleListener: (listener: LifecycleListener) => void

    /**
     * Get all hooks of a given name from all registered plugins
     */
    getHooks: (name: HookName) => Array<Hooks[HookName]>
}

/**
 * The lifecycle stages of a plugin
 */
type LifecycleStage = 'REGISTER' | 'UNREGISTER'

/**
 * A function that reacts to a change in lifecycle stage of a plugin (eg. register/unregister)
 */
type LifecycleListener = (stage: LifecycleStage, pluginSpec: PluginSpec) => void

/**
 * A function that generates a PluginSpec for the given Blockly namespace.
 *
 * Passing Blockly like this to a factory, allows the plugin to be agnostic about the origin of Blockly,
 * and module system. So a plugin may be implemented in any transpiled variant of JavaScript.
 * (eg. Closure, ES6+ via Babel, TypeScript)
 */
type PluginSpecFactory = (blockly: typeof Blockly) => PluginSpec

/**
 * Defines a Blockly plugin
 */
interface PluginSpec {
    /**
     * A function that is called when the plugin is registered
     */
    init?: () => void

    /**
     * A function that is called when the plugin is unregistered
     */
    dispose?: () => void

    /**
     * Named hooks that can be inspected by Blockly core or even other plugins
     */
    hooks?: Hooks

    /**
     * Aspects that add behaviour into existing APIs within Blockly core (based on AOP concepts)
     */
    aspects?: Aspects
}

interface Hooks {
    // TODO: add explicit Blockly core hook definitions into here

    fields?: Record<FieldType, FieldClass>
    blockContextMenu?: MenuOptionsFactory<Blockly.BlockSvg>
    workspaceContextMenu?: MenuOptionsFactory<Blockly.WorkspaceSvg>

    /**
     * Support for future hooks ???
     * (could possibly ditch this and use TS interface merging to allow plugins to define own hooks)
     */
    [name: string]: any
}

type FieldType = string
type FieldClass = { fromJson: Function }

type MenuOptionsFactory<C> = (context: C) => MenuOption | MenuOption[] | undefined
type MenuOption = {
    text: string
    enabled?: boolean
    callback: () => void
}

type HookName = keyof Hooks

type Target<T = any, A extends any[] = any[], R = any> = (this: T, ...args: A) => R

type Aspects = Array<Aspect<Target>>

/**
 * Define an Aspect, which consists of a pointcut and an advice
 * The F param can reflect the signature of the target function
 */
interface Aspect<F extends Target> {
    pointcut: Pointcut
    advice: Advice<F>
    weight?: number
}

/**
 * A Pointcut defines the target function of the advice, it can be specified as a string...
 *
 * 'WorkspaceSvg#createDom' - which will refer to the instance method: Blockly.WorkspaceSvg.prototype.createDom
 * 'FieldTextInput.fromJson' - which refers to the static method: FieldTextInput.fromJson
 *
 * or as a tuple of the actual object and the name of the target function...
 *
 * [Blockly.WorkspaceSvg.prototype, 'createDom']
 * [Blockly.FieldTextInput, 'fromJson']
 */
type Pointcut = string | PointcutRef<object>

type PointcutRef<T> = [T, keyof T]

/**
 * An Advice defines the new behaviour and when to apply it.
 */
interface Advice<F extends Target> {
    /**
     * Call this function *before* the original function, it will take the parameters from the original function call
     * and may return alternative parameters to call the original function with
     * @param args The original parameters
     * @return New parameters to call the original function (or further advice) with or undefined to use the same params
     */
    before?: (this: ThisParameterType<F>, ...args: Parameters<F>) => Parameters<F> | undefined

    /**
     * Call this function *after* the original function, it will take the return value from the original function call
     * and may return a new value
     * @param returnValue The return value of the original function or previous advice
     * @return New return value or undefined if it doesn't want to change it
     */
    after?: (this: ThisParameterType<F>, returnValue: ReturnType<F>) => ReturnType<F> | undefined

    /**
     * Apply behaviour *around* the original function, it will be called instead of the original function, and will
     * be able to invoke the original function either with its original params or new params, at any time, or not
     * at all, and then return whatever value it wants.
     * @param invoke invokes the original function with new parameters or the original parameter if call without any
     * @param args the parameters from the original function call
     */
    around?: (this: ThisParameterType<F>, invoke: (args?: Parameters<F>) => ReturnType<F>, args: Parameters<F>) => ReturnType<F>
}
