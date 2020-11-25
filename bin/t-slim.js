#! /usr/bin/env node

const path = require("path");

//console.log("process.cwd: "+process.cwd());//return current working directory 
//console.log("path.resolve: "+path.resolve('./'));//return current working directory 
//console.log("process.execPath: "+process.execPath);//returns the absolute pathname of the executable that started the Node.js process.


//console.log("__dirname: "+__dirname);//The directory name of the current module.
//console.log("__filename"+ __filename)//The file name of the current module. 

const inquirer = require("inquirer"); //交互
const mincss = require("../lib/cssModule");
const minjs = require("../lib/jsModule");

/**
 * 是否仅处理当前文件
 */
function qCurDir() {
    return inquirer
        .prompt([{
            type: "list",
            name: "curdir",
            message: "仅处理当前目录文件?",
            choices: [
                "是 (仅处理当前目录文件)",
                "否 (处理当前目录及子孙目录)",
            ],
            filter: function(val) {
                return val.charAt(0) === "是" ? true : false;
            },
        }, ])
        .then((answers) => {
            // console.log(JSON.stringify(answers, null, '  '));
            return Promise.resolve(answers);
        });
}

/**
 * 是否覆盖原文件
 */
function qCover() {
  return inquirer
        .prompt([{
            type: "list",
            name: "cover",
            message: "覆盖原文件?",
            choices: [
                "是 (新内容将覆盖原内容)",
                "否 (新内容将以.min文件生成))",
            ],
            filter: function(val) {
                return val.charAt(0) === "是" ? true : false;
            },
        }, ])
        .then((answers) => {
            return Promise.resolve(answers);
        });
}


// async function flow () {
//   var options = {};

//     Object.assign(options, await qCurDir()); //资源类型
//     Object.assign(options, await qCover()); //压缩

//     return Promise.resolve(options);
// }

// flow().then(options => {
//   console.log(options)
//     mincss(options);
//     minjs(options)
// });



const commander = require("commander"); // include commander in git clone of commander repo
const program = new commander.Command();
program.version(`version: ${require("../package.json").version}`);

program
  .option("-y, --yes", "all setting by default")
  .option("-s, --sub-folder", "processes current,sub,descendants directory")
  .option("-c, --cover", "overwrite the original");

program.parse(process.argv);

var ASK_ARR = [qCurDir,qCover];

/**
 * @description
 * @author tanglv
 * @date 2020-11-25
 * @param {*} 处理参数，已确定任务
 */
function processArgv(program) {
    var options = {
        curdir: true,//当前目录    true:当前目录   false:子孙目录 
        cover: false //覆盖原文件  true:覆盖       false:新建.min文件
    };

    if (program.subFolder) {
        let index = findFunNameIndex(ASK_ARR, "qCurDir");
        index > -1 && ASK_ARR.splice(index, 1);
        options.curdir = false;
    }
    if (program.cover) {
         let index = findFunNameIndex(ASK_ARR, "qCover");
        index > -1 && ASK_ARR.splice(index, 1);
        options.cover = true;
    }
    if (program.yes) { 
        ASK_ARR = [];
    }

    if (ASK_ARR.length) {// 提示询问
      showAskFace().then(data => {
        Object.keys(data).forEach(key => {
          options[key] = data[key];
        });
            console.log("ask:" + JSON.stringify(data));       
          console.log("options" + JSON.stringify(options));
          exec(options);
        });
    } else {
      exec(options);
    }
}

async function showAskFace() {
    let askResult = {};
    for (let x of ASK_ARR) {
        Object.assign(askResult, await x());
    }
    return Promise.resolve(askResult);
}


function findFunNameIndex (arr,name) {
  return arr.findIndex(item => {
        return item.name === name; 
    });
}

function exec (options) {
  mincss(options);
    minjs(options);
}


processArgv(program);



