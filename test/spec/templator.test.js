var Bull = Bull || {};

BullTest.include('../src/bull.templator.js');

describe("Templator", function () {
	var templator;
	var cacher;
	var layouter;
	
	var defaultTemplate	= 'test';
	var defaultLayout = {
		type: 'default',
		layout: {},
	}
	
	beforeEach(function () {
		cacher = {
			get: function () {
				return false;
			},
			set: function () {},
		};		
		spyOn(cacher, 'get').andReturn(null);
		spyOn(cacher, 'set');
		
		loader = {
			load: {},
		};		
		spyOn(loader, 'load').andCallFake(function (type) {
			if (type == 'template') {
				return defaultTemplate
			}
			if (type == 'layoutTemplate') {
				return "<%= (typeof some !== 'undefined') ? some : '' %>";
			}
		});
		
		layouter = {
			getLayout: function () {},
		};
		spyOn(layouter, 'getLayout').andReturn(defaultLayout);
		
	
		templator = new Bull.Templator({
			cacher: cacher,
			loader: loader,
			layouter: layouter,
		});
		
	});
	
	it ('shoud get template from cache', function () {
		templator.getTemplate('test');		
		expect(cacher.get).toHaveBeenCalledWith('template', 'test');
	});
	
	it ('shoud store template to cache', function () {
		templator.compilable = false;
		templator.getTemplate('test');		
		expect(cacher.set).toHaveBeenCalledWith('template', 'test', defaultTemplate);
	});
	
	it ('shoud load template if is not loaded', function () {
		templator.getTemplate('test');
		expect(loader.load).toHaveBeenCalledWith('template', 'test');	
	});
	
	it ('shoud not load template if loaded', function () {
		templator.addTemplate('test', defaultTemplate);
		templator.getTemplate('test');
		expect(loader.load.calls.length).toBe(0);
	});
	
	it ('shoud not load template but load "layout template" to build template if layout is defined', function () {
		templator.getTemplate('test', {name: 'someLayout'});		
		expect(loader.load).toHaveBeenCalledWith('layoutTemplate', 'default');
	});
	
	it ('shoud load layout (if defined) to build it', function () {
		templator.getTemplate('test', {name: 'someLayout', data: null, layout: null});
		expect(layouter.getLayout).toHaveBeenCalledWith('someLayout');
	});
	
	it ('shoud not load layout if passed', function () {
		var layout = {some: 'test'};
		templator.getTemplate('test', {name: JSON.stringify(layout), layout: layout});
		expect(layouter.getLayout.calls.length).toBe(0);
	});
	
	it ('shoud build template with injected data into layout', function () {
		spyOn(templator, '_buildTemplate').andCallThrough();
		templator.compilable = false;		
		var template = templator.getTemplate('test', {
			name: 'someLayout',
			data: {some: 'test'},
			layout: {}
		}, false);
		expect(templator._buildTemplate).toHaveBeenCalledWith({some: 'test'}, {some: 'test'});		
		expect(template).toBe('test');
	});	
	
	it ('shoud try to load "layout template" from cache when building template', function () {
		var template = templator.getTemplate('test', {name: 'someLayout'});
		expect(cacher.get).toHaveBeenCalledWith('layoutTemplate', 'default');
	});
});
