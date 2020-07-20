module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			'build/<%= pkg.name %>.min.js': [
				'src/bull.factory.js',
				'src/bull.view.js',
				'src/bull.loader.js',
				'src/bull.templator.js',
				'src/bull.layouter.js',
				'src/bull.renderer.js'
			]
		},
		concat: {
			dist: {
				src: [
					'src/bull.factory.js',
					'src/bull.view.js',
					'src/bull.loader.js',
					'src/bull.templator.js',
					'src/bull.layouter.js',
					'src/bull.renderer.js'
				],
				dest: 'build/<%= pkg.name %>.js',
				options: {
					banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
				},
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('default', [
		'uglify',
		'concat'
	]);
};
