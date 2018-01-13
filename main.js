const electron      = require('electron');
const app           = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu          = electron.Menu;
const ipcMain       = electron.ipcMain;
let   fs            = require('fs');
let   csv           = require('comma-separated-values');

// キャラクター選択画面の設定
let C_W = 800;
let C_H = 500;
// 各ディレクトリパス
let DIR_IMG = __dirname + '/images/';
let DIR_FILE =  __dirname+'/file/';
let menuWindow;
let characterWindow = [];
// キャラクター初期移動方向
let CHAR_DIRECT = 'LEFT';
app.on('ready', function() {
  createMenuWindow();
});
function createMenuWindow(){
    menuWindow = new BrowserWindow({
    width:C_W,
    height:C_H,
    frame:false,
    resizable: false,
  });
  menuWindow.loadURL('file://' + __dirname + '/html/menu.html');
  menuWindow.on('closed', function () {
    menuWindow = null;
  })
  //menuWindow.webContents.openDevTools();
  menuWindow.webContents.on('did-finish-load',function(){
    var csvFilePathList = getCsvFilePathList();
    var csvDataList = [];
    for (var i = 0; i < csvFilePathList.length; i++) {
      var csvData = readCsvFile(csvFilePathList[i])[0];
      var imgPath = DIR_IMG + csvData['filename'];
      if(!isExistFile(imgPath)) {
        continue;
      }
      csvData['path'] = imgPath;
      csvDataList.push(csvData);
    }
    menuWindow.webContents.send('csvDataList', csvDataList);
  });
}
// メニュー設定
function installMenu() {
  // MacOS
  if(process.platform == 'darwin') {
    menu = Menu.buildFromTemplate([
      {
        label: 'Electron',
        submenu: [
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function() { app.quit(); }
          },
        ]
      },
      {
        label: 'Add',
        submenu : [
          {
            label: 'Character',
            accelerator:'Command+A',
            click:function() {createMenuWindow();}
          },
        ]
      }
    ]);
    Menu.setApplicationMenu(menu);
  } else {
    menu = Menu.buildFromTemplate([
      {
        label: 'Add',
        submenu : [
          {
            label: 'Character',
            accelerator:'Command+A',
            click:function() {createMenuWindow();}
          },
        ]
      }
    ]);
    menuWindow.setMenu(menu);
  }
}
function isExistFile(file) {
  try {
    fs.statSync(file);
    return true
  } catch(err) {
    if(err.code === 'ENOENT') return false
  }
}
function getImgPathList() {
  var imgPathList     = [];
  var tmpImgFileList  = fs.readdirSync(DIR_IMG);
  for (var i = 0; i < tmpImgFileList.length; i++) {
    var name = tmpImgFileList[i].match(/.*\.png$/);
    if(name) {
      imgPathList.push(DIR_IMG + name[0]);
    }
  }
  imgPathList.sort();
  return imgPathList;
}
function getCsvFilePathList() {
  var csvFilePathList = [];
  var tmpFileList = fs.readdirSync(DIR_FILE);
  //csv以外は除去
  for(var i=0;i<tmpFileList.length;i++) {
    var name = tmpFileList[i].match(/.*\.csv$/);
    if(name) {
      csvFilePathList.push(DIR_FILE + name[0]);
    }
  }
  csvFilePathList.sort();
  return csvFilePathList;
}
function readCsvFile(filePath) {
  var text = fs.readFileSync(filePath,'utf-8');
  var result = new csv(text, {header : true}).parse();
  return result;
}
function onExit(){
  app.quit();
}
exports.getScreenInfo = function() {
	var screen = electron.screen;
  return screen.getPrimaryDisplay();
}
exports.closeMenu = function() {
  menuWindow.close();
}
exports.createCharacterWindow = function(src) {
  var name = src.match(/(.*)\.png$/)[1].split('/');
  name = name[name.length-1];
  var csv = readCsvFile(DIR_FILE + name + '.csv')[0];
  csv['src'] = src;
  csv['direct'] = CHAR_DIRECT;
  var screen = electron.screen.getPrimaryDisplay();
  let mainWindow = new BrowserWindow({
    width:csv['width'],
    height:csv['height'],
    x:screen.size.width - csv['width'],
    y:screen.size.height - csv['height'],
    transparent:true,
    frame:false,
    resizable: false,
    alwaysOnTop: true
  });
  mainWindow.loadURL('file://' + __dirname + '/html/index.html');
  //mainWindow.webContents.openDevTools();
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
  mainWindow.webContents.on('did-finish-load',function(){
    mainWindow.webContents.send('csvData', csv);
  });
  installMenu();
}
