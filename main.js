// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')
const {ipcMain} = require('electron')
const fs = require('fs')
//require('@electron/remote/main').initialize()

if (handleSquirrelEvent(app)) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, hiddenWindow;

function createWindow() {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  //createHiddenWindow();

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    hiddenWindow = null
    if (process.platform !== 'darwin') app.quit()
    
    //let deathDifficulties = remote.getGlobal('deathDifficulties');
    //let deathBosses = remote.getGlobal('deathBosses');
    //let hardMode = remote.getGlobal('hardMode');
    
    /*
    if(global.myGlobalVariable){

      fs.truncate('lib/SavedData.txt', 0, function(){console.log('done')})
              
      fs.appendFile("lib/SavedData.txt", global.myGlobalVariable, function (err) {
          if (err) return console.error(err);
          else{
             console.log("The file is updated with the given data")
          }
      });
    }
    */
    
  })
}

function createHiddenWindow(){

  hiddenWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  hiddenWindow.loadFile('audio.html')
  hiddenWindow.webContents.openDevTools()  
}

// Event handler for asynchronous incoming messages
ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg)

  // Event emitter for sending asynchronous messages
  if(arg.slice(-4) == '.wav') event.returnValue = arg
})


ipcMain.on( "setMyGlobalVariable", ( event, myGlobalVariableValue ) => {
  global.myGlobalVariable = myGlobalVariableValue;
} );

/*
// Event handler for synchronous incoming messages
ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg) 

  // Synchronous event emmision
  event.returnValue = 'sync pong'
})
*/

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
function handleSquirrelEvent(application) {

  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');
  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);
  
  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {
        detached: true
      });
    } catch (error) {}
      return spawnedProcess;
    };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
  case '--squirrel-install':
  case '--squirrel-updated':

  // Optionally do things such as:
  // - Add your .exe to the PATH
  // - Write to the registry for things like file associations and
  //   explorer context menus
  // Install desktop and start menu shortcuts
  spawnUpdate(['--createShortcut', exeName]);
  setTimeout(application.quit, 1000);
  return true;
  case '--squirrel-uninstall':
  // Undo anything you did in the --squirrel-install and
  // --squirrel-updated handlers
  // Remove desktop and start menu shortcuts
  spawnUpdate(['--removeShortcut', exeName]);
  setTimeout(application.quit, 1000);
  return true;
  case '--squirrel-obsolete':
  // This is called on the outgoing version of your app before
  // we update to the new version - it's the opposite of
  // --squirrel-updated
  application.quit();
  return true;
  }
};