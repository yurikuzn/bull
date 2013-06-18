var Bull = Bull || {};

BullTest.include('../src/bull.cacher.js');

describe("Cacher", function () {
	var cacher;
	
	beforeEach(function () {
		cacher = new Bull.Cacher();
		var reTxt = '^bull-';
		var re = new RegExp(reTxt);		
		for (var key in localStorage) {						
			if (re.test(key)) {					
				delete localStorage[key];
			}
		}
	});
	
	it ('should set value to local storage and get it', function () {	
		var some1 = 'test1';
		var some2 = {
			some: 'test',
		};
		
		cacher.set('testType1', 'testName1', some1);
		cacher.set('testType2', 'testName2', some2);
		
		expect(cacher.get('testType1', 'testName1')).toBe(some1);
		expect(cacher.get('testType2', 'testName2').some).toBe(some2.some);

	});
	
	it ('should clear cache by type', function () {
		cacher.set('testType', 'testName', 'test');
		cacher.clear('testType');
		expect(cacher.get('testType', 'testName')).toBe(null);
	});
	
	it ('should clear entire cache', function () {
		cacher.set('testType', 'testName', 'test');
		cacher.clear();
		expect(cacher.get('testType', 'testName')).toBe(null);
	});
	
	
	it ('should set attribute with proper key', function () {
		cacher.set('testType', 'some', 'test');
		expect(localStorage.getItem('bull-testType-some')).toBe('test');
		cacher.clear('testType');		
	});
});
