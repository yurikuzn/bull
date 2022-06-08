module.exports = (grunt) => {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			'dist/<%= pkg.name %>.min.js': [
				'dist/<%= pkg.name %>.js',
			],
		},
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
		babel: {
			options: {
				sourceMap: false,
				presets: ['env']
			},
			dist: {
				files: {
					'dist/<%= pkg.name %>.js': 'dist/<%= pkg.name %>.js',
				}
			},
		},
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-babel');

	grunt.registerTask('default', [
		'concat',
		'babel',
		'uglify',
	]);
};
