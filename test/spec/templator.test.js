
import Templator from "../../src/bull.templator.js";

describe("Templator", () => {
	var templator;
	var layouter;
	let loader;
	
	var defaultTemplate	= 'test';
	var defaultLayout = {
		type: 'default',
		layout: {},
	}
	
	beforeEach(() => {
		loader = {
			load: {},
		};

		spyOn(loader, 'load').and.callFake(function (type, name, callback) {
			if (type === 'template') {
				callback(defaultTemplate)
			}
			if (type === 'layoutTemplate') {
				callback("<%= (typeof some !== 'undefined') ? some : '' %>");
			}
		});
		
		layouter = {
			getLayout: function () {},
		};
		spyOn(layouter, 'getLayout').and.callFake(function (name, callback) {
			callback(defaultLayout);
		});		
	
		templator = new Templator({
			loader: loader,
			layouter: layouter,
		});
		
	});
	
	it ('shoud load template if is not loaded', function () {
		templator.getTemplate('test', null, false, function () {});

		expect(loader.load.calls.first().args[0]).toBe('template');
		expect(loader.load.calls.first().args[1]).toBe('test');
	});
	
	it ('shoud not load template if loaded', function () {
		templator.addTemplate('test', defaultTemplate);
		templator.getTemplate('test', null, false, function () {});

		expect(loader.load.calls.count()).toBe(0);
	});
	
	it ('shoud not load template but load "layout template" to build template if layout is defined', function () {
		templator.getTemplate('test', {name: 'someLayout'}, false, function () {});

		expect(loader.load.calls.first().args[0]).toBe('layoutTemplate');
		expect(loader.load.calls.first().args[1]).toBe('default');
	});
	
	it ('shoud load layout (if defined) to build it', function () {
		templator.getTemplate('test', {name: 'someLayout', data: null, layout: null}, false, function () {});

		expect(layouter.getLayout.calls.first().args[0]).toBe('someLayout');
	});
	
	it ('shoud not load layout if passed', function () {
		var layout = {some: 'test'};
		templator.getTemplate('test', {name: JSON.stringify(layout), layout: layout}, false, function () {});

		expect(layouter.getLayout.calls.count()).toBe(0);
	});
	
	it ('shoud build template with injected data into layout', function () {
		spyOn(templator, '_buildTemplate').and.callThrough();

		var template;

		templator.compilable = false;
		templator.getTemplate('test', {
			name: 'someLayout',
			data: {some: 'test'},
			layout: {}
		}, false, function (t) {
			template = t;
		});

		expect(templator._buildTemplate.calls.first().args[0].some).toBe('test');
		expect(templator._buildTemplate.calls.first().args[1].some).toBe('test');
		expect(template).toBe('test');
	});	
});
