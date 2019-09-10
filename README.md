## 安装
> npm i

## 安装速度慢，可以改为
> npm i --registry=https://registry.npm.taobao.org 

## 单次任务构建
> npx gulp

## 监听 `css,js` 文件，并在文件改动后，进行处理
> npx gulp watch

## 是否只针对改动的文件执行任务 
> npx gulp [taskname] --onlychange true
> npx gulp [taskname] --oc false

## 是否生成环境||非生产环境将不压缩文件||默认生成环境 production
> npx gulp [taskname] --env=dev