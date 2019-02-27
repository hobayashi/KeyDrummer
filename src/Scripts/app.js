$(() => {
    Lib.AudioInitializer.init();
    Lib.Storage.load();
    $(document).on("click", "#btn-resize", event => {
        // button要素にフル表示/ミニ表示かの状態を保持
        const isExpand = $(event.currentTarget).attr("data-isExpand").toLowerCase() === "true";
        $(event.currentTarget).attr("data-isExpand", (!isExpand).toString());
        // ボタンのテキスト変更
        isExpand ? $(event.currentTarget).text("Full")
            : $(event.currentTarget).text("Mini");
        // メインプロセスに通知
        Lib.IpcRenderer.resizeWindow(!isExpand);
        // drum表示/非表示
        $(".drum").toggleClass("app-hidden");
    }).on("keydown", event => {
        // F12でDevTools表示
        if (event.key === "F12") {
            Lib.IpcRenderer.openDevTools();
        }
    });
});
//# sourceMappingURL=app.js.map