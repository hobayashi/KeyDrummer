const { ipcRenderer } = require('electron');

namespace Lib {

	/**
	 * Audioオブジェクトのラッパー
	 */
	export class AudioWrapper {
		private audioElem: any;

		constructor(volume: number) {
			this.audioElem = new Audio();
			this.audioElem.volume = volume;
		}

		public playSound(path: string): void {
			this.audioElem.src = path;
			this.audioElem.play();
		}

		public stopSound(): void {
			this.audioElem.pause();
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
	}

	/**
	 * Audioの初期化
	 */
	export class AudioInitializer {
		public static init(): void {
			$(document).on("keydown", event => {
				console.log(event.keyCode);

				const audio = new Lib.AudioWrapper(Number($(".volume-value").html()));

				switch (event.keyCode) {
					case 66://b
						audio.playSound("Contents/Sounds/Kick08.wav");
						Decorator.toggleColor(".drum-part-left-pedal");
						break;
					case 72://h
						audio.playSound("Contents/Sounds/Kick08.wav");
						Decorator.toggleColor(".drum-part-right-pedal");
						break;
					case 32://space
						audio.playSound("Contents/Sounds/Crash Cymbal-R06.wav");
						Decorator.toggleColor(".drum-part-crash");
						break;
					case 65://a
						audio.playSound("Contents/Sounds/OHH Edge03.wav");
						Decorator.toggleColor(".drum-part-highhat");
						break;
					case 88://x
						audio.playSound("Contents/Sounds/Snare OR07.wav");
						Decorator.toggleColor(".drum-part-snare");
						break;
					case 86://v
						audio.playSound("Contents/Sounds/Snare OR07.wav");
						Decorator.toggleColor(".drum-part-snare");
						break;
					case 90://z
					case 67://c
						audio.playSound("Contents/Sounds/CHH Edge06.wav");
						Decorator.toggleColor(".drum-part-highhat");
						break;
					case 16://shift
						audio.playSound("Contents/Sounds/China Cymbal04.wav");
						Decorator.toggleColor(".drum-part-china");
						break;
					case 84://t
					case 71://g
						audio.playSound("Contents/Sounds/Floor Tom09.wav");
						Decorator.toggleColor(".drum-part-low-tom");
						break;
					case 70://f
					case 82://r
						audio.playSound("Contents/Sounds/Mid Tom05.wav");
						Decorator.toggleColor(".drum-part-middle-tom");
						break;
					case 68://d
					case 69://e
						audio.playSound("Contents/Sounds/High Tom08.wav");
						Decorator.toggleColor(".drum-part-high-tom");
						break;
					case 83://s
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
			})
		}
	}

	/**
	 *  localStorageを扱う
	 */
	export class Storage {
		private static showKeyMapKey = "showKeyMap";
		private static volumeKey = "volume";

		public static load() {
			Storage.loadShowKeyMap();
			Storage.loadVolume();
		}

		public static save(type: Component, value: any) {
			switch (type) {
				case Component.ShowKey:
					localStorage[Storage.showKeyMapKey] = value;
					break;
				case Component.Volume:
					localStorage[Storage.volumeKey] = value;
					break;
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
	}

	/**
	 * 構成要素
	 */
	export enum Component {
		ShowKey,
		Volume,
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
}