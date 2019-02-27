// アプリケーション作成用のモジュールを読み込み
const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

// メインウィンドウ
let mainWindow;

// ウィンドウサイズ
const windowSize = {
	width: 490,
	height: 600
};

function createWindow() {
	// メインウィンドウを作成します
	mainWindow = new BrowserWindow({
		titleBarStyle: "customButtonsOnHover",
		width: windowSize.width,
		height: windowSize.height,
		// webPreferences: {
		// 	// jqueryを使う
		// 	// https://qiita.com/pirosikick/items/72d11a8578c5c3327069
		// 	nodeIntegration: false
		// }
	});

	// メインウィンドウに表示するURLを指定します
	// （今回はmain.jsと同じディレクトリのindex.html）
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	// メインウィンドウが閉じられたときの処理
	mainWindow.on('closed', () => {
		mainWindow = null;
	});
}

//  初期化が完了した時の処理
app.on('ready', createWindow);

// 全てのウィンドウが閉じたときの処理
app.on('window-all-closed', () => {
	// macOSのとき以外はアプリケーションを終了させます
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
// アプリケーションがアクティブになった時の処理(Macだと、Dockがクリックされた時）
app.on('activate', () => {
	// メインウィンドウが消えている場合は再度メインウィンドウを作成する
	if (mainWindow === null) {
		createWindow();
	}
});

// IPC（レンダープロセスから通知される）
ipcMain.on('resize', (event, mode) => {
	if (mode === "full") {
		// フル表示
		mainWindow.setSize(windowSize.width, windowSize.height);
		return;
	}
	if (mode === "mini") {
		// ミニ表示
		mainWindow.setSize(windowSize.width, 150);
		return;
	}
}).on('showDevTools', event => {
	// デベロッパーツールの起動
	mainWindow.webContents.openDevTools();
});
