const { ipcRenderer } = require('electron');
const customTitlebar = require('custom-electron-titlebar');

namespace Lib {

	/**
	 * Audioオブジェクトのラッパー
	 */
	export class Player {
		private audio: any;

		constructor(volume: number) {
			this.audio = new Audio();
			this.audio.volume = volume;
		}

		public play(path: string): void {
			this.audio.src = path;
			this.audio.play();
		}

		public pause(): void {
			this.audio.pause();
		}
	}

	/**
	 * スタイルの調整など
	 */
	export class Decorator {

		public static toggleColor(selector: string): void {
			$(selector).css("background-color", "grey");
			setTimeout(() => {
				$(selector).css("background-color", "#1e1e1e")
			}, 80);
		}

		/**
		 * キー表示のトグル
		 * @param show 
		 */
		public static toggleShowKeyMap(show?: boolean): void {
			$(".label-asign").toggleClass("app-hidden", show);
		}

		/**
		 * ボリューム変更
		 * @param volume 
		 */
		public static changeVolume(volume: string): void {
			$(".volume-value").html(volume);
		}

		/**
		 * ビューモード切替
		 * @param viewMode
		 */
		public static toggleViewMode(viewMode: string): void {
			const button = $("#btn-resize");
			const drum = $(".drum");
			if (viewMode === Lib.ViewMode.Full) {
				button
					.attr("data-viewMode", Lib.ViewMode.Mini)
					.text(Lib.ViewMode.Mini);
				Lib.IpcRenderer.resizeWindow(Lib.ViewMode.Full);
				drum.toggleClass("app-hidden", false);
			} else {
				button
					.attr("data-viewMode", Lib.ViewMode.Full)
					.text(Lib.ViewMode.Full);
				Lib.IpcRenderer.resizeWindow(Lib.ViewMode.Mini);
				drum.toggleClass("app-hidden", true);
			}
		}
	}

	/**
	 * Playerの初期化
	 */
	export class PlayerInitializer {
		public static init(): void {
			$(document).on("keydown", event => {
				console.log(event.keyCode);

				const volume = $(".volume-slider").val();
				const player = new Lib.Player(Number(volume));

				switch (event.keyCode) {
					case 72://b
						player.play("Contents/Sounds/Kick08.wav");
						Decorator.toggleColor(".drum-part-left-pedal");
						break;
					case 66://h
						player.play("Contents/Sounds/Kick08.wav");
						Decorator.toggleColor(".drum-part-right-pedal");
						break;
					case 32://space
						player.play("Contents/Sounds/Crash Cymbal-R06.wav");
						Decorator.toggleColor(".drum-part-crash");
						break;
					case 65://a
						player.play("Contents/Sounds/OHH Edge03.wav");
						Decorator.toggleColor(".drum-part-highhat");
						break;
					case 88://x
						player.play("Contents/Sounds/Snare OR07.wav");
						Decorator.toggleColor(".drum-part-snare");
						break;
					case 86://v
						player.play("Contents/Sounds/Snare OR07.wav");
						Decorator.toggleColor(".drum-part-snare");
						break;
					case 90://z
					case 67://c
						player.play("Contents/Sounds/CHH Edge06.wav");
						Decorator.toggleColor(".drum-part-highhat");
						break;
					case 16://shift
						player.play("Contents/Sounds/China Cymbal04.wav");
						Decorator.toggleColor(".drum-part-china");
						break;
					case 84://t
					case 71://g
						player.play("Contents/Sounds/Floor Tom09.wav");
						Decorator.toggleColor(".drum-part-low-tom");
						break;
					case 70://f
					case 82://r
						player.play("Contents/Sounds/Mid Tom05.wav");
						Decorator.toggleColor(".drum-part-middle-tom");
						break;
					case 68://d
					case 69://e
						player.play("Contents/Sounds/High Tom08.wav");
						Decorator.toggleColor(".drum-part-high-tom");
						break;
					case 83://s
						player.play("Contents/Sounds/Ride Cymbal-Tip05.wav");
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
			})
		}
	}

	/**
	 *  localStorageを扱う
	 */
	export class Storage {
		private static showKeyMapKey = "showKeyMap";
		private static volumeKey = "volume";
		private static viewModeKey = "viewMode";

		public static load() {
			Storage.loadShowKeyMap();
			Storage.loadVolume();
			Storage.loadViewMode();
		}

		public static save(type: Component, value: any) {
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

		private static loadShowKeyMap() {
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

		private static loadVolume() {
			const volume = localStorage[Storage.volumeKey];
			if (volume === undefined) {
				return;
			}
			$(".volume-slider").val(volume);
			$(".volume-value").text(volume);
		}

		private static loadViewMode() {
			const viewMode = localStorage[Storage.viewModeKey];
			if (viewMode === undefined) {
				return;
			}
			Decorator.toggleViewMode(viewMode);
		}
	}

	/**
	 * 構成要素
	 */
	export enum Component {
		ShowKey,
		Volume,
		ViewMode,
	}

	/**
	 * ビューモード
	 */
	export enum ViewMode {
		Full = "full",
		Mini = "mini",
	}

	/**
	 * メインプロセスとの通信
	 */
	export class IpcRenderer {

		public static resizeWindow(viewMode: ViewMode) {
			// メインプロセスに通知
			ipcRenderer.send('resize', viewMode);
		}

		public static openDevTools() {
			ipcRenderer.send("showDevTools");
		}
	}

	/**
	 * ウィンドウの初期化
	 */
	export class WindowInitializer {

		public static init() {
			new customTitlebar.Titlebar({
				backgroundColor: customTitlebar.Color.fromHex('#444')
			});		
		}
	}
}