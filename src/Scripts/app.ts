$(() => {
	Lib.AudioInitializer.init();
	Lib.Storage.load();

	$(document).on("click", "#btn-resize", event => {
		// button要素にフル表示/ミニ表示かの状態を保持
		const viewMode = $(event.currentTarget).attr("data-viewMode");
		if (viewMode === Lib.ViewMode.Full) {
			$(event.currentTarget)
				.attr("data-viewMode", Lib.ViewMode.Mini)
				.text(Lib.ViewMode.Full);
			Lib.IpcRenderer.resizeWindow(Lib.ViewMode.Mini);
		} else {
			$(event.currentTarget).attr("data-viewMode", Lib.ViewMode.Full).text(Lib.ViewMode.Mini);
			Lib.IpcRenderer.resizeWindow(Lib.ViewMode.Full);
		}

		// drum表示/非表示
		$(".drum").toggleClass("app-hidden");

	}).on("keydown", event => {
		// F12でDevTools表示
		if (event.key === "F12") {
			Lib.IpcRenderer.openDevTools();
		}
	});
});

