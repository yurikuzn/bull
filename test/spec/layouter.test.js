
import Layouter from "../../src/bull.layouter.js";

describe("Layouter", () => {
	let layouter;
	let loader;

	let defaultLayout = {
		type: 'default',
		layout: {},
	}

	beforeEach(() => {
		loader = {
			load: {},
		};

		spyOn(loader, 'load').and.callFake((type, name, callback) => {
			callback(defaultLayout);
		});

		layouter = new Layouter({
			loader: loader,
		});
	});

	it ('should return proper nested views definitions from the layout', () => {
		let l1 = {
			type: 'default',
			layout: [
				{
					name: 'header',
					tag: 'header',
					id: 'header',
					layout: 'header',
				},
				{
					name: 'main',
					id: 'main',
				},
				{
					name: 'footer',
					tag: 'footer',
					id: 'footer',
					view: 'Footer',
				},
			]
		}

		let l2 = {
			type: 'test-type',
			layout: {
				panels: [
					{
						name: 'graph',
						view: 'Graph',
					},
					{
						name: 'table',
						view: 'Table',
					}
				],
				footer: [
					{
						name: 'status',
						layout: 'Status',
					},
				],
			}
		};

		let l3 = {
			type: 'test-type',
			layout: {
				panels: [
					{
						name: 'graph',
						view: 'Graph',
					},
					{
						name: 'table',
						view: 'Table',
						notToRender: true,
					},
				],
				footer: [
					{
						name: 'graph',
						layout: 'Graph',
					},
					{
						name: 'graph',
						layout: 'Graph',
						options: {
							some: 'test'
						},
					},
				],
			}
		}

		let nestedViewList = layouter.findNestedViews(l1);

		expect(nestedViewList).toEqual([
			{
				name: 'header',
				layout: 'header',
				id : 'header',
			},
			{
				name: 'footer',
				view: 'Footer',
				id : 'footer',
			},
		]);

		nestedViewList = layouter.findNestedViews(l2);

		expect(nestedViewList).toEqual([
			{
				name: 'graph',
				view: 'Graph',
			},
			{
				name: 'table',
				view: 'Table',
			},
			{	name: 'status',
				layout: 'Status',
			},
		]);

		nestedViewList = layouter.findNestedViews(l3);

		expect(nestedViewList).toEqual([

			{
				name: 'graph',
				view: 'Graph',
			},
			{
				name: 'table',
				view: 'Table',
				notToRender: true,
			},
			{	name: 'graph_1',
				layout: 'Graph',
			},
			{	name: 'graph_2',
				layout: 'Graph',
				options: {
					some: 'test'
				},
			},
		]);
	});
});
