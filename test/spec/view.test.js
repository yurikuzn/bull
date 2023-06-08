var Bull = Bull || {};

describe("View", function () {
	/**
	 * @var {Bull.View}
	 */
	let view;
	let templator;
	let renderer;
	let layouter;
	let factory;

	beforeEach(() => {
		renderer = {
			render: function (template, data) {
				return template(data, {allowProtoPropertiesByDefault: true});
			}
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

		view = new Bull.View();

		view._initialize({
			renderer: renderer,
			templator: templator,
			layouter: layouter,
			factory: factory,
		});
	});

	it ('should assign view with child selector', () => {
		view.setSelector('parent-selector');

		let childView = new Bull.View();

		return view
			.assignView('test', childView, 'child-selector')
			.then(childView => {
				expect(childView.getSelector()).toEqual('parent-selector child-selector');

				expect(childView).toEqual(view.getView('test'));
			});
	});

	it ('should assign view with selector pre-set', () => {
		view.setSelector('parent-selector');

		let childView = new Bull.View();
		childView.setSelector('parent-selector child-selector');

		return view
			.assignView('test', childView)
			.then(childView => {
				expect(childView.getSelector()).toEqual('parent-selector child-selector');
			});
	});

	it ('should concat parent and relative selector', () => {
		view.setSelector('parent-selector');

		return view
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
		let handler = jasmine.createSpy('handler');

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

		let view = new Bull.View({
			template: 'SomeTemplate',
			layout: 'SomeLayout',
		});

		view._initialize({
			renderer: renderer,
			templator: templator,
			layouter: layouter,
			factory: factory,
		});

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

		let master = new Bull.View({
			layout: 'SomeLayout',
			_layout: [],
		});

		master._initialize({
			renderer: renderer,
			templator: templator,
			layouter: layouter,
			factory: factory,
		});

		let main = {
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

		let view = new Bull.View({
			layout: 'SomeLayout',
			_layout: [],
		});

		view._initialize({
			renderer: renderer,
			templator: templator,
			layouter: layouter,
			factory: factory,
		});

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

		let view = new Bull.View({
			layout: 'SomeLayout',
		});

		view._initialize({
			renderer: renderer,
			templator: templator,
			layouter: layouter,
			factory: factory,
		});

		spyOn(renderer, 'render');
		view.render();

		expect(renderer.render.calls.mostRecent().args[0]).toBe('test');
		expect(renderer.render.calls.mostRecent().args[1].header).toBe('viewTest');

	});

	it ('should set get and check nested view', () => {
		let view = new Bull.View();
		let subView = new Bull.View();

		view._initialize({});
		subView._initialize({});

		view.setView('main', subView);

		expect(subView).toBe(view.getView('main'));
		expect(view.hasView('main')).toBe(true);
	});

	it ('should set parent view when set view', () => {
		let view = new Bull.View();
		let subView = new Bull.View();

		view._initialize({});
		subView._initialize({});

		view.setView('main', subView);

		expect(view).toBe(subView.getParentView());
	});

	it ('should clear nested view and trigger "remove" event', () => {
		let view = new Bull.View();
		let subView = new Bull.View();

		view._initialize({});
		subView._initialize({});

		let handler = jasmine.createSpy('handler');
		subView.on('remove', handler);

		view.setView('main', subView);
		view.clearView('main');

		expect(handler).toHaveBeenCalled();
	});

	it ('should set proper paths for nested views', () => {
		let view = new Bull.View();
		let subView = new Bull.View();
		let subSubView1 = new Bull.View();
		let subSubView2 = new Bull.View();

		view._initialize({});
		subView._initialize({});
		subSubView2._initialize({});
		subSubView2._initialize({});

		view.setView('main', subView);
		subView.setView('some1', subSubView1);
		subView.setView('some2', subSubView2);

		expect(subView._path).toBe('/main');
		expect(subSubView1._path).toBe('/main/some1');
		expect(subSubView2._path).toBe('/main/some2');

		view = new Bull.View();

		view._initialize({});

		view._path = 'master';

		view.setView('methane', subView);
		expect(subSubView1._path).toBe('master/methane/some1');
		expect(subSubView2._path).toBe('master/methane/some2');
	});

	it ('should be extendable using native classes', () => {
		let View = class extends Bull.View {
			test3 = 3;

			constructor(options) {
				options.test2 = 2;

				super(options);

				this.test4 = 4;
			}
		};

		let view = new View({test1: 1});

		expect(view.options.test1).toBe(1);
		expect(view.options.test2).toBe(2);
		expect(view.test3).toBe(3);
		expect(view.test4).toBe(4);
	});

	it ('should be extendable using legacy extend', () => {
		let View1 = Bull.View.extend({
			test2: 2,
			test3: 3,
		});

		let view1 = new View1({test1: 1});

		expect(view1.options.test1).toBe(1);
		expect(view1.test2).toBe(2);

		let View2 = View1.extend({
			test3: -3,
			test4: 4,
		});

		let view2 = new View2({test1: -1});

		expect(view2.options.test1).toBe(-1);
		expect(view2.test2).toBe(2);
		expect(view2.test3).toBe(-3);
		expect(view2.test4).toBe(4);
	});

	it ('should be extendable using both legacy and native classes', () => {
		let View1 = class extends Bull.View {
			test3 = 3;
			testE = 'B';

			constructor(options) {
				options.test2 = 2;

				super(options);

				this.test4 = 4;
			}

			hello1() {
				return 1;
			}

			helloE() {
				return 'B';
			}

			getTestE() {
				return this.testE;
			}
		}

		let View2 = View1.extend({
			test5: 5,
			testE: 'E',

			hello2: function () {
				return 2;
			},

			helloE() {
				return 'E';
			}
		});

		let view = new View2({test1: 1});

		expect(view.options.test1).toBe(1);
		expect(view.options.test2).toBe(2);
		expect(view.test3).toBe(3);
		expect(view.test4).toBe(4);
		expect(view.test5).toBe(5);
		expect(view.testE).toBe('E');
		expect(view.hello1()).toBe(1);
		expect(view.hello2()).toBe(2);
		expect(view.helloE()).toBe('E');
		expect(view.getTestE()).toBe('E');

		let View3 = View2.extend({
			test6: 6,

			hello3: function () {
				return 3;
			},
		});

		let view3 = new View3({test1: -1});

		expect(view3.options.test1).toBe(-1);
		expect(view3.options.test2).toBe(2);
		expect(view3.hello1()).toBe(1);
		expect(view3.hello2()).toBe(2);
		expect(view3.test4).toBe(4);
		expect(view3.test5).toBe(5);
		expect(view3.test6).toBe(6);
		expect(view3.hello3()).toBe(3);

		let View4 = View3.extend({
			test6: -6,
			test7: 7,
		});

		let view4 = new View4({});

		expect(view4.test6).toBe(-6);
		expect(view4.test7).toBe(7);
		expect(view4.test4).toBe(4);
	});

	it ('extend should work on native classes', () => {
		class Test {
			test1 = 1;
			testE = 'B';

			constructor() {
				this.test2 = 2;
			}

			hello1() {
				return 1;
			}

			helloE() {
				return 'B';
			}

			getTestE() {
				return this.testE;
			}
		}

		Test.extend = Bull.View.extend;

		const T1 = Test.extend({
			test3: 3,
			testE: 'E',

			hello2: function () {
				return 2;
			},

			helloE() {
				return 'E';
			}
		});

		let t1 = new T1();

		expect(t1.test1).toBe(1);
		expect(t1.test2).toBe(2);
		expect(t1.test3).toBe(3);
		expect(t1.testE).toBe('E');
		expect(t1.hello2()).toBe(2);
		expect(t1.helloE()).toBe('E');
		expect(t1.getTestE()).toBe('E');
	});

	it ('should use pre-compiled template', () => {
		let View = class extends Bull.View {
			template = 'test/template';

			data = function () {
				return {
					test: 'hello'
				};
			};
		}

		let view = new View({});

		view._initialize({
			renderer: renderer,
			preCompiledTemplates: {
				'test/template': Handlebars.compile(
					'{{test}} test'
				),
			},
		});

		return new Promise(resolve => {
			view.getHtml(html => {
				expect(html).toBe('hello test');

				resolve();
			});
		});
	});
});
