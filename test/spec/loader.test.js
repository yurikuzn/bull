
import Loader from "../../src/bull.loader.js";

describe("Loader", () => {
	let loader;

	it('should call external loader if injected', () => {
		let layoutManager = {
			load: () => {}
		};

		spyOn(layoutManager, 'load');
	
		loader = new Loader({
			loaders: {
				layout: layoutManager.load
			}
		});

		loader.load('layout', 'account.detail', () => {});

		expect(layoutManager.load.calls.first().args[0]).toBe('account.detail');
	});
});
