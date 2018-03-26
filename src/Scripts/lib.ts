namespace Lib {

    export class AudioWrapper {
        private audioElem: any;

        constructor(volume: number) {
            this.audioElem = new Audio();
            this.audioElem.volume = volume;
        }

        public PlaySound(path: string): void {
            this.audioElem.src = path;
            this.audioElem.play();  
        }

        public StopSound(): void {
            this.audioElem.pause();
        }

        public Volume(up: boolean): void {
            if (up) {
                if (0.9 < this.audioElem.volume) {
                    this.audioElem.volume = 1;
                } else {
                    this.audioElem.volume += 0.1;
                }
              } else {
                if (this.audioElem.volume < 0.1) {
                    this.audioElem.volume = 0;
                }
                else {
                    this.audioElem.volume -= 0.1;
                }
            }    
        }
    }

    export class Decorator {

        public static toggleColor(selector: string): void {
            $(selector).css("background-color", "grey");
            setTimeout(() => {
                $(selector).css("background-color", "white")
            }, 80);
}
    }

    export class AudioInitializer {
        public static init(): void {
            $(document).on("keydown", event => {
                console.log(event.keyCode);
        
                const audio = new Lib.AudioWrapper(Number($(".volume-value").html()));
        
                switch(event.keyCode) {
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
                    case 90://z
                    case 67://c
                    audio.PlaySound("Contents/CHH Edge06.wav");
                    Decorator.toggleColor(".drum-part-highhat");
                    break;
                    case 16://shift
                    audio.PlaySound("Contents/China Cymbal04.wav");
                    Decorator.toggleColor(".drum-part-china");
                    break;
                    case 70://f
                    case 68://d
                    audio.PlaySound("Contents/Floor Tom09.wav");
                    Decorator.toggleColor(".drum-part-low-tom");
                    break;
                    case 82://r
                    case 69://e
                    audio.PlaySound("Contents/Mid Tom05.wav");
                    Decorator.toggleColor(".drum-part-high-tom");
                    break;
                    case 83://s
                    audio.PlaySound("Contents/Ride Cymbal-Tip05.wav");
                    Decorator.toggleColor(".drum-part-middle-tom");
                    break;
                }
            }).on("input", ".volume-slider", event => {
                $(".volume-value").html($(event.currentTarget).val().toString());
            });   
        }
    }
}