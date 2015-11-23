var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var Handlebars = require('handlebars');
var fs = require('fs');    
    
// consts
const PLUGIN_NAME = 'gulp-handlebars-master';

// plugin level function (dealing with files)
function hbsMaster( masterTemplate, data, options ) {
  if (!masterTemplate) {
    throw new PluginError(PLUGIN_NAME, 'Missing master template!');
  }
  // the master template file
  var template = fs.readFileSync(masterTemplate, 'utf8');
	  options = options || {};
    /* copy-pasta form gulp-compile-handlebars for compatibility */
	//Go through a partials object
	if(options.partials){
		for(var p in options.partials){
			Handlebars.registerPartial(p, options.partials[p]);
		}
	}
	//Go through a helpers object
	if(options.helpers){
		for(var h in options.helpers){
			Handlebars.registerHelper(h, options.helpers[h]);
		}
	}

	// Do not search for more than 10 nestings
	var maxDepth = 10;
	// Process only files with given extension names
	var allowedExtensions = ['hb', 'hbs', 'handlebars', 'html'];

	var isDir = function (filename) {
		var stats = fs.statSync(filename);
		return stats && stats.isDirectory();
	};

	var isHandlebars = function (filename) {
		return allowedExtensions.indexOf(filename.split('.').pop()) !== -1;
	};

	var partialName = function (filename, base) {
		var name = filename.substr(0, filename.lastIndexOf('.'));
		name = name.replace(new RegExp('^' + base + '\\/'), '');
		return name;
	};

	var registerPartial = function (filename, base) {
		if (!isHandlebars(filename)) { return; }
		var name = partialName(filename, base);
		var template = fs.readFileSync(filename, 'utf8');
		Handlebars.registerPartial(name, template);
	};

	var registerPartials = function (dir, base, depth) {
		if (depth > maxDepth) { return; }
		base = base || dir;
		fs.readdirSync(dir).forEach(function (basename) {
			var filename = dir + '/' + basename;
			if (isDir(filename)) {
				registerPartials(filename, base);
			} else {
				registerPartial(filename, base);
			}
		});
	};

	// Go through a partials directory array
	if(options.batch){
		// Allow single string
		if(typeof options.batch === 'string') options.batch = [options.batch];

		options.batch.forEach(function (dir) {
			registerPartials(dir, dir, 0);
		});
	}

	/**
	 * For handling unknown partials
	 * @method mockPartials
	 * @param  {string}     content Contents of handlebars file
	 */
	var mockPartials = function(content){
		var regex = /{{> (.*)}}/gim, match, partial;
		if(content.match(regex)){
			while((match = regex.exec(content)) !== null){
				partial = match[1];
				//Only register an empty partial if the partial has not already been registered
				if(!Handlebars.partials.hasOwnProperty(partial)){
					Handlebars.registerPartial(partial, '');
				}
			}
		}
	};

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, cb) {
      if (file.isNull()) {
	  this.push(file);
	  return cb();
      }
      if (file.isStream()) {
	  this.emit('error', new gutil.PluginError('gulp-handlebars-master', 'Streaming not supported'));
	  return cb();
      }
      if (file.isBuffer()) {
	  try {
	      // get contents of partial template file
	      var fileContensts = file.contents.toString();
	      // get the file name without extension
	      var fileName = file.relative.replace(/\.[^\.]+$/,'');
	      // compile a handlebars template from partial 
	      var content = Handlebars.compile(  file.contents.toString(), options );
	      // render the partial
	      content = content( data );
	      // set reference to current page data as _page, e.g. to show {{ _page.title }}
	      data['_page'] = data[ fileName ];
	      // set compiled partial html to be rendered as  {{{ content }}}
	      data['content'] = content;
	      // compile the master template
	      var tpl = Handlebars.compile( template, options );
	      // render master to file
	      file.contents = new Buffer( tpl(data) );
	  } catch (err) {
	      this.emit('error', new gutil.PluginError('gulp-handlebars-master', err));
	  }
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
hbsMaster.Handlebars = Handlebars;
// exporting the plugin main function
module.exports = hbsMaster;
