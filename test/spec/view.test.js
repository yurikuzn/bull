var Bull = Bull || {};

describe("View", function () {
	/**
	 * @var {Bull.View}
	 */
	var view;
	var templator;
	var renderer;
	var layouter;
	var factory;

	beforeEach(() => {
		renderer = {
			render: function (template) {}
		};

		templator = {
			getTemplate: function (templateName, layoutOptions, noCache, callback) {
				callback('test');
			}
		};

		layouter = {
			findNestedViews: function (layoutName, layout) {
				return [];
			},
			getLayout: function (name, callback) {
				callback([]);
			},
		};

		factory = {
			create: function (viewName, options, callback) {
				callback(new Bull.View(options));
			}
		};

		view = new Bull.View({
			_renderer: renderer,
			_templator: templator,
			_layouter: layouter,
			_factory: factory,
		});

		view._initialize();
	});

	it ('should concat parent and relative selector', () => {
		view.setSelector('parent-selector');

		view
			.createView('test', 'test/view', {
				selector: 'child-selector',
			})
			.then(view => {
				expect(view.getSelector()).toEqual('parent-selector child-selector');
			});
	});

	it ('should set a child full selector', () => {
		view.setSelector('parent-selector');

		return view
			.createView('test', 'test/view', {
				el: 'parent-selector child-selector',
			})
			.then(view => {
				expect(view.getSelector()).toEqual('parent-selector child-selector');
			});
	});

	it ('should trigger "remove" event on remove', () => {
		var handler = jasmine.createSpy('handler');

		view.on('remove', handler)
		view.remove();

		expect(handler).toHaveBeenCalled();
	});

	it ('should call renderer.render() when render() and getHtml() are called', () => {
		spyOn(renderer, 'render');

		view.render();
		view.getHtml(function () {});

		expect(renderer.render).toHaveBeenCalled();
		expect(renderer.render.calls.count()).toEqual(2);
	});

	it ('should call renderer.render() with proper data injected', () => {
		spyOn(renderer, 'render');
		view.data = {test: 'test'};
		view.render();

		expect(renderer.render.calls.mostRecent().args[1].test).toEqual('test');
	});

	it ('should call templator.getTemplate() with a proper template and layout names when render()', () => {
		spyOn(templator, 'getTemplate');

		var view = new Bull.View({
			_renderer: renderer,
			_templator: templator,
			_layouter: layouter,
			_factory: factory,
			template: 'SomeTemplate',
			layout: 'SomeLayout',
		});

		view._initialize();

		view.render();

		expect(templator.getTemplate.calls.mostRecent().args[0]).toBe('SomeTemplate');
		expect(templator.getTemplate.calls.mostRecent().args[2]).toBe(false);
	});

	it ('should set element for view that name is not defined for', () => {
		spyOn(layouter, 'findNestedViews').and.returnValue([{
			name: 'main',
			view: true,
			id: 'main',
		}]);

		var master = new Bull.View({
			_renderer: renderer,
			_templator: templator,
			_layouter: layouter,
			_factory: factory,
			layout: 'SomeLayout',
			_layout: [],
		});

		master._initialize();

		var main = {
			setElementInAdvance: {},
			setElement: function () {},
			_updatePath: function () {},
		};

		spyOn(main, 'setElementInAdvance');

		master.setView('main', main);

		expect(main.setElementInAdvance).toHaveBeenCalled();
	});

	it ('should load nested views via layouter.findNestedViews()', () => {
		spyOn(layouter, 'findNestedViews').and.callFake(() => {
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

		spyOn(factory, 'create').and.callFake(function (name, options, callback) {
			callback({
				notToRender: false,
				_updatePath: function () {},
				_afterRender: function () {},
				options: {},
			});
		});

		var view = new Bull.View({
			_renderer: renderer,
			_templator: templator,
			_layouter: layouter,
			_factory: factory,
			layout: 'SomeLayout',
			_layout: [],
		});

		view._initialize();

		expect(factory.create.calls.first().args[1]).toEqual({
			layout: 'header',
			some: 'test',
		});
		expect(layouter.findNestedViews).toHaveBeenCalledWith('SomeLayout', [], false);
		expect(factory.create.calls.count()).toEqual(2);
		expect(view.getView('header')).toBeDefined();
		expect(view.getView('footer')).toBeDefined();
		expect(view.getView('header').notToRender).toBe(false);
		expect(view.getView('footer').notToRender).toBe(true);
	});

	it ('should pass rendered nested views into Renderer.render()', () => {
		spyOn(layouter, 'findNestedViews').and.callFake(function() {
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

		spyOn(factory, 'create').and.callFake(function(name, options, callback) {
			callback({
				getHtml: function (callback) {
					callback('viewTest');
				},
				_updatePath: function () {},
				_afterRender: function () {},
				options: {},
			});
		});

		var view = new Bull.View({
			_renderer: renderer,
			_templator: templator,
			_layouter: layouter,
			_factory: factory,
			layout: 'SomeLayout',
		});

		view._initialize();

		spyOn(renderer, 'render');
		view.render();

		expect(renderer.render.calls.mostRecent().args[0]).toBe('test');
		expect(renderer.render.calls.mostRecent().args[1].header).toBe('viewTest');

	});

	it ('should set get and check nested view', () => {
		var view = new Bull.View();
		var subView = new Bull.View();

		view._initialize();
		subView._initialize();

		view.setView('main', subView);

		expect(subView).toBe(view.getView('main'));
		expect(view.hasView('main')).toBe(true);
	});

	it ('should set parent view when set view', () => {
		var view = new Bull.View();
		var subView = new Bull.View();

		view._initialize();
		subView._initialize();

		view.setView('main', subView);

		expect(view).toBe(subView.getParentView());
	});

	it ('should clear nested view and trigger "remove" event', () => {
		var view = new Bull.View();
		var subView = new Bull.View();

		view._initialize();
		subView._initialize();

		var handler = jasmine.createSpy('handler');
		subView.on('remove', handler);

		view.setView('main', subView);
		view.clearView('main');

		expect(handler).toHaveBeenCalled();
	});

	it ('should set proper paths for nested views', () => {
		var view = new Bull.View();
		var subView = new Bull.View();
		var subSubView1 = new Bull.View();
		var subSubView2 = new Bull.View();

		view._initialize();
		subView._initialize();
		subSubView2._initialize();
		subSubView2._initialize();

		view.setView('main', subView);
		subView.setView('some1', subSubView1);
		subView.setView('some2', subSubView2);

		expect(subView._path).toBe('/main');
		expect(subSubView1._path).toBe('/main/some1');
		expect(subSubView2._path).toBe('/main/some2');

		view = new Bull.View();

		view._initialize();

		view._path = 'master';

		view.setView('metan', subView);
		expect(subSubView1._path).toBe('master/metan/some1');
		expect(subSubView2._path).toBe('master/metan/some2');
	});
});
