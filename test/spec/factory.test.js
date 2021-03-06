var Bull = Bull || {};

BullTest.include('../src/bull.factory.js');

describe("Factory", function () {
	var factory;
	
	var loader = function () {};
	var layoter = function () {};
	var templator = function () {};
	var renderer = function () {};
	
	var viewHash = {
		viewTest: function (options) {
			return true;
		}
	};
	
	beforeEach(function () {	
	});
	
	afterEach(function () {		
	});
	
	it ('should call custom viewLoader function (if defined) and create view', function () {	
		var loader = {
			load: {}
		};
		var viewLoader = {load: {}};
		var viewClass = function (viewName, options) {	
		};
		spyOn(loader, 'load').andReturn(viewClass);
		
		spyOn(viewLoader, 'load').andReturn(viewClass);
	
		factory = new Bull.Factory({
			customLoader: loader,
			customLayouter: layouter,
			customTemplator: templator,
			customRenderer: renderer,
			viewLoader: viewLoader.load		
		});
		
		factory.create('viewTest', {}, function () {});		
		expect(viewLoader.load).toHaveBeenCalled();		
	});
});
