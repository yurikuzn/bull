

var Bull = Bull || {};

describe("Layouter", function () {
	var layouter;
	
	var defaultLayout = {
		type: 'default',
		layout: {},
	}
	
	beforeEach(function () {
	
		
		loader = {
			load: {},
		};		
		spyOn(loader, 'load').andCallFake(function (type, name, callback) {			
			callback(defaultLayout);
		});
	
		layouter = new Bull.Layouter({
			loader: loader,
		});
	});
	
	it ('shoud return proper nested views definitions from the layout', function () {
		layouter.addLayout('test_1', {
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
		});
		
		layouter.addLayout('test_2', {
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
		});
		
		layouter.addLayout('test_3', {
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
		});		
		
		var nestedViewList = layouter.findNestedViews('test_1');		
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
		
		var nestedViewList = layouter.findNestedViews('test_2');		
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
		
		var nestedViewList = layouter.findNestedViews('test_3');		
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
