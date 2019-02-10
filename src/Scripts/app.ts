const { ipcRenderer } = require('electron');
$(() => {
	Lib.AudioInitializer.init();

	$(document).on("click", "#btn-resize", event => {
		ipcRenderer.send('resize');
		ipcRenderer.on('reply', (event, arg) => {
			console.log(arg)
		});
	}).on("keydown", event => {
		// Press F12
		if (event.key === "F12") {
			ipcRenderer.send("showDevTools");
		}
	});
});

