import { isEqual } from 'lodash-es';
import { Previous, type Getter } from 'runed';
import { untrack } from 'svelte';

export const createWatchedState = <T>({
	getter,
	onUpdate
}: {
	getter: Getter<T>;
	onUpdate: (data: T) => void;
}) => {
	let internalState = $state<T>(getter());
	let previousState = $state<T>(getter());

	const previousStateTracker = new Previous(() => $state.snapshot(internalState));
	$inspect('Previous state tracker', previousStateTracker);

	$effect(() => {
		$state.snapshot(getter());
		untrack(() => {
			const newValue = getter();
			if (!isEqual(newValue, previousState)) {
				previousState = newValue;
				internalState = newValue;
				onUpdate(newValue);
			}
		});
	});

	$effect(() => {
		$state.snapshot(internalState);
		console.log('Internal state updated:', $state.snapshot(internalState));
		untrack(() => {
			const newValue = internalState;
			if (!isEqual(newValue, previousState)) {
				previousState = newValue;
				onUpdate(newValue);
			}
		});
	});

	return {
		current: internalState
	};
};
