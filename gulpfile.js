const gulp = require('gulp');
const gulp_rename = require('gulp-rename');
const babel = require('gulp-babel');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

gulp.task('autoprefixer', () => {
    return gulp.src(['css/**/*.css', '!css/**/*.min.css'])
        // .pipe(sourcemaps.init())
        .pipe(gulp_rename({ suffix: '.min' }))
        .pipe(autoprefixer({
            cascade: true //should Autoprefixer use Visual Cascade, if CSS is uncompressed
        }))
        .pipe(cleanCSS())
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest('css/'))
});

gulp.task('babel', () => {
    return gulp.src(['js/**/*.js', '!js/**/*.min.js'])
        .pipe(gulp_rename({ suffix: '.min' }))
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('js/'))
});

gulp.task("default", gulp.series('autoprefixer','babel',()=>{
	console.log('autoprefixer and babel task is done.')
}));

gulp.task('watch',()=>{
	gulp.watch(['css/**/*.css', '!css/**/*.min.css'],gulp.series('autoprefixer'));
	gulp.watch(['js/**/*.js', '!js/**/*.min.js'],gulp.series('babel'));
});