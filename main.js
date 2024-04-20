const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')

let mainWindow
let nextApp = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      webSecurity: false,
    }
  })

  mainWindow.loadURL("http://localhost:3000")

  // mainWindow.webContents.openDevTools()
}

function startNextJs() {
  nextApp = spawn('node', ['.next/standalone/server.js'], { shell: true, env: process.env })
  nextApp.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })
  nextApp.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
  })
  nextApp.on('close', (code) => {
    console.log(`child process exited with code ${code}`)
  })
}

app.whenReady().then(() => {
  if (app.isPackaged) {
    console.log("Production server started")
    startNextJs()
  } else {
    console.log("Development server started")
  }
  createWindow()
})

app.on('before-quit', () => {
  if (nextApp !== null) {
    nextApp.kill();
  }
});

app.on('window-all-closed', () => {
  app.quit()
})
