export const testRune = () => {
	let stateInternal = $state<{ nested: { value: string } }>({
		nested: { value: 'initial' }
	});

	const state = $derived(stateInternal);

	$inspect('Test Rune State:', state);
	$inspect('Test Rune State Internal:', stateInternal);

	return {
		get state() {
			return stateInternal;
		},
		set state(value) {
			stateInternal = value;
		}
	};
};
