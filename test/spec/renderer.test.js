
import Renderer from "../../src/bull.renderer.js";

describe("Renderer", () => {
	var renderer;
	
	beforeEach(() => {
		renderer = new Renderer();
	});
	
	it('should be able to override render method', () => {
		renderer = new Renderer({
			method: (template, data) => template + ':' + data
		});

		var html = renderer.render('doomy','test');

		expect(html).toBe('doomy:test');
	});
});
