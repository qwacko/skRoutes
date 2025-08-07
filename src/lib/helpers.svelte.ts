import { Throttled, watch, type Getter, type Setter } from 'runed';
import { cloneDeep, isEqual } from 'lodash-es';

/**
 * Defines the types of values that can be safely synchronized.
 * Includes primitives, Date objects, and complex nested structures.
 */
type StandardValues = string | number | boolean | null | undefined | Date | unknown;

/**
 * Defines the structure of objects that can be synchronized.
 * Supports nested objects and arrays containing the standard values.
 */
type StandardObject =
	| { [key: string]: StandardValues | StandardObject | Array<StandardObject> }
	| Array<StandardValues | StandardObject>;

/**
 * Creates a bi-directional sync between a getter and setter with optional throttling.
 * 
 * This utility enables reactive synchronization where:
 * - Changes to the getter's value are throttled and synced to internal state
 * - Changes to internal state are throttled and passed to the setter
 * - Both directions can have independent throttle times
 * 
 * @template T - The type of object being synchronized
 * @param options - Configuration for the sync behavior
 * @param options.getter - Function that returns the source value to sync from
 * @param options.setter - Function called when internal state changes need to be persisted
 * @param options.throttleTime - Milliseconds to throttle setter calls (default: 0)
 * @param options.throttleTimeGetter - Milliseconds to throttle getter changes (default: 0) 
 * @param options.debug - Enable debug logging (default: false)
 * 
 * @returns Object with state getter/setter and immediateUpdate function
 * 
 * @example
 * ```typescript
 * const sync = throttledSync({
 *   getter: () => externalState,
 *   setter: (newValue) => { externalState = newValue; },
 *   throttleTime: 500 // Throttle external updates to 500ms
 * });
 * 
 * // Access current state
 * console.log(sync.state.someProperty);
 * 
 * // Update state (will be throttled)
 * sync.state.someProperty = 'new value';
 * 
 * // Update immediately without throttling
 * sync.immediateUpdate({ someProperty: 'immediate' });
 * ```
 */
export const throttledSync = <T extends StandardObject>({
	getter,
	setter,
	throttleTime = 0,
	throttleTimeGetter = 0,
	debug = false
}: {
	getter: Getter<T>;
	setter: Setter<T>;
	throttleTime?: number;
	throttleTimeGetter?: number;
	debug?: boolean;
}) => {
	// Internal reactive state that can be modified directly
	let internalState: T = $state($state.snapshot(getter()) as T);
	
	// Track previous state to detect actual changes (not just reference changes)
	let previousState: T = $state($state.snapshot(getter()) as T);

	// Debug watchers to track value changes
	if (debug) {
		watch(
			() => getter(),
			() => {
				console.log('[throttledSync] Getter value changed:', $state.snapshot(getter()));
			}
		);

		watch(
			() => $state.snapshot(internalState),
			() => {
				console.log('[throttledSync] Internal state changed:', $state.snapshot(internalState));
			}
		);
	}

	// Throttle changes from the getter to prevent rapid external updates
	const throttledValue = new Throttled(() => $state.snapshot(getter()) as T, throttleTimeGetter);
	watch(
		() => $state.snapshot(throttledValue.current),
		(current, prev) => {
			debug && console.log('[throttledSync] Throttled getter value changed:', current, 'from:', prev);
			
			const valueSnapshot = $state.snapshot(getter()) as T;
			const previousValueSnapshot = $state.snapshot(previousState) as T;
			
			// Only update if there's an actual change in content
			if (
				valueSnapshot &&
				previousValueSnapshot &&
				!isEqual(valueSnapshot, previousValueSnapshot)
			) {
				debug && console.log('[throttledSync] Syncing getter -> internal state');
				previousState = valueSnapshot;
				internalState = valueSnapshot;
			}
		}
	);

	// Throttle changes from internal state to the setter
	const throttledInternalValue = new Throttled(() => $state.snapshot(internalState), throttleTime);
	watch(
		() => throttledInternalValue.current,
		(current, prev) => {
			debug && console.log('[throttledSync] Throttled internal value changed:', 
				$state.snapshot(current), 'from:', $state.snapshot(prev));
			
			const valueSnapshot = $state.snapshot(internalState) as T;
			const previousValueSnapshot = $state.snapshot(previousState);
			
			// Only call setter if there's an actual change in content
			if (
				valueSnapshot &&
				previousValueSnapshot &&
				!isEqual(valueSnapshot, previousValueSnapshot)
			) {
				debug && console.log('[throttledSync] Calling setter with:', valueSnapshot);
				previousState = valueSnapshot;
				setter(valueSnapshot);
			}
		}
	);

	return {
		/**
		 * Reactive state that can be read from and written to.
		 * Changes to this state will be throttled before calling the setter.
		 */
		get state() {
			return internalState;
		},
		set state(newValue: T) {
			internalState = newValue;
		},
		
		/**
		 * Immediately update both internal state and call setter without throttling.
		 * Useful for external synchronization that should bypass throttling.
		 * 
		 * @param newValue - The new value to set immediately
		 */
		immediateUpdate: (newValue: T) => {
			const internalStateSnapshot = $state.snapshot(internalState) as T;
			if (!isEqual(newValue, internalStateSnapshot)) {
				debug && console.log('[throttledSync] Immediate update to:', newValue);
				internalState = cloneDeep(newValue);
				previousState = cloneDeep(newValue);
				setter(cloneDeep(newValue));
			}
		}
	};
};
