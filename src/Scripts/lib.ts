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

namespace Lib {

	/**
	 * Audioオブジェクトのラッパー
	 */
	export class Player {
		private audio: HTMLAudioElement;

		constructor(volume: number) {
			this.audio = new Audio();
			this.audio.volume = volume;
		}

		public play(path: string): void {
			this.audio.src = path;
			this.audio.play();
		}

		public get currentTime(): number {
			return this.audio.currentTime;
		}

		public stop(): void {
			this.audio.currentTime = 0;
			this.audio.pause();
		}
	}

	/**
	 * スタイルの調整など
	 */
	export class Decorator {

		private ipcRenderer: Lib.IpcRenderer;

		constructor(ipcRenderer: Lib.IpcRenderer) {
			this.ipcRenderer = ipcRenderer;
		}

		public toggleColor(selector: string): void {
			$(selector).css("background-color", "grey");
			setTimeout(() => {
				$(selector).css("background-color", "#1e1e1e")
			}, 80);
		}

		/**
		 * キー表示のトグル
		 * @param show 
		 */
		public toggleShowKeyMap(show?: boolean): void {
			$(".label-asign").toggleClass("app-hidden", show);
		}

		/**
		 * ボリューム変更
		 * @param volume 
		 */
		public changeVolume(volume: number): void {
			$(".volume-value").html(Number(volume).toFixed(1));
		}

		/**
		 * ビューモード切替
		 * @param viewMode
		 */
		public toggleViewMode(viewMode: string): void {
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
			} else {
				button
					.attr("data-viewMode", Lib.ViewMode.Full)
					.text(Lib.ViewMode.Full);
				this.ipcRenderer.resizeWindow(Lib.ViewMode.Mini);
				drum.toggleClass("app-hidden", true);
				side.toggleClass("app-hidden", true);
			}
		}
	}

	/**
	 * Playerの初期化
	 */
	export class PlayerInitializer {

		private readonly decorator: Decorator;
		private readonly storage: Storage;
		private readonly sustain: number;

		constructor(decorator: Decorator, storage: Storage) {
			this.decorator = decorator;
			this.storage = storage;
			this.sustain = 2000;
		}

		public init(): void {
			const keys = JSON.parse(fs.readFileSync(settingFilePath, 'utf-8')).keys;

			$(document).on("keydown", event => {
				const volume = $(".volume-slider").val();
				const player = new Lib.Player(Number(volume));
				const setting: KeySetting = keys[event.keyCode];
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
			})
		}
	}

	/**
	 *  localStorageを扱う
	 */
	export class Storage {

		private decorator: Decorator;

		constructor(decorator: Decorator) {
			this.decorator = decorator;
		}

		private static showKeyMapKey = "showKeyMap";
		private static volumeKey = "volume";
		private static viewModeKey = "viewMode";

		public load() {
			this.loadShowKeyMap();
			this.loadVolume();
			this.loadViewMode();
		}

		public save(type: Component, value: any) {
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

		private loadShowKeyMap() {
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

		private loadVolume() {
			const volume = localStorage[Storage.volumeKey];
			if (volume === undefined) {
				return;
			}
			$(".volume-slider").val(volume);
			this.decorator.changeVolume(volume)
		}

		private loadViewMode() {
			const viewMode = localStorage[Storage.viewModeKey];
			if (viewMode === undefined) {
				return;
			}
			this.decorator.toggleViewMode(viewMode);
		}
	}

	export class SettingManager {

		public load() {
			const keys = JSON.parse(fs.readFileSync(settingFilePath, 'utf-8')).keys;

			for (const key in keys) {
				const keys = JSON.parse(fs.readFileSync(settingFilePath, 'utf-8')).keys;

				const setting:KeySetting = keys[key];
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

		public save() {
			let setting = {};
			$(".setting").each((index, element) => {
				const map = $(element).find(".map").text();
				const key = $(element).find(".key").val();
				const keyCode = $(element).find(".keycode").val() as string;
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

		public resizeWindow(viewMode: ViewMode) {
			// メインプロセスに通知
			ipcRenderer.send('resize', viewMode);
		}

		public openDevTools() {
			ipcRenderer.send("showDevTools");
		}
	}

	/**
	 * ウィンドウの初期化
	 */
	export class WindowInitializer {

		public init() {
			new customTitlebar.Titlebar({
				backgroundColor: customTitlebar.Color.fromHex('#444')
			});
		}
	}

	/**
	 * キー設定
	 */
	export interface KeySetting {
		key: string;
		fileName: string;
		map: string;
	}
}