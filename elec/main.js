/*
 * @Author: your name
 * @Date: 2022-02-12 07:54:37
 * @LastEditTime: 2022-02-12 08:06:10
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /antd-demo-ts/elec/main.ts
 */
const { app, BrowserWindow} = require('electron');
const path = require("path");
let mainWindow;
function createWindow() {  //创建一个新窗口
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 750
    });
    mainWindow.webContents.openDevTools() // 打开窗口调试
    // mainWindow.maximize();	//窗口最大化
    mainWindow.on('closed', function () {	//窗口关闭方法
        mainWindow = null
    });
    // mainWindow.loadURL(`file://${__dirname}/build/index.html`);	//窗口主文件地址
    mainWindow.loadFile('build/index.html');
    // mainWindow.loadURL('http://localhost:3000/');
}
 
//以下就是类似于app的生命周期的方法
 
app.on('ready', () => {
    createWindow();
});
 
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
 
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});