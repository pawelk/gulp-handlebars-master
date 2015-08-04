var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var handlebars = require('gulp-compile-handlebars');
var fs = require('fs');    
    
// consts
const PLUGIN_NAME = 'gulp-handlebars-master';

// plugin level function (dealing with files)
function hbsMaster( masterTemplate, data, options ) {
  if (!masterTemplate) {
    throw new PluginError(PLUGIN_NAME, 'Missing master template!');
  }

  var template = fs.readFileSync(masterTemplate, 'utf8');
    
  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, cb) {
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return cb();
    }

    if (file.isBuffer()) {
	var fileContensts = file.contents.toString();
	var fileName = file.relative.replace(/\.[^\.]+$/,'');
	var content = handlebars.Handlebars.compile(  file.contents.toString(), options );
	    content = content( data );
	data['_page'] = data[ fileName ];
	data['content'] = content;

	var tpl = handlebars.Handlebars.compile( template, options );
	
	file.contents = new Buffer( tpl(data) );
    }

    // make sure the file goes through the next gulp plugin
    this.push(file);

    // tell the stream engine that we are done with this file
    cb();
  });

  // returning the file stream
  return stream;
};

// exporting the plugin main function
module.exports = hbsMaster;
