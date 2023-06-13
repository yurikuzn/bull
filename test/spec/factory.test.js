
import Factory from '../../src/bull.factory.js';

describe("Factory", function () {
	let factory;

	//let loader = function () {};
	let layouter = function () {};
	let templator = function () {};
	let renderer = function () {};

	/*let viewHash = {
		viewTest: function (options) {
			return true;
		}
	};*/
	
	beforeEach(() => {	});
	
	afterEach(() => {});
	
	it ('should call custom viewLoader function (if defined) and create view', function () {
		let loader = {
			load: {}
		};

		let viewLoader = {load: {}};

		let viewClass = function (viewName, options) {};

		spyOn(loader, 'load').and.returnValue(viewClass);
		
		spyOn(viewLoader, 'load').and.returnValue(viewClass);
	
		factory = new Factory({
			customLoader: loader,
			customLayouter: layouter,
			customTemplator: templator,
			customRenderer: renderer,
			viewLoader: viewLoader.load,
		});
		
		factory.create('viewTest', {}, function () {});		
		expect(viewLoader.load).toHaveBeenCalled();		
	});
});
