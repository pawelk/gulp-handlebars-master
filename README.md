Install
--------
`npm install gulp-handlebars-master --save-dev`

What it does?
-------
This lib aims to make compiling many pages which share the basic HTML structure more DRY. Based on [gulp-compile-handlebars](https://www.npmjs.com/package/gulp-compile-handlebars) for compatibility with its `options` object format.

Why?
-----

In the classic handlebars-based solution you can share headers, footers etc. but you have to include them as partials in every page, for example

**index.hbs**

    <!doctype html>
    <html>
      {{>head_section}}
    <body>
      {{>navigation}}
      <p>Home page content goes here</p>
      <a href="about.html">{{ about.title }}</a>
      {{>footer}}
    </body>
    </html>

**about.hbs**

    <!doctype html>
    <html>
      {{>head_section}}
    <body>
      {{>navigation}}
      <p>About us content goes here</p>
      <a href="index.html">{{ index.title }}</a>
      {{>footer}}
    </body>
    </html>

Using a "*master*" template you just create the content and it gets included in the master page. There are also some features related to the `data` object.

**src/pages/index.hbs**

    <p>This is the index page</p>
    <a href="about.html">{{ about.title }}</a>

**src/pages/about.hbs**

    <p>This is about page</p>
    <a href="index.html">{{ index.title }}</a>

**src/master.hbs**

    <!doctype html>
    <html>
      <head>
        <title>Handlebars Master Template - {{ _page.title }}</title>
      </head>
    <body>
    
    <header>
      <h1>Shared header - {{ _page.title }}</h1>
      <nav>
        <ul>
          <li class="{{ _page.nav_index }}">
            <a href="index.html">{{ index.title }}</a>
         </li>
         <li class="{{ _page.nav_about }}">
           <a href="about.html">{{ about.title }}</a>
         </li>
        </ul>
      </nav>
    </header>
    
    <main>
      {{{ content }}}
    </main>
    
    <footer>
      Shared footer
    </footer>
    </body>
    </html>


`gulp-handlebars-master` uses file names to set a `_page` object with current page data for the master template. If a data object is passed to the task, everything under `index` key will be available as `_page` while compiling *index.hbs*, everything under `about` will be available as `_page` while compiling *about.html* etc. The whole data object is available to all the page templates and the master. This feature can be used to solve the "add a class to the current page in navigation" problem.

Compiling using gulp
-------------------------

**gulpfile.js**

    var hbsmaster = require('gulp-handlebars-master');
    var rename = require('gulp-rename');

    gulp.task('handlebars', function() {

        var tepmplatedata = {
    	  "index" : {
    	    "title" : "Home page",
    	    "nav_index" : "active"
    	  },
    	  "about" : {
    	    "title" : "About us",
    	    "nav_about" : "active"
    	  }
        };
        
        gulp.src('./src/pages/*.hbs')
    	  .pipe( hbsmaster('./src/master.hbs', templatedata, {}))
    	  .pipe( rename( function(path){
    	    path.extname = '.html';
    	  }))
    	  .pipe(gulp.dest('./dist'));
    });

The first argument to the `.pipe( hbsmaster('./src/master.hbs', templatedata, {}))` is location of the master template, 2nd and 3rd arguments are `data` and `options` compatible with the arguments you can pass to  [gulp-compile-handlebars](https://www.npmjs.com/package/gulp-compile-handlebars)

### Check out (a bit more advanced) example:

    $ git clone https://github.com/pawelk/gulp-handlebars-master.git ./hbs-master
	$ cd hbs-master/example
	$ npm install
	$ gulp
