module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			dist: {
				src: [
					'src/bull.factory.js',
					'src/bull.view.js',
					'src/bull.loader.js',
					'src/bull.cacher.js',
					'src/bull.templator.js',
					'src/bull.layouter.js',
					'src/bull.renderer.js',
				],
				dest: 'build/<%= pkg.name %>.concat.js',
			},
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'build/<%= pkg.name %>.concat.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	
	grunt.registerTask('default', [
		'concat',
		'uglify'
	]);
};
