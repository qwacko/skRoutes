import { Throttled, watch, type Getter, type Setter } from 'runed';
import { cloneDeep, isEqual } from 'lodash-es';

type StandardValues = string | number | boolean | null | undefined | Date;
type StandardObject =
	| { [key: string]: StandardValues | StandardObject | Array<StandardObject> }
	| Array<StandardValues | StandardObject>;

export const throttledSync = <T extends StandardObject>({
	getter,
	setter,
	throttleTime = 0
}: {
	getter: Getter<T>;
	setter: Setter<T>;
	throttleTime?: number;
}) => {
	let internalState: T = $state($state.snapshot(getter()) as T);
	let previousState: T = $state($state.snapshot(getter()) as T);

	const throttledValue = new Throttled(() => $state.snapshot(getter()) as T, throttleTime);
	watch(
		() => throttledValue.current,
		(current, prev) => {
			const valueSnapshot = $state.snapshot(getter()) as T;
			const previousValueSnapshot = $state.snapshot(previousState) as T;
			if (
				valueSnapshot &&
				previousValueSnapshot &&
				!isEqual(valueSnapshot, previousValueSnapshot)
			) {
				previousState = valueSnapshot;
				internalState = valueSnapshot;
			}
		}
	);

	const throttledInternalValue = new Throttled(() => $state.snapshot(internalState), throttleTime);
	watch(
		() => throttledInternalValue.current,
		(current, prev) => {
			const valueSnapshot = $state.snapshot(internalState) as T;
			const previousValueSnapshot = $state.snapshot(previousState);
			if (
				valueSnapshot &&
				previousValueSnapshot &&
				!isEqual(valueSnapshot, previousValueSnapshot)
			) {
				previousState = valueSnapshot;
				setter(valueSnapshot);
			}
		}
	);

	return {
		get state() {
			return internalState;
		},
		set state(newValue: T) {
			internalState = newValue;
		},
		immediateUpdate: (newValue: T) => {
			const internalStateSnapshot = $state.snapshot(internalState) as T;
			if (!isEqual(newValue, internalStateSnapshot)) {
				internalState = cloneDeep(newValue);
				previousState = cloneDeep(newValue);
				setter(cloneDeep(newValue));
			}
		}
	};
};
