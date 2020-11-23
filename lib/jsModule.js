const gulp = require("gulp");
const uglify = require("gulp-uglify");
const gulp_rename = require("gulp-rename");
const gulp_if = require("gulp-if");
const gulp_tap = require("gulp-tap");
const gulp_changed = require("gulp-changed");

const buffer = require("vinyl-buffer");
var browserify = require("browserify");
const babel = require('gulp-babel');

function minjs ({ curdir = true, cover = false }) {
  let dir = curdir ? ["*.js", "!*.min.js"] : ["./**/*.js", "!./**/*.min.js"];
    
    return gulp.src(dir) 
        .pipe(babel({
            presets: ['@babel/env'],
        }))
        .pipe(uglify()) //生产环境，进行压缩
        .pipe(gulp_if(!cover,gulp_rename({ suffix: ".min" })))
        .pipe(gulp.dest("./"));
} 

// function minjs ({ curdir = true, cover = false }) {
//   let dir = curdir ? ["*.js", "!*.min.js"] : ["./**/*.js", "!./**/*.min.js"];
    
//   return gulp.src(dir) 
//         .pipe(gulp_tap(function (file) { //针对每个文件进行babel处理
//             // replace file contents with browserify's bundle stream
//             file.contents = browserify(file.path, {}).transform("babelify", {
//                 presets: [
//                     ["@babel/env", {
//                         "targets": {
//                             "browsers": ["IE >= 9"]
//                         },
//                     }]
//                 ],
//             }).bundle();
//         }))
//         .pipe(buffer()) //transform streaming contents into buffer contents
//         // .pipe(uglify()) //生产环境，进行压缩
//         .pipe(gulp_if(!cover,gulp_rename({ suffix: ".min" })))
//         .pipe(gulp.dest("./"));
// } 

module.exports = minjs;