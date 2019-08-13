const gulp = require('gulp');
const gulp_rename = require('gulp-rename');
const babel = require('gulp-babel');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');


const paths = {
    css: {
        src: ['css/**/*.css', '!css/**/*.min.css'],
        dest: 'css/'
    },
    js: {
        src: ['js/**/*.js', '!js/**/*.min.js'],
        dest: 'js/'
    }
}
const watchOption = {
    events: 'all', //触发条件 all:[add,addDir,change,unlink,unlinkDir]
    ignoreInitial: true, //忽略首次启动执行
    queue: true, //队列形式执行
    delay: 200 //延时执行
}

/**
 * [添加游览器前缀，并压缩]
 * @Author tanglv   2019-08-13
 */
gulp.task('autoprefixer', () => {
    return gulp.src(paths.css.src)
        // .pipe(sourcemaps.init())
        .pipe(gulp_rename({ suffix: '.min' }))
        .pipe(autoprefixer({
            cascade: true //should Autoprefixer use Visual Cascade, if CSS is uncompressed
        }))
        .pipe(cleanCSS())
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.css.dest))
});

/**
 * [babel 任务]
 * @Author tanglv   2019-08-13
 */
gulp.task('babel', () => {
    return gulp.src(paths.js.src)
        .pipe(gulp_rename({ suffix: '.min' }))
        .pipe(babel({
            presets: [
                ['@babel/env', {
                    "targets": {
                        "browsers": ["IE >= 9"]
                    },
                    "corejs":2,
                    "useBuiltIns": "usage"//""entry
                }]
            ],
            plugins: ['@babel/transform-runtime'],
            envName:"production"
        }))
        // .pipe(uglify())
        .pipe(gulp.dest(paths.js.dest))
});

/**
 * [监听 js,css文件夹下文件，并在文件被修改后，执行任务]
 * @Author tanglv   2019-08-13
 */
gulp.task('watch', () => {
    gulp.watch(paths.css.src, watchOption, gulp.series('autoprefixer'));
    gulp.watch(paths.js.src, watchOption, gulp.series('babel'));
});

const build = gulp.series('autoprefixer', 'babel', () => {
    return new Promise((resolve, reject) => {
        console.log('autoprefixer and babel task is done...');
        resolve();
    })
});

exports.default = build;