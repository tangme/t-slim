## 安装
> npm i

## 安装速度慢，可以改为
> npm i --registry=https://registry.npm.taobao.org 

## 单次任务构建
> npx gulp

## 监听 `css,js` 文件，并在文件改动后，进行处理
> npx gulp watch

## 命令行参数
### `onlychange` 别名 `oc` 是否只针对改动的文件执行任务 ，默认仅对改变文件

> npx gulp [taskname] --onlychange true
>
> npx gulp [taskname] --oc false

### `env` 是否生成环境，默认生成环境

> npx gulp [taskname] --env=dev  开发环境将不压缩文件
>
> npx gulp [taskname] 默认生成环境 production,将压缩文件

### `lint` 是否启动语法校验，默认开启

> npx gulp [taskname] --lint false 不启用语法校验