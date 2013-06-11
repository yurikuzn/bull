var Bull = Bull || {};

BullTest.include('../src/bull.loader.js');

describe("Loader", function () {
	var loader;
	
	it ('shoud override default paths and exts', function () {
		loader = new Bull.Loader({
			exts: {
				layout: 'lt',
			},
			paths: {
				layout: 'resources/layouts/',
			},
		});
		
		var file = loader._getFilePath('layout', 'test');		
		expect(file).toBe('resources/layouts/test.lt');
		var file = loader._getFilePath('template', 'test');
		expect(file).toBe('templates/test.tpl');	
	});
	
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
		loader.load('layout', 'account/detail');
		expect(layoutManager.load).toHaveBeenCalledWith('account/detail');	
	});
});
