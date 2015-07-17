module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			'build/<%= pkg.name %>.min.js': [
				'src/bull.factory.js',
				'src/bull.view.js',
				'src/bull.loader.js',
				'src/bull.templator.js',
				'src/bull.layouter.js',
				'src/bull.renderer.js',
			]
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', [
		'uglify'
	]);
};