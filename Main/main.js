const electron = require('electron');
const app = electron.app;
const ipc = electron.ipcMain;
const { Menu, MenuItem, ipcMain } = require('electron')
const BrowserWindow = electron.BrowserWindow;
const fs = require("fs");
const DiscordRPC = require('discord-rpc');

if(!fs.existsSync("cssthemes")) {
    fs.mkdirSync("cssthemes");
}

let loadingWin, mainWin, aboutWin, raceWin;

const getMenuItemById = (items, id) => {
    if (items instanceof Menu) {
        items = items.items;
    }
    let found = items.find(item => item.id === id) || false;
    for (let i = 0, length = items.length; !found && i < length; i++) {
        if (items[i].submenu) {
            found = getMenuItemById(items[i].submenu, id);
        }
    }
    return found;
};

function loader() {
    loadingWin = new BrowserWindow(
        {
            frame: false,
            // resizable: false,
            width: 400,
            height: 400,
            icon: 'typeracer.ico',
            webPreferences: {
                nodeIntegration: true,
            }
        }
    );

    loadingWin.loadFile("loader.html")

    ipc.on('openLoad', (event, args) => {
        if(args == 'window') {
            createWindow();
        }
    })

    // createWindow()
}

function createWindow() {

    var status = "Idle";

    // Only needed if you want to use spectate, join, or ask to join
    DiscordRPC.register(clientId);

    const startTimestamp = new Date();

    async function setActivity() {
        if (!rpc || !mainWin) {
            return;
        }

        rpc.setActivity({
            details: status,
            startTimestamp,
            largeImageKey: 'rpcphoto',
            instance: false,
        });
    }

    // Action variables
    InvertColorsAction = getMenuItemById(menuTemplate, 'invertcolorsFunc');

    // Main window
    mainWin = new BrowserWindow(
        {
            icon: 'typeracer.ico',
            webPreferences: {
                nodeIntegration: true,
            }
        }
    );

    mainWin.loadURL("https://play.typeracer.com");

    mainWin.setTitle("TypeRacer")

    // mainWin.loadHTML("hello-world.html") // I wish I had this because I wouldn't have had to make a seperate HTML file :(

    mainWin.webContents.on('did-finish-load', () => {
        // Currently testing for next feature
        mainWin.webContents.executeJavaScript(`
        
        `)

    })

    mainWin.on('closed', () => {
        setInterval (() => {
            try { mainWin.webContents.executeJavaScript("close();") } catch {}
            try { aboutWin.webContents.executeJavaScript("close();") } catch {}
            try { raceWin.webContents.executeJavaScript("close();") } catch {}
        }, 5)
    })

    mainWin.webContents.openDevTools();

    // Commands here get executed every 2 seconds

    setInterval(() => {
        try {
            mainWin.webContents.executeJavaScript("require('./renderer.js');")
        } catch {}
    }, 2000);

    ipc.on('getHtml', (event, args) => {
        if (args.includes("change display format")) {
            status = "In a race";
        } else {
            status = "Idle";
        }
    });
    ipc.on('raceLink', (event, args) => {
        if (args.includes("Received click.")) {
            const splitArgs = args.split("Received click. LINK:");
            // console.log("window.location.href = " + splitArgs[1] + splitArgs[2] + ";");
            mainWin.webContents.executeJavaScript("window.location.href = '" + splitArgs[1] + splitArgs[2] + "';");
        }
    });
    // Updates the Discord Rich Presence every 1 second

    rpc.on('ready', () => {
        setActivity();

        // activity can only be set every 15 seconds
        setInterval(() => {
            setActivity();
        }, 1000);
    });

    setInterval(() => {
        try {
            mainWin.webContents.executeJavaScript(`
        if (window.location.href.includes("typeracer.com")) {
            var domain = window.location.href.split("/");
            if (!domain[0] == "play.typeracer.com" || !domain[0] == "data.typeracer.com") {
                window.location.href = "https://play.typeracer.com";
            }
        } else {
            window.location.href = "https://play.typeracer.com";
        }
        `)
        } catch {}
    }, 300);
}
const template = [
    {
        label: 'Features',
        submenu: [
            {
                label: 'Invert Colors',
                type: 'checkbox',
                click(item) {
                    if(item.checked) {
                        mainWin.webContents.insertCSS("body{ filter: invert(1) }");
                    } else {
                        mainWin.webContents.insertCSS("body{ filter: invert(0) }");
                    }
                }
            },
            {
                label: 'Set a race link',
                click(item) {
                    try {raceWin.focus()} catch {
                        raceWin = new BrowserWindow(
                        {
                            icon: 'typeracer.ico',
                            webPreferences: {
                                nodeIntegration: true,
                            }
                        }
                    );
                        setInterval(() => {
                            try { raceWin.webContents.executeJavaScript("require('./renderer.js');") } catch {}
                        }, 2000);
                        raceWin.setTitle("TypeRacer")
                        raceWin.removeMenu()
                        raceWin.loadFile(__dirname + "/racelink.html")
                    }
                },
                id: 'getRaceLinkFunc'
            },
            {
                label: 'Disable keyboard input',
                click(item) {
                    if (item.checked) {
                        mainWin.webContents.executeJavaScript(`
                            document.onkeydown = function(e) {
					            e.preventDefault();
				            }
                        `)
                    } else {
                        mainWin.webContents.executeJavaScript(`
                            document.onkeydown = function(e) {
					            event.returnValue = true;
				            }
                        `)
                    }
                },
                type: 'checkbox'
            }
        ]
    },

    {
        label: 'Options',
        submenu: [
            /*{
                label: 'Show WPM/CPM in Discord',
                click(item) {
                    
                },
                type: 'checkbox'
            },
            {
                type: 'separator'
            },*/
            {
                role: 'reload'
            },
            {
                role: 'close'
            },
            {
                type: 'separator'
            },
            {
                role: 'resetzoom'
            },
            {
                role: 'zoomin'
            },
            {
                role: 'zoomout'
            },
            {
                type: 'separator'
            },
            {
                role: 'togglefullscreen'
            }
        ]
    },

    {
        role: 'Help',
        submenu: [
            {
                label: 'About',

                click(item) {
                    try {aboutWin.focus()} catch {
                        aboutWin = new BrowserWindow(
                            {
                                icon: 'typeracer.ico',
                                webPreferences: {
                                    nodeIntegration: true
                                }
                            }
                        );
                        aboutWin.setTitle("TypeRacer")
                        aboutWin.menuBarVisible = false;
                        aboutWin.loadFile(__dirname + "/about.html")
                    }
                }
            }
        ]
    }
]

const menuTemplate = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menuTemplate)

// Set this to your Client ID.n
const clientId = '781895383436754965';
const rpc = new DiscordRPC.Client({ transport: 'ipc' });
rpc.login({ clientId }).catch(console.error)

app.on('ready', loader)