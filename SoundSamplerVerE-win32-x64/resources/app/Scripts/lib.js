var Lib;
(function (Lib) {
    var AudioWrapper = /** @class */ (function () {
        function AudioWrapper(volume) {
            this.audioElem = new Audio();
            this.audioElem.volume = volume;
        }
        AudioWrapper.prototype.PlaySound = function (path) {
            this.audioElem.src = path;
            this.audioElem.play();
        };
        AudioWrapper.prototype.StopSound = function () {
            this.audioElem.pause();
        };
        AudioWrapper.prototype.Volume = function (up) {
            if (up) {
                if (0.9 < this.audioElem.volume) {
                    this.audioElem.volume = 1;
                }
                else {
                    this.audioElem.volume += 0.1;
                }
            }
            else {
                if (this.audioElem.volume < 0.1) {
                    this.audioElem.volume = 0;
                }
                else {
                    this.audioElem.volume -= 0.1;
                }
            }
        };
        return AudioWrapper;
    }());
    Lib.AudioWrapper = AudioWrapper;
    var Decorator = /** @class */ (function () {
        function Decorator() {
        }
        Decorator.toggleColor = function (selector) {
            $(selector).css("background-color", "grey");
            setTimeout(function () {
                $(selector).css("background-color", "white");
            }, 80);
        };
        return Decorator;
    }());
    Lib.Decorator = Decorator;
    var AudioInitializer = /** @class */ (function () {
        function AudioInitializer() {
        }
        AudioInitializer.init = function () {
            $(document).on("keydown", function (event) {
                console.log(event.keyCode);
                var audio = new Lib.AudioWrapper(Number($(".volume-value").html()));
                switch (event.keyCode) {
                    case 66://b
                        audio.PlaySound("Contents/Kick08.wav");
                        Decorator.toggleColor(".drum-part-right-pedal");
                        break;
                    case 72://h
                        audio.PlaySound("Contents/Kick08.wav");
                        Decorator.toggleColor(".drum-part-left-pedal");
                        break;
                    case 32://space
                        audio.PlaySound("Contents/Crash Cymbal-R06.wav");
                        Decorator.toggleColor(".drum-part-crash");
                        break;
                    case 65://a
                        audio.PlaySound("Contents/OHH Edge03.wav");
                        Decorator.toggleColor(".drum-part-highhat");
                        break;
                    case 88://x
                        audio.PlaySound("Contents/Snare OR07.wav");
                        Decorator.toggleColor(".drum-part-snare");
                        break;
                    case 86://v
                        audio.PlaySound("Contents/Snare OR07.wav");
                        Decorator.toggleColor(".drum-part-snare");
                        break;
                    case 90: //z
                    case 67://c
                        audio.PlaySound("Contents/CHH Edge06.wav");
                        Decorator.toggleColor(".drum-part-highhat");
                        break;
                    case 16://shift
                        audio.PlaySound("Contents/China Cymbal04.wav");
                        Decorator.toggleColor(".drum-part-china");
                        break;
                    case 70: //f
                    case 68://d
                        audio.PlaySound("Contents/Floor Tom09.wav");
                        Decorator.toggleColor(".drum-part-low-tom");
                        break;
                    case 82: //r
                    case 69://e
                        audio.PlaySound("Contents/Mid Tom05.wav");
                        Decorator.toggleColor(".drum-part-high-tom");
                        break;
                    case 83://s
                        audio.PlaySound("Contents/Ride Cymbal-Tip05.wav");
                        Decorator.toggleColor(".drum-part-middle-tom");
                        break;
                }
            }).on("input", ".volume-slider", function (event) {
                $(".volume-value").html($(event.currentTarget).val().toString());
            });
        };
        return AudioInitializer;
    }());
    Lib.AudioInitializer = AudioInitializer;
})(Lib || (Lib = {}));
//# sourceMappingURL=lib.js.map