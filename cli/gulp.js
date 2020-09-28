const gulp = require("gulp");
const gulp_rename = require("gulp-rename");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const gulp_changed = require("gulp-changed");
const gulp_tap = require("gulp-tap");
const gulp_if = require("gulp-if");
const gulp_eslint = require("gulp-eslint");
const gulp_csslint = require("gulp-csslint");
gulp_csslint.addFormatter("csslint-stylish");

const source = require("vinyl-source-stream");
const glob = require("glob");
const buffer = require("vinyl-buffer");
const path = require("path");


const minimist = require("minimist"); //解析命令行参数
const buildOptions = require("minimist-options"); //解析命令行参数 增强配置

var browserify = require("browserify");

var knownOptions = buildOptions({
    //生产环境进行文件压缩
    env: {
        type: "string",
        default: process.env.NODE_ENV || "production"
    },
    onlychange: { //只针对改动文件执行任务
        type: "boolean",
        alias: "oc",
        default: true
    },
    //语法校验
    lint: {
        type: "boolean",
        default: true
    }
});

var options = minimist(process.argv.slice(2), knownOptions);

function isFixed(file) {
    return file.eslint != null && file.eslint.fixed;
}

const paths = {
    css: {
        src: ["css/**/*.css", "!css/**/*.min.css"],
        dest: "css/"
    },
    js: {
        src: ["js/**/*.js", "!js/**/*.min.js"],
        dest: "js/"
    }
};
const watchOption = {
    events: "all", //触发条件 all:[add,addDir,change,unlink,unlinkDir]
    ignoreInitial: true, //忽略首次启动执行
    queue: true, //队列形式执行
    delay: 200 //延时执行
};

/**
 * [添加游览器前缀，并压缩]
 * @Author tanglv   2019-08-13
 */
gulp.task("autoprefixer", () => {
    return gulp.src(paths.css.src)
        .pipe(gulp_rename({ suffix: ".min" }))
        .pipe(gulp_if(options.onlychange, gulp_changed(paths.css.dest)))
        .pipe(gulp_csslint())
        .pipe(gulp_csslint.formatter("stylish"))
        // .pipe(gulp_csslint.formatter('fail'))
        .pipe(autoprefixer({
            cascade: true //should Autoprefixer use Visual Cascade, if CSS is uncompressed
        }))
        .pipe(gulp_if(options.env === "production", cleanCSS()))
        .pipe(gulp.dest(paths.css.dest));
});

/**
 * [babel转译，并压缩]
 * @Author tanglv   2020-07-16
 */
gulp.task("js", () => {
    return gulp.src(paths.js.src) //, { read: false }
        .pipe(gulp_if(options.onlychange, gulp_rename({ suffix: ".min" }))) //仅修改时，先改变文件名
        .pipe(gulp_if(options.onlychange, gulp_changed(paths.js.dest)))
        .pipe(gulp_if(options.lint, gulp_eslint({
            configFile: ".eslintrc.js", //eslint 规则配置文件
            fix: true //自动修复可处理的错误
        })))
        // .pipe(gulp_eslint.format())//Format all results at once, at the end
        .pipe(gulp_if(options.lint, gulp_eslint.formatEach())) //format one at time since this stream may fail before it can format them all at the end
        .pipe(gulp_if(options.lint, gulp_eslint.failOnError())) //failOnError will emit an error (fail) immediately upon the first file that has an error
        .on("error", error => {
            console.log("Stream Exiting With Error: " + error.message);
            this.emit("end");
        })
        .pipe(gulp_if(options.onlychange, gulp_rename(function(path) { //仅修改时，改回文件 原本名字
            path.basename = path.basename.replace(".min", "");
        })))
        .pipe(gulp_if(options.lint, gulp_if(isFixed, gulp.dest(paths.js.dest)))) //将修复后的文件，覆盖原有文件
        .pipe(gulp_tap(function(file) { //针对每个文件进行babel处理
            // replace file contents with browserify's bundle stream
            file.contents = browserify(file.path, {}).transform("babelify", {
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
        .pipe(buffer()) //transform streaming contents into buffer contents
        .pipe(gulp_if(options.env === "production", uglify())) //生产环境，进行压缩
        .pipe(gulp_rename({ suffix: ".min" })) //将bebel后的内容，重命名.min后输出
        .pipe(gulp.dest(paths.js.dest));
});


/**
 * [监听 js,css文件夹下文件，并在文件被修改后，执行任务]
 * @Author tanglv   2019-08-13
 */
gulp.task("watch", () => {
    gulp.watch(paths.css.src, watchOption, gulp.series("autoprefixer"));
    gulp.watch(paths.js.src, watchOption, gulp.series("js"));
});


const build = gulp.series("autoprefixer", "js", () => {
    return new Promise((resolve) => {
        console.log("autoprefixer and babel task is done...");
        resolve();
    });
});

function doFlow(options) {
    opresource
}

exports.default = function(data) {
    return new Promise((resolve) => {
        var { compress, resource, onlychange } = data;
        var task = [];
        resource.includes('css') && task.push('autoprefixer');
        resource.includes('javascript') && task.push('js');
        task.push(()=> {
            console.log('-------------');
            resolve(' task is done...');
        })
        options.env = compress ? 'production' : ''
        options.onlychange = onlychange;
        console.log(options)
        gulp.series(task)()
    });
};