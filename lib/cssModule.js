const path = require("path");
const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const gulp_csslint = require("gulp-csslint");
gulp_csslint.addFormatter("csslint-stylish");

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
function mincss({
  curdir = true,
  cover = false,
  fileName = null,
  speDir = null,
}) {
  let dir = curdir
    ? ["*.css", "!*.min.css"]
    : ["./**/*.css", "!./**/*.min.css"];
  dir = fileName ? fileName : dir;
  let outdir = fileName ? singleFileDir : "./";

  if (speDir) {
    if (curdir) {
      dir = [path.resolve(speDir, "*.css"), path.resolve(speDir, "!*.min.css")];
    } else {
      dir = [
        path.resolve(speDir, "./**/*.css"),
        path.resolve(speDir, "!./**/*.min.css"),
      ];
    }
    outdir = path.resolve(speDir, "./");
  }

  return (
    gulp
      .src(dir)
      .pipe(gulp_if(!cover, gulp_rename({ suffix: ".min" })))
      // .pipe(gulp_if(options.onlychange, gulp_changed(paths.css.dest)))
      .pipe(gulp_csslint(path.resolve(__dirname, "../.csslintrc")))
      .pipe(gulp_csslint.formatter("stylish")) //格式化打印输出
      // .pipe(gulp_csslint.formatter("fail"))
      .pipe(
        autoprefixer({
          cascade: true, //should Autoprefixer use Visual Cascade, if CSS is uncompressed
        })
      )
      .on("error", (error) => {
        console.log("Stream Exiting With Error: " + error.message);
      })
      .pipe(cleanCSS())
      // .pipe(gulp_if(options.env === "production", cleanCSS()))
      .pipe(gulp.dest(outdir))
  );
}

function singleFileDir(file) {
  return file.base;
}

module.exports = mincss;
