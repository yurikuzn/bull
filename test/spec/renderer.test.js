var Bull = Bull || {};

BullTest.include('../src/bull.renderer.js');

describe("Renderer", function () {
	var renderer;
	
	beforeEach(function () {
		renderer = new Bull.Renderer();
	});
	
	it ('should be able to override render method', function () {
		renderer = new Bull.Renderer({
			method: function (template, data) {
				return template + ':' + data;
			}
		});
		
		var html = renderer.render('doomy','test');

		expect(html).toBe('doomy:test');
	});
});
