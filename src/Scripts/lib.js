var ipcRenderer = require('electron').ipcRenderer;
var customTitlebar = require('custom-electron-titlebar');
// メインプロセス側のローカルファイルはelectron.remoteのfsを使う
// https://qiita.com/icbmuma/items/eb47fa03144c5fff9008
var path = require('path');
var electron = require('electron');
var fs = electron.remote.require('fs');
var appPath = path.dirname(electron.remote.app.getAppPath());
var settingFilePath = 'keysetting.json';
if (process.cwd() === '/') {
    settingFilePath = path.dirname(electron.remote.app.getAppPath()) + '/' + settingFilePath;
}
var keys = JSON.parse(fs.readFileSync(settingFilePath, 'utf-8')).keys;
var Lib;
(function (Lib) {
    /**
     * Audioオブジェクトのラッパー
     */
    var Player = /** @class */ (function () {
        function Player(volume) {
            this.audio = new Audio();
            this.audio.volume = volume;
        }
        Player.prototype.play = function (path) {
            this.audio.src = path;
            this.audio.play();
        };
        Player.prototype.pause = function () {
            this.audio.pause();
        };
        return Player;
    }());
    Lib.Player = Player;
    /**
     * スタイルの調整など
     */
    var Decorator = /** @class */ (function () {
        function Decorator() {
        }
        Decorator.toggleColor = function (selector) {
            $(selector).css("background-color", "grey");
            setTimeout(function () {
                $(selector).css("background-color", "#1e1e1e");
            }, 80);
        };
        /**
         * キー表示のトグル
         * @param show
         */
        Decorator.toggleShowKeyMap = function (show) {
            $(".label-asign").toggleClass("app-hidden", show);
        };
        /**
         * ボリューム変更
         * @param volume
         */
        Decorator.changeVolume = function (volume) {
            $(".volume-value").html(volume);
        };
        /**
         * ビューモード切替
         * @param viewMode
         */
        Decorator.toggleViewMode = function (viewMode) {
            var button = $("#btn-resize");
            var drum = $(".drum");
            if (viewMode === Lib.ViewMode.Full) {
                button
                    .attr("data-viewMode", Lib.ViewMode.Mini)
                    .text(Lib.ViewMode.Mini);
                Lib.IpcRenderer.resizeWindow(Lib.ViewMode.Full);
                drum.toggleClass("app-hidden", false);
            }
            else {
                button
                    .attr("data-viewMode", Lib.ViewMode.Full)
                    .text(Lib.ViewMode.Full);
                Lib.IpcRenderer.resizeWindow(Lib.ViewMode.Mini);
                drum.toggleClass("app-hidden", true);
            }
        };
        return Decorator;
    }());
    Lib.Decorator = Decorator;
    /**
     * Playerの初期化
     */
    var PlayerInitializer = /** @class */ (function () {
        function PlayerInitializer() {
        }
        PlayerInitializer.init = function () {
            $(document).on("keydown", function (event) {
                var volume = $(".volume-slider").val();
                var player = new Lib.Player(Number(volume));
                var setting = keys[event.keyCode];
                if (!setting) {
                    return;
                }
                player.play("Contents/Sounds/" + setting.fileName);
                Decorator.toggleColor(".drum-part-" + setting.map);
            }).on("input", ".volume-slider", function (event) {
                var value = $(event.currentTarget).val();
                Decorator.changeVolume(value.toString());
                $(".volume-value").html(value.toString());
                Storage.save(Component.Volume, value);
            }).on("click", "#checkbox-show-key-map", function (event) {
                Decorator.toggleShowKeyMap();
                Storage.save(Component.ShowKey, $(event.currentTarget).prop("checked"));
            });
        };
        return PlayerInitializer;
    }());
    Lib.PlayerInitializer = PlayerInitializer;
    /**
     *  localStorageを扱う
     */
    var Storage = /** @class */ (function () {
        function Storage() {
        }
        Storage.load = function () {
            Storage.loadShowKeyMap();
            Storage.loadVolume();
            Storage.loadViewMode();
        };
        Storage.save = function (type, value) {
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
        };
        Storage.loadShowKeyMap = function () {
            var showKeyMapString = localStorage[Storage.showKeyMapKey];
            if (showKeyMapString === undefined) {
                return;
            }
            var showKeyMap = showKeyMapString.toLowerCase() === "false";
            // key表示のトグル
            Decorator.toggleShowKeyMap(showKeyMap);
            // checkBoxのトグル
            $("#checkbox-show-key-map").prop("checked", !showKeyMap);
        };
        Storage.loadVolume = function () {
            var volume = localStorage[Storage.volumeKey];
            if (volume === undefined) {
                return;
            }
            $(".volume-slider").val(volume);
            $(".volume-value").text(volume);
        };
        Storage.loadViewMode = function () {
            var viewMode = localStorage[Storage.viewModeKey];
            if (viewMode === undefined) {
                return;
            }
            Decorator.toggleViewMode(viewMode);
        };
        Storage.showKeyMapKey = "showKeyMap";
        Storage.volumeKey = "volume";
        Storage.viewModeKey = "viewMode";
        return Storage;
    }());
    Lib.Storage = Storage;
    var SettingManager = /** @class */ (function () {
        function SettingManager() {
        }
        SettingManager.load = function () {
            for (var key in keys) {
                var setting = keys[key];
                var label = $("<label>").addClass("map label-setting-" + setting.map).text(setting.map);
                var keyInput = $("<input>").addClass("key key-setting-" + setting.map)
                    .attr("type", "text")
                    .val(setting.key);
                var keyCodeInput = $("<input>").addClass("keycode keycode-setting-" + setting.map)
                    .attr("type", "hidden")
                    .val(key)
                    .prop("disabled", true);
                var fileNameInput = $("<input>").addClass("filename filename-setting-" + setting.map)
                    .attr("type", "text")
                    .val(setting.fileName)
                    .prop("disabled", true);
                var wrapper = $("<div>").addClass("setting").append(label, keyInput, keyCodeInput, fileNameInput);
                $(".side").append(wrapper);
            }
        };
        SettingManager.save = function () {
            var setting = {};
            $(".setting").each(function (index, element) {
                var map = $(element).find(".map").text();
                var key = $(element).find(".key").val();
                var keyCode = $(element).find(".keycode").val();
                var fileName = $(element).find(".filename").val();
                setting[keyCode] = {
                    key: key, fileName: fileName, map: map
                };
            });
            var data = JSON.stringify({
                "keys": setting
            }, null, "	");
            fs.writeFileSync("keysetting.json", data);
            alert("saved");
        };
        return SettingManager;
    }());
    Lib.SettingManager = SettingManager;
    /**
     * 構成要素
     */
    var Component;
    (function (Component) {
        Component[Component["ShowKey"] = 0] = "ShowKey";
        Component[Component["Volume"] = 1] = "Volume";
        Component[Component["ViewMode"] = 2] = "ViewMode";
    })(Component = Lib.Component || (Lib.Component = {}));
    /**
     * ビューモード
     */
    var ViewMode;
    (function (ViewMode) {
        ViewMode["Full"] = "full";
        ViewMode["Mini"] = "mini";
    })(ViewMode = Lib.ViewMode || (Lib.ViewMode = {}));
    /**
     * メインプロセスとの通信
     */
    var IpcRenderer = /** @class */ (function () {
        function IpcRenderer() {
        }
        IpcRenderer.resizeWindow = function (viewMode) {
            // メインプロセスに通知
            ipcRenderer.send('resize', viewMode);
        };
        IpcRenderer.openDevTools = function () {
            ipcRenderer.send("showDevTools");
        };
        return IpcRenderer;
    }());
    Lib.IpcRenderer = IpcRenderer;
    /**
     * ウィンドウの初期化
     */
    var WindowInitializer = /** @class */ (function () {
        function WindowInitializer() {
        }
        WindowInitializer.init = function () {
            new customTitlebar.Titlebar({
                backgroundColor: customTitlebar.Color.fromHex('#444')
            });
        };
        return WindowInitializer;
    }());
    Lib.WindowInitializer = WindowInitializer;
})(Lib || (Lib = {}));
