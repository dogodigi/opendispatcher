module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        nodeunit: {
            all: ['test/*_test.js'],
            options: {
                reporter: 'junit',
                reporterOptions: {
                    output: 'test'
                }
            }
        },
        less: {
            dist: {
                files: {
                    'public/css/dbk.css': 'less/style.less'
                }
            }
        },
        cssmin: {
            combine: {
                files: {
                    'public/css/dbk.min.css': [
                        'public/css/dbk.css',
                        'public/js/libs/bootstrap-3.2.0-dist/css/bootstrap.css',
                        'public/css/daterangepicker-bs3.css',
                        'public/css/typeahead.js-bootstrap.css',
                        'public/css/slider.css'
                    ]
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.registerTask('default', ['less', 'cssmin', 'nodeunit']);
};

