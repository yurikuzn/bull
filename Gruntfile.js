module.exports = (grunt) => {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			dist: {
				src: [
					'src/bull.factory.js',
					'src/bull.view.js',
					'src/bull.loader.js',
					'src/bull.templator.js',
					'src/bull.layouter.js',
					'src/bull.renderer.js',
				],
				dest: 'dist/<%= pkg.name %>.js',
				options: {
					banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				},
			}
		},
	});

	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('default', [
		'concat',
	]);
};
