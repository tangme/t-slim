const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");

const gulp_rename = require("gulp-rename");
const gulp_if = require("gulp-if");

/**
 * @description
 * @author tanglv
 * @date 2020-11-20
 * @param {curdir} 是否当前目录
 * @param {cover} 是否覆盖原文件
 * @returns
 */
function mincss({ curdir = true, cover = false, fileName = null }) {
  let dir = curdir
    ? ["*.css", "!*.min.css"]
    : ["./**/*.css", "!./**/*.min.css"];
  dir = fileName ? fileName : dir;
  let outdir = fileName ? singleFileDir : "./";
  return (
    gulp
      .src(dir)
      .pipe(gulp_if(!cover, gulp_rename({ suffix: ".min" })))
      // .pipe(gulp_if(options.onlychange, gulp_changed(paths.css.dest)))
      // .pipe(gulp_csslint())
      // .pipe(gulp_csslint.formatter("stylish"))
      // .pipe(gulp_csslint.formatter('fail'))
      .pipe(
        autoprefixer({
          cascade: true, //should Autoprefixer use Visual Cascade, if CSS is uncompressed
        })
      )
      .pipe(cleanCSS())
      // .pipe(gulp_if(options.env === "production", cleanCSS()))
      .pipe(gulp.dest(outdir))
  );
}

function singleFileDir(file) {
  return file.base;
}

module.exports = mincss;
