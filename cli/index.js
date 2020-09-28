#! /usr/bin/env node


const inquirer = require('inquirer'); //交互
const ora = require("ora"); //loading
const shell = require("shelljs");
var exec = require('child_process').execFile;

let options = {};

/**
 * [queryResource 询问处理的资源]
 * @Author tanglv   2020-09-27
 * @return {[type]} [description]
 */
function queryResource() {
    return inquirer
        .prompt([{
            type: 'checkbox',
            message: '请选择要处理的资源类型',
            name: 'resource',
            choices: [{
                    name: 'JavaScript',
                },
                {
                    name: 'CSS',
                },
            ],
            filter: function(val) {
                var result = [];
                val.forEach(item=>{
                    result.push(item.toLowerCase());
                });
                return result;
            },
            validate: function(answer) {
                if (answer.length < 1) {
                    return 'You must choose at least one topping.';
                }
                return true;
            },
        }, ])
        .then((answers) => {
            // console.log(JSON.stringify(answers, null, '  '));
            return Promise.resolve(answers)
        });
}

/**
 * [queryCompress 询问是否压缩文件]
 * @Author tanglv   2020-09-28
 * @return {[type]} [description]
 */
function queryCompress() {
    return inquirer
        .prompt([{
            type: 'list',
            name: 'compress',
            message: '是否压缩文件?',
            choices: [
                '是',
                '否',
            ],
            filter: function(val) {
                return val==='是'?true:false;
            },
        }, ])
        .then((answers) => {
            // console.log(JSON.stringify(answers, null, '  '));
            return Promise.resolve(answers)
        });
}

function queryOnlyChange(){
    return inquirer
        .prompt([{
            type: 'list',
            name: 'onlychange',
            message: '仅对改动的文件进行处理?',
            choices: [
                '是',
                '否',
            ],
            filter: function(val) {
                return val==='是'?true:false;
            },
        }, ])
        .then((answers) => {
            // console.log(JSON.stringify(answers, null, '  '));
            return Promise.resolve(answers)
        });
}


async function flow() {
    Object.assign(options, await queryResource())
    Object.assign(options, await queryCompress())
    Object.assign(options, await queryOnlyChange())

    console.log(options);
    return Promise.resolve(options);
}

/*flow().then((data)=>{
    console.log('========');
    console.log(data)
    console.log(shell.which('gulp'))
    // shell.exec("node -v");
    // shell.cd("D:\\Tencent\\TIM\\Bin\\QQScLauncher.exe");
    // shell.cd("D:\\Tencent\\TIM\\Bin\\");
    // console.log(shell.ls());
    // exec("QQScLauncher.exe");
    // shell.exec("npx gulp");
    console.log('---------');
});*/

const t = require('./gulp.js')
/*console.log(t.default);
t.default()*/
flow().then((data) => {
    return t.default(data);
}).then(data=>{
    console.log('====')
    console.log(data)
});