var gulp = require('gulp');
var terser = require('gulp-terser');
var rename = require('gulp-rename');
var cleanCSS = require('gulp-clean-css');

const paths = {
  styles: {
    src: 'src/styles/**/*.css',
    dest: 'assets/styles/'
  },
  scripts: {
    src: ['src/public/js/**/*.js', '!src/public/js/**/*.min.js'],
    dest: 'dist/public/js/scripts/'
  }
};

function styles() {
  return gulp.src(paths.styles.src)
    .pipe(cleanCSS())
    .pipe(rename({
      basename: 'main',
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.styles.dest));
}

function scripts() {
  return gulp.src(paths.scripts.src, { sourcemaps: true })
    .pipe(terser())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.scripts.dest))
}

exports.scripts = scripts;