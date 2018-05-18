#!/usr/bin/env node
/*第一行申明运行环境*/

const program = require('commander'); /*命令行输入和参数解析插件*/
const chalk = require('chalk'); /*控制台输出颜色插件*/
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn; /*指定的命令行参数创建新进程*/
const packageJson = require('../package.json');

let projectName;/*项目名称*/

program.version(packageJson.version) /*版本*/
       .arguments('<project-directory>') /*项目目录，如果当前目录已存在，则将模板文件直接放入文件，不存在，则创建新目录，并置入模板*/
       .usage(` ${chalk.green('<project-directory>')} [options]`)
       .option('-g, --git','使用远程仓库模板')/*默认使用本地模板，如果带此参数，则使用远程模板文件*/
       .action(name => { /*注册一个回调，在运行时会传入当前命令携带参数*/
       		projectName = name;
       })
       .on('--help', () => {/*监听参数help*/
       		console.log(`    Only ${chalk.green('<project-directory>')} is required.`);
       })
       .parse(process.argv);/*将当前进程参数传入commander解析，看似无用，实则很关键的步骤，它是commander运行入口*/

if (!projectName) {  /* project-directory 必填，如果没有输入项目名称，则显示帮助信息并返回*/
  	program.help() 
	return;
}
console.log(process.cwd())
console.log(__dirname)
const list = fs.readdirSync(process.cwd());

if(list.length){/*如果当前目录不为空，需检查项目目录是否已存在*/
	if(list.filter((fileName)=>{
		const filePath = path.resolve(process.cwd(), path.join('.', fileName));
		return fileName === projectName && fs.statSync(filePath).isDirectory()
	}).length !== 0){//
		console.log('目录已存在');
	}else{
		console.log('目录不存在，需创建新目录');
		mkdir(projectName)
	}
}else{
	console.log('当前目录为空，需创建新目录');
	mkdir(projectName)
}

createApp(projectName,program.git);


function createApp(projectName,git){
	const root = path.resolve(projectName);
	const packageJson = {
	    name: projectName,
	    version: '0.1.0',
	    private: true,
  		scripts: {
    		start: "webpack-dev-server",
    		build: "webpack"
  		}
	  };
  	fs.writeFileSync(
	    path.join(root, 'package.json'),
	    JSON.stringify(packageJson, null, 2)
  	);
  	install()
  	if(!git){//直接copy本地模板

  	}
}


function install(){
	return new Promise(function(resolve,reject){
	 	let command = 'npm';
	    let args;
	    let devDependencies=['html-webpack-plugin', 'webpack-cli', 'webpack-dev-server'];/*此处模块根据自己需求写，当前只是一个小例子*/
      	args = [
	        'install',
	        '--save-dev',
	      ].concat(devDependencies);

	    console.log(
	        `Installing ${chalk.cyan(devDependencies[0])}, ${chalk.cyan(devDependencies[1])}, and ${chalk.cyan(devDependencies[2])}...This might take a couple of minutes.`
	      );
	    const child = spawn(command, args, { stdio: 'inherit',shell: process.platform === 'win32' });
	    child.on('close',function(){
	    	resolve();
	    })
	});

}

function mkdir(projectName){
	fs.mkdir(path.join('.', projectName))
}