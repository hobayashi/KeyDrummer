const { ipcRenderer } = require('electron');
var Lib;
(function (Lib) {
    /**
     * Audioオブジェクトのラッパー
     */
    class AudioWrapper {
        constructor(volume) {
            this.audioElem = new Audio();
            this.audioElem.volume = volume;
        }
        playSound(path) {
            this.audioElem.src = path;
            this.audioElem.play();
        }
        stopSound() {
            this.audioElem.pause();
        }
    }
    Lib.AudioWrapper = AudioWrapper;
    /**
     * スタイルの調整など
     */
    class Decorator {
        static toggleColor(selector) {
            $(selector).css("background-color", "grey");
            setTimeout(() => {
                $(selector).css("background-color", "#1e1e1e");
            }, 80);
        }
        /**
         * キー表示のトグル
         * @param show
         */
        static toggleShowKeyMap(show) {
            $(".label-asign").toggleClass("app-hidden", show);
        }
        /**
         * ボリューム変更
         * @param volume
         */
        static changeVolume(volume) {
            $(".volume-value").html(volume);
        }
        /**
         * ビューモード切替
         * @param viewMode
         */
        static toggleViewMode(viewMode) {
            const button = $("#btn-resize");
            const drum = $(".drum");
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
        }
    }
    Lib.Decorator = Decorator;
    /**
     * Audioの初期化
     */
    class AudioInitializer {
        static init() {
            $(document).on("keydown", event => {
                console.log(event.keyCode);
                const audio = new Lib.AudioWrapper(Number($(".volume-value").html()));
                switch (event.keyCode) {
                    case 66: //b
                        audio.playSound("Contents/Sounds/Kick08.wav");
                        Decorator.toggleColor(".drum-part-left-pedal");
                        break;
                    case 72: //h
                        audio.playSound("Contents/Sounds/Kick08.wav");
                        Decorator.toggleColor(".drum-part-right-pedal");
                        break;
                    case 32: //space
                        audio.playSound("Contents/Sounds/Crash Cymbal-R06.wav");
                        Decorator.toggleColor(".drum-part-crash");
                        break;
                    case 65: //a
                        audio.playSound("Contents/Sounds/OHH Edge03.wav");
                        Decorator.toggleColor(".drum-part-highhat");
                        break;
                    case 88: //x
                        audio.playSound("Contents/Sounds/Snare OR07.wav");
                        Decorator.toggleColor(".drum-part-snare");
                        break;
                    case 86: //v
                        audio.playSound("Contents/Sounds/Snare OR07.wav");
                        Decorator.toggleColor(".drum-part-snare");
                        break;
                    case 90: //z
                    case 67: //c
                        audio.playSound("Contents/Sounds/CHH Edge06.wav");
                        Decorator.toggleColor(".drum-part-highhat");
                        break;
                    case 16: //shift
                        audio.playSound("Contents/Sounds/China Cymbal04.wav");
                        Decorator.toggleColor(".drum-part-china");
                        break;
                    case 84: //t
                    case 71: //g
                        audio.playSound("Contents/Sounds/Floor Tom09.wav");
                        Decorator.toggleColor(".drum-part-low-tom");
                        break;
                    case 70: //f
                    case 82: //r
                        audio.playSound("Contents/Sounds/Mid Tom05.wav");
                        Decorator.toggleColor(".drum-part-middle-tom");
                        break;
                    case 68: //d
                    case 69: //e
                        audio.playSound("Contents/Sounds/High Tom08.wav");
                        Decorator.toggleColor(".drum-part-high-tom");
                        break;
                    case 83: //s
                        audio.playSound("Contents/Sounds/Ride Cymbal-Tip05.wav");
                        Decorator.toggleColor(".drum-part-middle-tom");
                        break;
                }
            }).on("input", ".volume-slider", event => {
                const value = $(event.currentTarget).val();
                Decorator.changeVolume(value.toString());
                $(".volume-value").html(value.toString());
                Storage.save(Component.Volume, value);
            }).on("click", "#checkbox-show-key-map", event => {
                Decorator.toggleShowKeyMap();
                Storage.save(Component.ShowKey, $(event.currentTarget).prop("checked"));
            });
        }
    }
    Lib.AudioInitializer = AudioInitializer;
    /**
     *  localStorageを扱う
     */
    class Storage {
        static load() {
            Storage.loadShowKeyMap();
            Storage.loadVolume();
            Storage.loadViewMode();
        }
        static save(type, value) {
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
        static loadShowKeyMap() {
            const showKeyMapString = localStorage[Storage.showKeyMapKey];
            if (showKeyMapString === undefined) {
                return;
            }
            const showKeyMap = showKeyMapString.toLowerCase() === "false";
            // key表示のトグル
            Decorator.toggleShowKeyMap(showKeyMap);
            // checkBoxのトグル
            $("#checkbox-show-key-map").prop("checked", !showKeyMap);
        }
        static loadVolume() {
            const volume = localStorage[Storage.volumeKey];
            if (volume === undefined) {
                return;
            }
            $(".volume-slider").val(volume);
            $(".volume-value").text(volume);
        }
        static loadViewMode() {
            const viewMode = localStorage[Storage.viewModeKey];
            if (viewMode === undefined) {
                return;
            }
            Decorator.toggleViewMode(viewMode);
        }
    }
    Storage.showKeyMapKey = "showKeyMap";
    Storage.volumeKey = "volume";
    Storage.viewModeKey = "viewMode";
    Lib.Storage = Storage;
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
        static resizeWindow(viewMode) {
            // メインプロセスに通知
            ipcRenderer.send('resize', viewMode);
        }
        static openDevTools() {
            ipcRenderer.send("showDevTools");
        }
    }
    Lib.IpcRenderer = IpcRenderer;
})(Lib || (Lib = {}));
//# sourceMappingURL=lib.js.map