var Bull = Bull || {};

BullTest.include('../src/bull.loader.js');

describe("Loader", function () {
	var loader;
	

	it ('shoud call external loader if injected', function () {	
		var layoutManager = {
			load: function () {			
			}
		};
		spyOn(layoutManager, 'load');
	
		loader = new Bull.Loader({
			loaders: {
				layout: layoutManager.load
			}
		});		
		loader.load('layout', 'account.detail', function () {});
		expect(layoutManager.load.calls[0].args[0]).toBe('account.detail');	
	});
});
