$(() => {
    // 設定画面DOM作成
    const settingManager = new Lib.SettingManager();
    settingManager.load();
    const ipcRenderer = new Lib.IpcRenderer();
    const decorator = new Lib.Decorator(ipcRenderer);
    // localStorageから設定の復元
    const storage = new Lib.Storage(decorator);
    storage.load();
    // タイトルバーをいい感じに
    const windowInitialize = new Lib.WindowInitializer();
    windowInitialize.init();
    // Playerの初期化
    const playerInitializer = new Lib.PlayerInitializer(decorator, storage);
    playerInitializer.init();
    $(document).on("click", "#btn-resize", event => {
        // button要素にフル表示/ミニ表示かの状態を保持
        const viewMode = $(event.currentTarget).attr("data-viewMode");
        decorator.toggleViewMode(viewMode);
        storage.save(Lib.Component.ViewMode, viewMode);
    }).on("keydown", event => {
        // F12でDevTools表示
        if (event.key === "F12") {
            ipcRenderer.openDevTools();
        }
        // Tabキーによるフォーカスを無効化
        if (event.key === "Tab") {
            return false;
        }
    }).on("click", "#setting", event => {
        // キー設定画面表示
        const $target = $(".side");
        if ($target.hasClass("hide")) {
            $target.animate({ "right": "0px" });
        }
        else {
            $target.animate({ "right": "-350px" });
        }
        $target.toggleClass("hide");
    }).on("click", ".setting-save", event => {
        // キー設定保存
        settingManager.save();
        playerInitializer.init();
    }).on("keydown", ".setting > .key", event => {
        $(event.currentTarget).val(event.key);
        $(event.currentTarget).siblings(".keycode").val(event.keyCode);
        return false;
    });
});
//# sourceMappingURL=app.js.map