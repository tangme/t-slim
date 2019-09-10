const gulp = require('gulp');
const gulp_rename = require('gulp-rename');
const babel = require('gulp-babel');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const gulp_changed = require('gulp-changed');
const gulp_tap = require('gulp-tap');
const gulp_if = require('gulp-if');

const source = require('vinyl-source-stream');
const streamify = require('gulp-streamify');
const glob = require('glob');
const buffer = require('vinyl-buffer')
const path = require('path');


const minimist = require('minimist'); //解析命令行参数
const buildOptions = require('minimist-options'); //解析命令行参数 增强配置

var fs = require("fs");
var browserify = require("browserify");

var knownOptions = buildOptions({
    //生成环境进行文件压缩
    env: {
        type: 'string',
        default: process.env.NODE_ENV || 'production'
    },
    onlychange: {//只针对改动文件执行任务
        type: 'boolean',
        alias: 'oc',
        default: true
    },
});

var options = minimist(process.argv.slice(2), knownOptions);
console.log(options);


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
        .pipe(gulp_rename({ suffix: '.min' }))
        .pipe(gulp_if(options.onlychange,gulp_changed(paths.css.dest)))
        .pipe(autoprefixer({
            cascade: true //should Autoprefixer use Visual Cascade, if CSS is uncompressed
        }))
        .pipe(gulp_if(options.env==='production',cleanCSS()))
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
                    "corejs": 2,
                    "useBuiltIns": "usage" //""entry
                }]
            ],
            plugins: ['@babel/transform-runtime'],
            envName: "production"
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
    gulp.watch(paths.js.src, watchOption, gulp.series('babelalljs'));
});


function test() {
    return new Promise((resolve, reject) => {
        browserify("js/test.js")
            .transform("babelify", {
                presets: [
                    ["@babel/env", {
                        "targets": {
                            "browsers": ["IE >= 9"]
                        },
                        "corejs": 2,
                        "useBuiltIns": "usage" //entry
                    }]
                ],
                plugins: ['@babel/transform-runtime']
            })
            .bundle()
            .pipe(fs.createWriteStream("bundle.js"));
        resolve();
    });
}

function test2() {
    return new Promise((resolve, reject) => {
        browserify("js/test.js")
            .transform("babelify", {
                presets: [
                    ["@babel/env", {
                        "targets": {
                            "browsers": ["IE >= 9"]
                        },
                        "corejs": 2,
                        "useBuiltIns": "usage" //entry
                    }]
                ],
                plugins: ['@babel/transform-runtime']
            })
            .bundle()
            .pipe(source('tanglv.js'))
            .pipe(streamify(uglify()))
            .pipe(gulp.dest(paths.js.dest));
        resolve();
    });
}

/**
 * [babelalljs 转换默认文件夹下所有的js文件]
 * @Author tanglv   2019-08-14
 * @return {[type]} [description]
 */
function babelalljs() {
    return new Promise((resolve, reject) => {
        glob("js/**/*.js", { ignore: ['js/**/*.min.js'] }, (err, files) => {
            let fileArr = [];
            files.forEach(file => {
                console.log(file)
                fileArr.push(transformJs(file, paths.js.dest))
            });
            Promise.all(fileArr).then(() => {
                console.log('finished.');
                resolve();
            });
        });
    });

}

/**
 * [transformJs 将 es6 转换为 es5]
 * @Author tanglv   2019-08-14
 * @param  {[string]} filePath   [待转换的文件名及其路径]
 * @param  {[string]} outputPath [转换后输出的目录]
 * @return {[type]}            [description]
 */
function transformJs(filePath, outputPath) {
    return new Promise((resolve, reject) => {
        let b = browserify();
        b.add(filePath);
        b.transform("babelify", {
            presets: [
                ["@babel/env", {
                    "targets": {
                        "browsers": ["IE >= 9"]
                    },
                    // "corejs": 2,
                    // "useBuiltIns": "usage" //entry
                }]
            ],
            // plugins: ['@babel/transform-runtime']
        })
        b.bundle()
            .pipe(source(path.parse(filePath).base))
            .pipe(buffer())
            .pipe(gulp_rename({ suffix: '.min' }))
            // .pipe(uglify())
            .pipe(gulp.dest(outputPath));
        resolve();
    });
}

gulp.task(babelalljs)

gulp.task('js', () => {
    return gulp.src(paths.js.src, { read: false })
        .pipe(gulp_if(options.onlychange,gulp_rename({ suffix: '.min' })))
        .pipe(gulp_if(options.onlychange,gulp_changed(paths.js.dest)))
        .pipe(gulp_tap(function(file) {
            // replace file contents with browserify's bundle stream
            file.contents = browserify(file.path.replace('.min',''), {}).transform("babelify", {
                presets: [
                    ["@babel/env", {
                        "targets": {
                            "browsers": ["IE >= 9"]
                        },
                        // "corejs": 2,
                        // "useBuiltIns": "usage" //entry
                    }]
                ],
                // plugins: ['@babel/transform-runtime']
            }).bundle();
        }))
        .pipe(buffer())
        .pipe(gulp_if(options.env==='production',uglify()))
        .pipe(gulp_if(!options.onlychange,gulp_rename({ suffix: '.min' })))
        .pipe(gulp.dest(paths.js.dest))
})

gulp.task('watchroot', () => {
    gulp.watch("*.html", watchOption, () => {
        console.log('hello');
        return Promise.resolve();
    });
});


const build = gulp.series('autoprefixer', 'js', () => {
    return new Promise((resolve, reject) => {
        console.log('autoprefixer and babel task is done...');
        resolve();
    })
});

exports.default = build;