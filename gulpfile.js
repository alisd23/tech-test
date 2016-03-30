const gulp = require('gulp');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const copy = require('gulp-copy');
const clean = require('gulp-clean');
const browserify = require('browserify');
const watchify = require('watchify');
const babelify = require('babelify');
const hmr = require('browserify-hmr');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const nodemon = require('gulp-nodemon');

const appConfig = require('./app.config');
const port = appConfig.PORT;

const PATHS = {
  HTML: 'index.html',
  SOURCE: {
    cycleReact: 'src/client/cycle-react',
    server: 'src/microservices'
  },
  DIST: {
    client: 'dist/client',
    server: 'dist/microservices'
  },
  SERVER: 'src/microservices/main.js'
};

const compilation = {
  // Client compilation
  client: {
    cycleReact: {
      dev: {
        compile: function() {
          const b = watchify(browserify({
            extensions: ['.js', '.jsx'],
            entries: [PATHS.SOURCE.cycleReact + '/app.js'],
            debug: true,
            verbose: true,
            transform: [babelify],
            plugin: [hmr]
          }));

          function bundle() {
            return b.bundle()
              .on('error', () => console.log('Browserify ERROR'))
              .pipe(source('bundle.js'))
              .pipe(buffer())
              .pipe(sourcemaps.init({loadMaps: true}))
              .pipe(sourcemaps.write())
              .pipe(gulp.dest(PATHS.DIST.client));
          }

          b.on('update', bundle);
          b.on('bytes', () => console.log('==> Bundle Created'))
          b.on('log', gutil.log);
          return bundle();
        },
        copy: function() {
          // Copy all INDEX HTML file
          return gulp.src([
              'index.html'
            ], { cwd: PATHS.SOURCE.cycleReact })
            .pipe(copy(PATHS.DIST.client));
        }
      }
    },
    clean: function() {
      return gulp.src(PATHS.DIST.client, { force: true })
        .pipe(clean());
    }
  },
  // Server compilation
  server: {
    dev: {
      compile: function() {
        return gulp.src(PATHS.SOURCE.server + '/**/*.js')
      		.pipe(sourcemaps.init())
      		.pipe(babel())
      		.pipe(sourcemaps.write())
      		.pipe(gulp.dest(PATHS.DIST.server));
      },
      copy: function() {
        // Copy all NON-JS files
        return gulp.src([
            '**/*',
            '!**/*.js',
            '!**/*.log'
          ], { cwd: PATHS.SOURCE.server })
          .pipe(copy(PATHS.DIST.server));
      }
    },
    clean: function() {
      return gulp.src(PATHS.DIST.server, { force: true })
        .pipe(clean());
    }
  }
}

/**
 * Running server
 */
const server = {
  dev: function () {
    nodemon({
      script: PATHS.SERVER,
      ext: 'js html',
      env: { 'NODE_ENV': 'development' },
      watch: ['server']
    }).on('restart', function () {
      console.log('------ Server restarted ------')
    })
  }
}

/**
 * GULP TASKS
 */
const tasks = {
  'default': {
    deps: ['dev']
  },

  // MAIN TASKS
  'cycle-react': {
    dev: {
      default: {
        deps: ['cycle-react:dev:compile', 'cycle-react:dev:copy', 'server:dev']
      },
      compile: {
        deps: ['client:dev:clean'],
        fn: compilation.client.cycleReact.dev.compile
      },
      copy: {
        deps: ['client:dev:clean'],
        fn: compilation.client.cycleReact.dev.copy
      }
    }
  },

  // CLIENT
  'client': {
    dev: {
      clean: {
        fn: compilation.client.clean
      }
    }
  },

  // SERVER
  'server': {
    dev: {
      default: {
        deps: ['server:dev:compile', 'server:dev:copy'],
        fn: server.dev
      },
      compile: {
        deps: ['server:dev:clean'],
        fn: compilation.server.dev.compile
      },
      copy: {
        deps: ['server:dev:clean'],
        fn: compilation.server.dev.copy
      },
      clean: {
        fn: compilation.server.clean
      }
    }
  }
}

/**
 * TASK GENERATION
 * - Generate gulp tasks based on task object defined at top of file
 */

function createTask(name, task) {
  if (task.deps || task.fn) {
    gulp.task(name, task.deps, task.fn);
  } else {
    for (subName in task) {
      if (subName === 'default') {
        gulp.task(name, task['default'].deps, task['default'].fn);
      } else {
        createTask(name + ':' + subName, task[subName]);
      }
    }
  }
}

for (name in tasks) {
  if (name === 'default') {
    gulp.task('default', tasks['default'].deps, tasks['default'].fn);
  } else {
    createTask(name, tasks[name]);
  }
}
