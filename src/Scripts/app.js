$(() => {
    // タイトルバーをいい感じに
    Lib.WindowInitializer.init();
    // Playerの初期化
    Lib.PlayerInitializer.init();
    // localStorageから設定の復元
    Lib.Storage.load();
    $(document).on("click", "#btn-resize", event => {
        // button要素にフル表示/ミニ表示かの状態を保持
        const viewMode = $(event.currentTarget).attr("data-viewMode");
        Lib.Decorator.toggleViewMode(viewMode);
        Lib.Storage.save(Lib.Component.ViewMode, viewMode);
    }).on("keydown", event => {
        // F12でDevTools表示
        if (event.key === "F12") {
            Lib.IpcRenderer.openDevTools();
        }
    }).on("click", "#setting", event => {
        const $target = $(".side");
        if ($target.hasClass("hide")) {
            $target.animate({ "right": "0px" });
        }
        else {
            $target.animate({ "right": "-300px" });
        }
        $target.toggleClass("hide");
    }).on("keydown", ".setting-crash", event => {
        $(event.currentTarget).val(event.key);
        $(event.currentTarget).attr("data-keyCode", event.keyCode);
        return false;
    }).on("click", ".setting-save", event => {
        // const key = $(".setting-crash").val();
        alert();
    });
});
//# sourceMappingURL=app.js.map