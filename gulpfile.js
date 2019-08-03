var gulp = require('gulp');
var terser = require('gulp-terser');
var rename = require('gulp-rename');
var cleanCSS = require('gulp-clean-css');
var replace = require('gulp-replace');
var parallel = gulp.parallel;

const paths = {
  css: {
    src: ['src/public/css/**/*.css', '!src/public/css/**/*.min.css'],
    dest: 'dist/public/css/'
  },
  scripts: {
    src: ['src/public/js/**/*.js', '!src/public/js/**/*.min.js'],
    dest: 'dist/public/js/'
  },
  scripts_min: {
    src: 'src/public/js/**/*.min.js',
    dest: 'dist/public/js/'
  },
  views: {
    src: 'src/views/**/*.ejs',
    dest: 'dist/views/'
  },
  images: {
    src: ['src/public/img/**/*.jpg', 'src/public/img/**/*.png'],
    dest: 'dist/public/img/'
  },
  publicRoot: {
    src: 'src/public/*',
    dest: 'dist/public/'
  }
};

function css(cb) {
  gulp.src(paths.css.src)
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.css.dest));
  cb();
}

function scripts(cb) {
  gulp.src(paths.scripts.src, {
      sourcemaps: true
    })
    .pipe(terser())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.scripts.dest))
  cb();
}

function scriptsCopyMin(cb) {
  gulp.src(paths.scripts_min.src)
    .pipe(gulp.dest(paths.scripts_min.dest));
  cb();
}

function views(cb) {
  gulp.src(paths.views.src)
    // Positive lookahead to match subpattern, without consuming characters
    // Replaces the match with the match, then .min, then the remaining .js
    .pipe(replace(/^[a-zA-z]+(?=.js)/gm, '$&.min'))
    .pipe(replace(/^[a-zA-z]+(?=.css)/gm, '$&.min'))
    .pipe(gulp.dest(paths.views.dest));
  cb();
}

function images(cb) {
  gulp.src(paths.images.src)
    .pipe(gulp.dest(paths.images.dest));
  cb();
}

function copyRemaining(cb) {
  gulp.src(paths.publicRoot.src)
    .pipe(gulp.dest(paths.publicRoot.dest));
  cb();
}

exports.default = parallel(
  images,
  views,
  scripts,
  scriptsCopyMin,
  css,
  copyRemaining
);
