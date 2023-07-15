
import Templator from '../../src/bull.templator.js';

describe('Templator', () => {
    let templator;
    let layouter;
	let loader;

	let defaultTemplate	= 'test';

	beforeEach(() => {
		loader = {
			load: {},
		};

		spyOn(loader, 'load').and.callFake((type, name, callback) => {
			if (type === 'template') {
				callback(defaultTemplate)
			}
			if (type === 'layoutTemplate') {
				callback("<%= (typeof some !== 'undefined') ? some : '' %>");
			}
		});

		layouter = {};

		templator = new Templator({
			loader: loader,
			layouter: layouter,
		});

	});

	it ('should load template if is not loaded', () => {
		templator.getTemplate('test', null, () => {});

		expect(loader.load.calls.first().args[0]).toBe('template');
		expect(loader.load.calls.first().args[1]).toBe('test');
	});

	it ('should not load template if loaded', () => {
		templator.addTemplate('test', defaultTemplate);
		templator.getTemplate('test', null, () => {});

		expect(loader.load.calls.count()).toBe(0);
	});

	it ('should build template with injected data into layout', () => {
		spyOn(templator, '_buildTemplate').and.callThrough();

		let template;

		templator.compilable = false;
		templator.getTemplate('test', {
			name: 'someLayout',
			data: {some: 'test'},
			layout: {}
		}, t => {
			template = t;
		});

		expect(templator._buildTemplate.calls.first().args[0].some).toBe('test');
		expect(templator._buildTemplate.calls.first().args[1].some).toBe('test');
		expect(template).toBe('test');
	});
});
