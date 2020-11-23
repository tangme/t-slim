#! /usr/bin/env node

const path = require('path');

//console.log("process.cwd: "+process.cwd());//return current working directory 
//console.log("path.resolve: "+path.resolve('./'));//return current working directory 
//console.log("process.execPath: "+process.execPath);//returns the absolute pathname of the executable that started the Node.js process.


//console.log("__dirname: "+__dirname);//The directory name of the current module.
//console.log("__filename"+ __filename)//The file name of the current module. 

const inquirer = require('inquirer'); //交互
const mincss = require("../lib/cssModule");
const minjs = require('../lib/jsModule')

/**
 * 是否仅处理当前文件
 */
function qCurDir() {
    return inquirer
        .prompt([{
            type: 'list',
            name: 'curdir',
            message: '仅处理当前目录文件?',
            choices: [
                '是 (仅处理当前目录文件)',
                '否 (处理当前目录及子孙目录)',
            ],
            filter: function(val) {
                return val.charAt(0) === '是' ? true : false;
            },
        }, ])
        .then((answers) => {
            // console.log(JSON.stringify(answers, null, '  '));
            return Promise.resolve(answers)
        });
}

/**
 * 是否覆盖原文件
 */
function qCover() {
  return inquirer
        .prompt([{
            type: 'list',
            name: 'cover',
            message: '覆盖原文件?',
            choices: [
                '是 (新内容将覆盖原内容)',
                '否 (新内容将以.min文件生成))',
            ],
            filter: function(val) {
                return val.charAt(0) === '是' ? true : false;
            },
        }, ])
        .then((answers) => {
            return Promise.resolve(answers)
        });
}


async function flow () {
  var options = {};

    Object.assign(options, await qCurDir()) //资源类型
    Object.assign(options, await qCover()) //压缩

    return Promise.resolve(options);
}

flow().then(options => {
  console.log(options)
    mincss(options);
    minjs(options)
});



