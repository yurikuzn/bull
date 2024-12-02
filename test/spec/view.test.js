
import View from '../../src/bull.view.js';
import BullView from "../../src/bull.view.js";
import {h, fragment} from 'snabbdom';

describe('View', function () {
	/**
	 * @var {Bull.View}
	 */
	let view;
	let templator;
	let renderer;
	let layouter;
	let factory;
    let viewData;

	beforeEach(() => {
		renderer = {
			render: (template, data) => template(data, {allowProtoPropertiesByDefault: true})
        };

		templator = {
			getTemplate: (templateName, layoutOptions, callback) => {
				callback('test');
			}
        };

		layouter = {
			findNestedViews: () => [],
		};

		factory = {
			create: (viewName, options, callback) => {
				callback(new View(options));
			}
        };

		view = new View();

		view._initialize({
			renderer: renderer,
			templator: templator,
			layouter: layouter,
			factory: factory,
		});

        viewData = {
            templator:  {
                compileTemplate: template => {
                    return Handlebars.compile(template);
                },
                compilable: true,
            },
            renderer: renderer,
            factory: factory,
            layouter: layouter,
        };
	});

	it ('should assign view with child selector', () => {
		view.setSelector('parent-selector');

		let childView = new View();

		return view
			.assignView('test', childView, 'child-selector')
			.then(childView => {
				expect(childView.getSelector()).toEqual('parent-selector child-selector');

				expect(childView).toEqual(view.getView('test'));
			});
	});

	it ('should assign view with selector pre-set', () => {
		view.setSelector('parent-selector');

		const childView = new View();
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
				fullSelector: 'parent-selector child-selector',
			})
			.then(view => {
				expect(view.getSelector()).toEqual('parent-selector child-selector');
			});
	});

    it ('should set a child full selector legacy', () => {
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
		const handler = jasmine.createSpy('handler');

		view.on('remove', handler)
		view.remove();

		expect(handler).toHaveBeenCalled();
	});

	it ('should call renderer.render() when render() and getHtml() are called', () => {
		spyOn(renderer, 'render');

		view.render();
		view._getPreparedElement(function () {});

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

		let view = new View({
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
	});

	it ('should set element for view that name is not defined for', () => {
		spyOn(layouter, 'findNestedViews').and.returnValue([{
			name: 'main',
			view: true,
			id: 'main',
		}]);

		let master = new View({
			layout: 'SomeLayout',
            layoutDefs: [],
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
					template: 'header',
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
                {
                    name: 'instance',
                    view: new BullView({}),
                    selector: '.instance',
                }
			];
		});

		spyOn(factory, 'create').and.callFake((name, options, callback) => {
            let view = new BullView({
                notToRender: false,
            });

            callback(view);
		});

        let layoutDefs = {
            type: 'test',
            layout: [],
        };

		let view = new View({
			layoutDefs: layoutDefs,
            fullSelector: 'test',
		});

        return new Promise(resolve => {
            view._initialize({
                renderer: renderer,
                templator: templator,
                layouter: layouter,
                factory: factory,
                onReady: () => {
                    expect(view.getView('instance')).toBeDefined();
                    expect(view.getView('instance').getSelector()).toBe('test .instance');

                    resolve();
                },
            });

            expect(factory.create.calls.first().args[1]).toEqual({
                template: 'header',
                some: 'test',
            });

            expect(layouter.findNestedViews).toHaveBeenCalledWith(layoutDefs);
            expect(factory.create.calls.count()).toEqual(2);
            expect(view.getView('header')).toBeDefined();
            expect(view.getView('footer')).toBeDefined();
            expect(view.getView('header').notToRender).toBe(false);
            expect(view.getView('footer').notToRender).toBe(true);
        })
	});

	it ('should pass rendered nested views into Renderer.render()', () => {
		spyOn(layouter, 'findNestedViews').and.callFake(() => [
            {
                name: 'header',
                layout: 'header',
            },
            {
                name: 'footer',
                view: 'Footer',
                notToRender: true,
            },
        ]);

		spyOn(factory, 'create').and.callFake((name, options, callback) => {
			callback({
                _getPreparedElement: callback => {
					callback('viewTest');
				},
				_updatePath: () => {},
				_afterRender: () => {},
				options: {},
                getSelector: () => '',
			});
		});
	});

	it ('should set get and check nested view', () => {
		let view = new View();
		let subView = new View();

		view._initialize({});
		subView._initialize({});

		view.setView('main', subView);

		expect(subView).toBe(view.getView('main'));
		expect(view.hasView('main')).toBe(true);
	});

	it ('should set parent view when set view', () => {
		let view = new View();
		let subView = new View();

		view._initialize({});
		subView._initialize({});

		view.setView('main', subView);

		expect(view).toBe(subView.getParentView());
	});

	it ('should clear nested view and trigger "remove" event', () => {
		let view = new View();
		let subView = new View();

		view._initialize({});
		subView._initialize({});

		let handler = jasmine.createSpy('handler');
		subView.on('remove', handler);

		view.setView('main', subView);
		view.clearView('main');

		expect(handler).toHaveBeenCalled();
	});

	it ('should set proper paths for nested views', () => {
		let view = new View();
		let subView = new View();
		let subSubView1 = new View();
		let subSubView2 = new View();

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

		view = new View();

		view._initialize({});

		view._path = 'master';

		view.setView('methane', subView);
		expect(subSubView1._path).toBe('master/methane/some1');
		expect(subSubView2._path).toBe('master/methane/some2');
	});

	it ('should be extendable using native classes', () => {
		let ViewB = class extends View {
			test3 = 3;

			constructor(options) {
				options.test2 = 2;

				super(options);

				this.test4 = 4;
			}
		};

		let view = new ViewB({test1: 1});

		expect(view.options.test1).toBe(1);
		expect(view.options.test2).toBe(2);
		expect(view.test3).toBe(3);
		expect(view.test4).toBe(4);
	});

	it ('should be extendable using legacy extend', () => {
		let View1 = View.extend({
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
		let View1 = class extends View {
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

	it ('extend should extend native classes', () => {
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

		Test.extend = View.extend;

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

	it ('should extend multiple native classes', () => {
		class Test extends View {}

		class Test1 extends Test {
			helloE() {
				return 'B';
			}

			getTemplateTest() {
				return this.template;
			}
		}

		class Test2 extends Test1 {
			template = 'test'
		}

		const Test3 = Test2.extend({
			helloE() {
				return 'E';
			}
		});

		let t1 = new Test3();

		expect(t1.template).toBe('test');
		expect(t1.getTemplateTest()).toBe('test');
		expect(t1.helloE()).toBe('E');
	});

	it ('should use pre-compiled template', () => {
		const ViewB = class extends View {
			template = 'test/template';

			data = function () {
				return {
					test: 'hello'
				};
			};
		}

		const view = new ViewB({});

		view._initialize({
			renderer: renderer,
			preCompiledTemplates: {
				'test/template': Handlebars.compile(
					'{{test}} test'
				),
			},
		});

		return new Promise(resolve => {
			view._getPreparedElement(element => {
				expect(element.content.childNodes[0].textContent).toBe('hello test');

				resolve();
			});
		});
	});

	it ('should support events 1', () => {
		let view1 = new View();
		let view2 = new View();

		return new Promise((resolve, reject) => {
			view1.listenTo(view2, 'test1', () => {
				expect(true).toBe(true);

				resolve();
			});

			view1.listenTo(view2, 'test2', () => {
				reject();
			});

			view1.stopListening(view2, 'test2');

			view2.trigger('test2');
			view2.trigger('test1');
		})
	});

	it ('should support events 2', () => {
		let view1 = new View();

		return new Promise((resolve, reject) => {
			view1.on('test1', () => {
				expect(true).toBe(true);

				resolve();
			});

			view1.on('test2', () => {
				reject();
			});

			view1.off('test2');

			view1.trigger('test2');
			view1.trigger('test1');
		})
	});

	it ('should support events 3', () => {
		let view1 = new View();
		let view2 = new View();

		return new Promise((resolve, reject) => {
			view1.listenToOnce(view2, 'test1', (a1, a2) => {
                expect(a1).toBe(1);
                expect(a2).toBe(2);

				resolve();
			});

			view1.listenToOnce(view2, 'test2', () => {
				reject();
			});

			view1.stopListening(view2, 'test2');

			view2.trigger('test2');
			view2.trigger('test1', 1, 2);
		})
	});

	it ('should support events 4', () => {
		let view1 = new View();

		return new Promise((resolve, reject) => {
			view1.once('test1', () => {
				expect(true).toBe(true);

				resolve();
			});

			view1.once('test2', () => {
				reject();
			});

			view1.off('test2');

			view1.trigger('test2');
			view1.trigger('test1');
		})
	});

    it ('should process added handlers', () => {
       class TestView extends View {

           templateContent = `<a data-action="test"></a>`

           setup() {
               this.addHandler('mousedown', '[data-action="test"]', 'doTest');
               this.addHandler('click', '[data-action="test"]', e => {
                   this.clickedEvent = e;
               });
           }

           doTest(event) {
               this.event = event;
           }
       }

       const view = new TestView({
            fullSelector: '#test-div',
       });

       view._initialize({
           templator: {},
           renderer: {
               render(template) {
                   return template;
               },
           },
       });

       return new Promise(resolve => {
           const $div = $('<div id="test-div">');

           $('body').append($div);

           view.render()
               .then(() => {
                   const link = view.element.querySelectorAll('[data-action="test"]')[0]

                   link.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
                   link.dispatchEvent(new MouseEvent('click', {bubbles: true}));

                   $div.remove()

                   expect(view.clickedEvent.target.tagName).toBe('A');
                   expect(view.event.target.tagName).toBe('A');

                   resolve();
               });
       });
    });


    it ('should render component', () => {
        const $div = $('<div id="test-root">');

        $('body').append($div);

        class Component extends View {
            isComponent = true
            templateContent = `<button>test</button>`
        }

        class ComponentHello extends View {
            isComponent = true
            notToRender = true

            templateContent = `<a>hello</a>`
        }

        class ComponentN1 extends View {
            isComponent = true
            templateContent = `<div class="n2">{{{n2}}}</div>`

            setup() {
                this.assignView('n2', new ComponentN2());
            }
        }

        class ComponentN2 extends View {
            isComponent = true
            templateContent = `<div>n2</div>`
        }

        class RootView extends View {
            templateContent = `<div>{{{test}}} {{{hello}}} {{{n1}}}</div>`

            setup() {
                this.assignView('test', new Component());
                this.assignView('hello', new ComponentHello());
                this.assignView('n1', new ComponentN1());
            }
        }

        const rootView = new RootView({
            fullSelector: '#test-root',
        });
        rootView._initialize(viewData);

        return new Promise(resolve => {
            rootView.render()
                .then(() => {
                    expect($('#test-root div button').text()).toBe('test');

                    const component = rootView.getView('test');
                    const componentHello = rootView.getView('hello');

                    const $hello = $(`#test-root div template[data-view-cid="${componentHello.cid}"]`);

                    expect($hello.text()).toBe('');
                    expect($hello.length).toBe(1);

                    expect(
                        $(`#test-root div div.n2 div`).text()
                    ).toBe('n2');

                    component
                        .reRender()
                        .then(() => {
                            expect($('#test-root div button').text()).toBe('test');

                            // noinspection JSJQueryEfficiency
                            expect(
                                $(`#test-root div button[data-view-cid="${component.cid}"]`).text()
                            ).toBe('test');

                            rootView.clearView('test');

                            // noinspection JSJQueryEfficiency
                            expect(
                                $(`#test-root div button[data-view-cid="${component.cid}"]`).length
                            ).toBe(0);

                            expect(
                                $(`#test-root div template[data-view-cid="${component.cid}"]`).length
                            ).toBe(1);

                            componentHello.render()
                                .then(() => {
                                    expect(
                                        $(`#test-root div a[data-view-cid="${componentHello.cid}"]`).text()
                                    ).toBe('hello');

                                    resolve();

                                    $div.remove();
                                });
                        });
                });
        });
    });

    it ('getViewKey should return a view key', () => {
        view.setSelector('parent-selector');

        return view
            .createView('test', 'test/view', {})
            .then(childView => {
                expect(view.getViewKey(childView)).toEqual('test');
            });
    });

    it ('should re-render', async () => {
        let $div = $('<div id="test-root">');
        $('body').append($div);

        class TestView extends View {
            templateContent = `<div class="sub">{{{sub}}}</div>`
        }

        class SubView extends View {
            templateContent = `<span class="one">1</span>`
        }

        const view = new TestView({fullSelector: '#test-root'});
        view._initialize(viewData);

        const subView = new SubView();

        await view.assignView('sub', subView, '.sub');

        await view.reRender(true);

        expect(view.element.querySelector('.sub').textContent).toEqual('1');

        await view.reRender();

        expect(view.element.querySelector('.sub').textContent).toEqual('1');

        const one = view.element.querySelector('.one');

        const viewToCheck = await view.reRender({keep: ['sub']});

        expect(viewToCheck).toBe(view);
        expect(view.element.querySelector('.sub').textContent).toEqual('1');

        expect(view.element.querySelector('.one')).toBe(one);

        $div.remove();
    });

    it ('should prepare render', async () => {
        const $div = $('<div id="test-root">');
        $('body').append($div);

        class TestView extends View {
            templateContent = `<div class="sub">{{{sub}}}</div>`

            async prepareRender() {
                const subView = new SubView();

                const promise = new Promise(resolve => {
                    setTimeout(() => resolve(), 1);
                });

                return Promise.all([
                    promise,
                    this.assignView('sub', subView, '.sub'),
                ]);
            }
        }

        class SubView extends View {
            templateContent = `1`
        }

        const testView = new TestView({
            fullSelector: '#test-root',
        });

        testView._initialize(viewData);

        await testView.render();

        expect(testView.element.querySelector('.sub').textContent).toEqual('1');

        $div.remove();
    });

    it ('should render table', async () => {
        const $div = $('<div id="test-root">');
        $('body').append($div);

        class RowView extends View {
            templateContent = `
                <td>1</td><td>2</td>
            `
        }

        class TableView extends View {
            templateContent = `
                <table>
                    <tbody>
                        <tr>{{{row}}}</tr>
                    </tbody>
                </table>
            `

            setup() {
                const rowView = new RowView();

                this.assignView('row', rowView);
            }
        }

        const tableView = new TableView({
            fullSelector: '#test-root',
        });

        tableView._initialize(viewData);

        await tableView.render();

        const rowCid = tableView.getView('row').cid;

        const row = tableView.element.querySelector(`tr[data-view-cid="${rowCid}"]`);

        expect(row).toBeTruthy();

        expect(tableView.getView('row').getSelector()).toBe(`#test-root [data-view-cid="${rowCid}"]`);

        $div.remove();
    });

    it ('should set cid for containers', async () => {
        class Child1View extends View {
            templateContent = `<div>1</div>`
        }

        class Child2View extends View {
            templateContent = `<div>2</div>`

            isComponent = true
        }

        class ParentView extends View {
            templateContent = `
                <div>{{{child1}}}</div>
                {{{child2}}}
            `

            setup() {
                this.assignView('child1', new Child1View({}));
                this.assignView('child2', new Child2View({}));
            }
        }

        const parent = new ParentView();

        parent._initialize(viewData);

        await parent.render();

        /** @type {HTMLTemplateElement} */
        const template = await (new Promise(resolve => {
            parent._getPreparedElement(template => resolve(template));
        }));

        const child1 = parent.getView('child1');
        const child2 = parent.getView('child2');

        expect(template.content.querySelector(`[data-view-cid="${child1.cid}"]`)).toBeTruthy();
        expect(template.content.querySelector(`[data-view-cid="${child2.cid}"]`)).toBeTruthy();
    });

    it ('should set cid for not rendered containers', async () => {
        class Child1View extends View {
            templateContent = `<div>1</div>`
        }

        class Child2View extends View {
            templateContent = `<div>2</div>`

            isComponent = true
        }

        class ParentView extends View {
            templateContent = `
                <div>{{{child1}}}</div>
                {{{child2}}}
            `

            setup() {
                this.assignView('child1', new Child1View({notToRender: true}));
                this.assignView('child2', new Child2View({notToRender: true}));
            }
        }

        const parent = new ParentView();

        parent._initialize(viewData);

        const template = await (new Promise(resolve => {
            parent._getPreparedElement(template => resolve(template));
        }));

        const child1 = parent.getView('child1');
        const child2 = parent.getView('child2');

        expect(template.content.querySelector(`[data-view-cid="${child1.cid}"]`)).toBeTruthy();
        expect(template.content.querySelector(`[data-view-cid="${child2.cid}"]`)).toBeTruthy();
    });

    it('should patch fragment', async () => {
        const container = document.createElement('div');
        container.id = 'test-root'

        document.body.append(container);

        class ChildView3 extends View {
            useVirtualDom = true

            value = 'c3'

            content() {
                return fragment([
                    h('div', {}, this.value),
                ]);
            }
        }

        class ChildView4 extends View {
            useVirtualDom = true

            value = 'c4'

            content() {
                return h('div#span-4', {}, this.value);
            }
        }

        class ChildView5 extends View {
            value = 'c5'

            templateContent = `<div>{{viewObject.value}}</div>`
        }

        class ChildView6 extends View {
            isComponent = true

            value = 'c6'

            templateContent = `<div id="span-6">{{viewObject.value}}</div>`
        }

        class ParentView extends View {
            useVirtualDom = true

            a = true

            value1 = '1'
            value2 = '2'

            setup() {
                this.child3 = new ChildView3();
                this.assignView('child1', this.child3);

                this.child4 = new ChildView4();
                this.assignView('child4', this.child4);

                this.child5 = new ChildView5();
                this.assignView('child5', this.child5);

                this.child6 = new ChildView6();
                this.assignView('child6', this.child6);
            }

            content() {
                return fragment([
                    h(
                        `div`,
                        {
                            props: {
                                className: 'test',
                            },
                        },
                        [
                            h('div#span-1', {}, this.value1.toString()),
                            h('div#span-2', {}, this.value2.toString()),
                            h('div#span-3', {}, [this.child3.node()]),
                            this.child4.node(),
                            ...(this.a ? [
                                h('div#span-5', {}, [this.child5.node()]),
                                this.child6.node(),
                            ] : []),
                        ],
                    )
                ]);
            }
        }

        const parent = new ParentView({fullSelector: '#test-root'});

        parent._initialize(viewData);

        await parent.render();

        const span1 = parent.element.querySelector('#span-1');

        expect(span1).toBeInstanceOf(HTMLDivElement);

        parent.value2 = '2a';

        parent.child4.value = 'c4a';
        parent.child5.value = 'c5m';
        parent.child6.value = 'c6m';

        await parent.reRender();

        expect(parent.element.querySelector('#span-1')).toBe(span1);

        expect(parent.element.querySelector('#span-5 > div').textContent).toBe('c5m');
        expect(parent.element.querySelector('#span-6').textContent).toBe('c6m');

        const span2 = parent.element.querySelector('#span-2');
        const span3 = parent.element.querySelector('#span-3');
        const span4 = parent.element.querySelector('#span-4');

        const span3Span = span3.childNodes[0];

        expect(span2.textContent).toBe('2a');

        parent.child3.value += 'm';
        parent.child4.value += 'm';

        await parent.child3.reRender();
        await parent.child4.reRender();

        await parent.child5.reRender();
        await parent.child6.reRender();

        expect(parent.element.querySelector('#span-3 > div')).toBe(span3Span);
        expect(parent.element.querySelector('#span-4')).toBe(span4);

        expect(span3.childNodes[0].textContent).toBe(parent.child3.value);
        expect(span4.textContent).toBe(parent.child4.value);

        expect(parent.element.querySelector('#span-5 > div').textContent).toBe('c5m');
        expect(parent.element.querySelector('#span-6').textContent).toBe('c6m');

        parent.a = false;

        await parent.reRender();

        expect(parent.element.querySelector('#span-5 > div')).toBeNull();
        expect(parent.element.querySelector('#span-6')).toBeNull();

        // @todo Test remove node after first render.

        //console.log(container);

        return;

        container.remove();
    });

    it('should patch component', async () => {
        const container = document.createElement('template');
        container.id = 'test-root'

        document.body.append(container);

        class ParentView extends View {
            useVirtualDom = true

            content() {
                return h(
                    `div`,
                    {
                        props: {
                            className: 'test',
                        },
                    },
                    [
                        h('span')
                    ]
                );
            }
        }

        const parent = new ParentView({fullSelector: '#test-root'});

        parent._initialize(viewData);

        await parent.render();

        console.log(document.body.innerHTML);

        container.remove();
    });
});
