var gulp = require('gulp');
var hbsmaster = require('../index.js');
var rename = require('gulp-rename');
var fs = require('fs');

gulp.task('handlebars', function() {

    var templatedata = JSON.parse(fs.readFileSync('./src/data.json'));
    var options = {
	batch : [ './src/partials/' ]
    };
    
    gulp.src('./src/pages/*.hbs')
	.pipe( hbsmaster('./src/master.hbs', templatedata, options ))
      .pipe( rename( function(path){
        path.extname = '.html';
      }))
      .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['handlebars']);
