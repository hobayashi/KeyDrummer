const { ipcRenderer } = require('electron');
const customTitlebar = require('custom-electron-titlebar');
// メインプロセス側のローカルファイルはelectron.remoteのfsを使う
// https://qiita.com/icbmuma/items/eb47fa03144c5fff9008
const path = require('path');
const electron = require('electron');
const fs = electron.remote.require('fs');
const appPath = path.dirname(electron.remote.app.getAppPath());
let settingFilePath = 'keysetting.json';
if (process.cwd() === '/') {
    settingFilePath = path.dirname(electron.remote.app.getAppPath()) + '/' + settingFilePath;
}
var Lib;
(function (Lib) {
    /**
     * Audioオブジェクトのラッパー
     */
    class Player {
        constructor(volume) {
            this.audio = new Audio();
            this.audio.volume = volume;
        }
        play(path) {
            this.audio.src = path;
            this.audio.play();
        }
        get currentTime() {
            return this.audio.currentTime;
        }
        stop() {
            this.audio.currentTime = 0;
            this.audio.pause();
        }
    }
    Lib.Player = Player;
    /**
     * スタイルの調整など
     */
    class Decorator {
        constructor(ipcRenderer) {
            this.ipcRenderer = ipcRenderer;
        }
        toggleColor(selector) {
            $(selector).css("background-color", "grey");
            setTimeout(() => {
                $(selector).css("background-color", "#1e1e1e");
            }, 80);
        }
        /**
         * キー表示のトグル
         * @param show
         */
        toggleShowKeyMap(show) {
            $(".label-asign").toggleClass("app-hidden", show);
        }
        /**
         * ボリューム変更
         * @param volume
         */
        changeVolume(volume) {
            $(".volume-value").html(Number(volume).toFixed(1));
        }
        /**
         * ビューモード切替
         * @param viewMode
         */
        toggleViewMode(viewMode) {
            const button = $("#btn-resize");
            const drum = $(".drum");
            const side = $(".side");
            if (viewMode === Lib.ViewMode.Full) {
                button
                    .attr("data-viewMode", Lib.ViewMode.Mini)
                    .text(Lib.ViewMode.Mini);
                this.ipcRenderer.resizeWindow(Lib.ViewMode.Full);
                drum.toggleClass("app-hidden", false);
                side.toggleClass("app-hidden", false);
            }
            else {
                button
                    .attr("data-viewMode", Lib.ViewMode.Full)
                    .text(Lib.ViewMode.Full);
                this.ipcRenderer.resizeWindow(Lib.ViewMode.Mini);
                drum.toggleClass("app-hidden", true);
                side.toggleClass("app-hidden", true);
            }
        }
    }
    Lib.Decorator = Decorator;
    /**
     * Playerの初期化
     */
    class PlayerInitializer {
        constructor(decorator, storage) {
            this.decorator = decorator;
            this.storage = storage;
            this.sustain = 2000;
        }
        init() {
            const keys = JSON.parse(fs.readFileSync(settingFilePath, 'utf-8')).keys;
            $(document).on("keydown", event => {
                const volume = $(".volume-slider").val();
                const player = new Lib.Player(Number(volume));
                const setting = keys[event.keyCode];
                if (!setting) {
                    return;
                }
                player.play(`Contents/Sounds/${setting.fileName}`);
                this.decorator.toggleColor(`.drum-part-${setting.map}`);
                setTimeout(() => {
                    player.stop();
                }, this.sustain);
            }).on("input", ".volume-slider", event => {
                const value = $(event.currentTarget).val();
                this.decorator.changeVolume(value);
                this.storage.save(Component.Volume, value);
            }).on("click", "#checkbox-show-key-map", event => {
                this.decorator.toggleShowKeyMap();
                this.storage.save(Component.ShowKey, $(event.currentTarget).prop("checked"));
            });
        }
    }
    Lib.PlayerInitializer = PlayerInitializer;
    /**
     *  localStorageを扱う
     */
    class Storage {
        constructor(decorator) {
            this.decorator = decorator;
        }
        load() {
            this.loadShowKeyMap();
            this.loadVolume();
            this.loadViewMode();
        }
        save(type, value) {
            switch (type) {
                case Component.ShowKey:
                    localStorage[Storage.showKeyMapKey] = value;
                    break;
                case Component.Volume:
                    localStorage[Storage.volumeKey] = value;
                    break;
                case Component.ViewMode:
                    localStorage[Storage.viewModeKey] = value;
                default:
                    break;
            }
        }
        loadShowKeyMap() {
            const showKeyMapString = localStorage[Storage.showKeyMapKey];
            if (showKeyMapString === undefined) {
                return;
            }
            const showKeyMap = showKeyMapString.toLowerCase() === "false";
            // key表示のトグル
            this.decorator.toggleShowKeyMap(showKeyMap);
            // checkBoxのトグル
            $("#checkbox-show-key-map").prop("checked", !showKeyMap);
        }
        loadVolume() {
            const volume = localStorage[Storage.volumeKey];
            if (volume === undefined) {
                return;
            }
            $(".volume-slider").val(volume);
            this.decorator.changeVolume(volume);
        }
        loadViewMode() {
            const viewMode = localStorage[Storage.viewModeKey];
            if (viewMode === undefined) {
                return;
            }
            this.decorator.toggleViewMode(viewMode);
        }
    }
    Storage.showKeyMapKey = "showKeyMap";
    Storage.volumeKey = "volume";
    Storage.viewModeKey = "viewMode";
    Lib.Storage = Storage;
    class SettingManager {
        load() {
            const keys = JSON.parse(fs.readFileSync(settingFilePath, 'utf-8')).keys;
            for (const key in keys) {
                const keys = JSON.parse(fs.readFileSync(settingFilePath, 'utf-8')).keys;
                const setting = keys[key];
                const label = $("<label>").addClass(`map label-setting-${setting.map}`).text(setting.map);
                const keyInput = $("<input>").addClass(`key key-setting-${setting.map}`)
                    .attr("type", "text")
                    .val(setting.key);
                const keyCodeInput = $("<input>").addClass(`keycode keycode-setting-${setting.map}`)
                    .attr("type", "hidden")
                    .val(key)
                    .prop("disabled", true);
                const fileNameInput = $("<input>").addClass(`filename filename-setting-${setting.map}`)
                    .attr("type", "text")
                    .val(setting.fileName)
                    .prop("disabled", true);
                const wrapper = $("<div>").addClass("setting").append(label, keyInput, keyCodeInput, fileNameInput);
                $(".side").append(wrapper);
            }
        }
        save() {
            let setting = {};
            $(".setting").each((index, element) => {
                const map = $(element).find(".map").text();
                const key = $(element).find(".key").val();
                const keyCode = $(element).find(".keycode").val();
                const fileName = $(element).find(".filename").val();
                setting[keyCode] = {
                    key, fileName, map
                };
            });
            const data = JSON.stringify({
                "keys": setting
            }, null, "	");
            fs.writeFileSync("keysetting.json", data);
            alert("saved");
        }
    }
    Lib.SettingManager = SettingManager;
    /**
     * 構成要素
     */
    let Component;
    (function (Component) {
        Component[Component["ShowKey"] = 0] = "ShowKey";
        Component[Component["Volume"] = 1] = "Volume";
        Component[Component["ViewMode"] = 2] = "ViewMode";
    })(Component = Lib.Component || (Lib.Component = {}));
    /**
     * ビューモード
     */
    let ViewMode;
    (function (ViewMode) {
        ViewMode["Full"] = "full";
        ViewMode["Mini"] = "mini";
    })(ViewMode = Lib.ViewMode || (Lib.ViewMode = {}));
    /**
     * メインプロセスとの通信
     */
    class IpcRenderer {
        resizeWindow(viewMode) {
            // メインプロセスに通知
            ipcRenderer.send('resize', viewMode);
        }
        openDevTools() {
            ipcRenderer.send("showDevTools");
        }
    }
    Lib.IpcRenderer = IpcRenderer;
    /**
     * ウィンドウの初期化
     */
    class WindowInitializer {
        init() {
            new customTitlebar.Titlebar({
                backgroundColor: customTitlebar.Color.fromHex('#444')
            });
        }
    }
    Lib.WindowInitializer = WindowInitializer;
})(Lib || (Lib = {}));
//# sourceMappingURL=lib.js.map