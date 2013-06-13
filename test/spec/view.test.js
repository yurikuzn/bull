

var Bull = Bull || {};

BullTest.include('../src/bull.view.js');

describe("View", function () {
	var view, templator, renderer;
	
	beforeEach(function () {	
		renderer = {
			render: function (template) {}
		};			
		templator = {
			getTemplate: function (templateName, layoutOptions) {}
		};		
		layouter = {
			findNestedViews: function (layoutName) {
				return [];
			}
		};
		factory = {
			create: function (viewName, options) {
				return {
				};
			},
		};
	
		view = new Bull.View({
			renderer: renderer,
			templator: templator,
			layouter: layouter,
			factory: factory,
		});
	});
	
	it ('should trigger "remove" event on remove', function () {	
		var handler = jasmine.createSpy('handler');	
		view.on('remove', handler)
		view.remove();
		expect(handler).toHaveBeenCalled();	
	});	
	
	it ('should call renderer.render() when render() and getHtml() are called', function () {
		spyOn(renderer, 'render');
		
		view.render();
		view.getHtml();
		
		expect(renderer.render).toHaveBeenCalled();		
		expect(renderer.render.calls.length).toEqual(2);
	});
	
	it ('should call renderer.render() with proper data injected', function () {
		spyOn(renderer, 'render');
		view.data = {test: 'test'};
		view.render();		
		expect(renderer.render.mostRecentCall.args[1]).toEqual({test: 'test'});
	});	
	
	it ('should call templator.getTemplate() with a proper template and layout names when render()', function () {		
		spyOn(templator, 'getTemplate');
		var view = new Bull.View({
			renderer: renderer,
			templator: templator,
			layouter: layouter,
			factory: factory,
			template: 'SomeTemplate',
			layout: 'SomeLayout',
		});		
		view.render();		
		expect(templator.getTemplate).toHaveBeenCalledWith('SomeTemplate', {} , false);
	});
	
	it ('should set element for view that name is not defined for', function () {
		spyOn(layouter, 'findNestedViews').andReturn([{
			name: 'main',
			view: true,
			id: 'main',
		}]);
		
		var master = new Bull.View({
			renderer: renderer,
			templator: templator,
			layouter: layouter,
			factory: factory,
			layout: 'SomeLayout',
		});
		
		var main = {
			setElementInAdvance: {},
			setElement: function () {},
			_updatePath: function () {},
		};
		spyOn(main, 'setElementInAdvance');
		master.setView('main', main);
		expect(main.setElementInAdvance).toHaveBeenCalled();
	});
	
	it ('should load nested views via layouter.findNestedViews()', function () {
		spyOn(layouter, 'findNestedViews').andCallFake(function() {	
			return [
				{
					name: 'header',
					layout: 'header',
					options: {
						some: 'test',
					},
				},
				{
					name: 'main',
					view: true,
				},
				{
					name: 'footer',
					view: 'Footer',
					notToRender: true,
				},
			];
		});
		
		spyOn(factory, 'create').andCallFake(function() {
			return {
				notToRender: false,
				_updatePath: function () {},
				_afterRender: function () {},
			};
		});
		
		var view = new Bull.View({
			renderer: renderer,
			templator: templator,
			layouter: layouter,
			factory: factory,
			layout: 'SomeLayout',
		});
		
		expect(factory.create.calls[0].args[1]).toEqual({
			layout: 'header',
			some: 'test',
		});
		expect(layouter.findNestedViews).toHaveBeenCalledWith('SomeLayout', null, false);
		expect(factory.create.calls.length).toEqual(2);		
		expect(view.header).toBeDefined();
		expect(view.footer).toBeDefined();
		expect(view.header.notToRender).toBe(false);
		expect(view.footer.notToRender).toBe(true);
	});
	
	it ('should pass rendered nested views into Renderer.render()', function () {
		spyOn(layouter, 'findNestedViews').andCallFake(function() {	
			return [
				{
					name: 'header',
					layout: 'header',
				},
				{
					name: 'footer',
					view: 'Footer',
					notToRender: true,
				},
			];
		});
		
		spyOn(factory, 'create').andCallFake(function() {
			return {
				getHtml: function () {
					return 'viewTest';
				},
				_updatePath: function () {},
				_afterRender: function () {},
			};
		});
		
		spyOn(templator, 'getTemplate').andReturn('testTemplate');
		
		var view = new Bull.View({
			renderer: renderer,
			templator: templator,
			layouter: layouter,
			factory: factory,
			layout: 'SomeLayout',
		});
		
		spyOn(renderer, 'render');		
		view.render();		
				
		expect(renderer.render).toHaveBeenCalledWith('testTemplate', {header: 'viewTest'});		
	});
	
	it ('should set and get nested view', function () {
		var view = new Bull.View();
		var subView = new Bull.View();
		view.setView('main', subView);
		
		expect(subView).toBe(view.getView('main'));
		expect(subView).toBe(view.main);
	});
	
	it ('should set parent view when set view', function () {
		var view = new Bull.View();
		var subView = new Bull.View();
		view.setView('main', subView);
		
		expect(view).toBe(subView.getParentView());
	});
	
	it ('should clear nested view and trigger "remove" event', function () {
		var view = new Bull.View();
		var subView = new Bull.View();
		
		var handler = jasmine.createSpy('handler');	
		subView.on('remove', handler);
		
		view.setView('main', subView);
		view.clearView('main');
		
		expect(handler).toHaveBeenCalled();	
	});
	
	it ('should set proper paths for nested views', function () {
		var view = new Bull.View();
		var subView = new Bull.View();
		var subSubView1 = new Bull.View();
		var subSubView2 = new Bull.View();
		
		view.setView('main', subView);
		subView.setView('some1', subSubView1);
		subView.setView('some2', subSubView2);
		
		expect(subView._path).toBe('root/main');
		expect(subSubView1._path).toBe('root/main/some1');
		expect(subSubView2._path).toBe('root/main/some2');
		
		var view = new Bull.View();
		view._path = 'master';
		
		view.setView('metan', subView);
		expect(subSubView1._path).toBe('master/metan/some1');
		expect(subSubView2._path).toBe('master/metan/some2');				
	});	
	
});
