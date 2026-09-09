export const prerender = true;

// Say which posts should be prerendered
export const entries = async () => {
	return [{ game: 'oxygennotincluded' }, { game: 'mindustry' }];
};
