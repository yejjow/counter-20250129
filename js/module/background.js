export class Background {

    #domElement;
    #context;
    #circleEffects;
    backgroundColor;

    constructor(targetDOMElement) {
        this.#domElement = document.createElement('canvas');
        this.#domElement.classList.add('background');
        targetDOMElement.appendChild(this.#domElement);
        this.#context = this.#domElement.getContext('2d');
        this.#context.save();
        this.#circleEffects = [];
        this.backgroundColor = new Color('rgb(20, 22, 23)');
        this.#resize();
        window.addEventListener('resize', () => this.#resize());
        window.requestAnimationFrame((timestamp) => this.#update(timestamp));
    }

    #resize() {
        const scale = window.devicePixelRatio;
        this.#domElement.width = this.#domElement.offsetWidth * scale;
        this.#domElement.height = this.#domElement.offsetHeight * scale;
    }

    #update(timestamp) {
        this.#circleEffects.forEach((circle) => circle.update(timestamp, this.#domElement));
        this.#circleEffects = this.#circleEffects.filter((circle) => {
            if (circle.dead) {
                // this.backgroundColor = circle.color;
                return false;
            }
            return true;
        });
        this.#draw();
    }

    #draw() {

        this.#context.restore();

        // 背景
        this.#context.clearRect(0, 0, this.#domElement.width, this.#domElement.height);
        this.#context.fillStyle = this.backgroundColor.toString();
        this.#context.fillRect(0, 0, this.#domElement.width, this.#domElement.height);

        this.#context.globalCompositeOperation = 'screen';


        // 円エフェクト
        this.#circleEffects.forEach((circle) => circle.draw(this.#context));

        window.requestAnimationFrame((timestamp) => this.#update(timestamp));

    }

    touch(x, y) {
        const scale = window.devicePixelRatio;
        // const color = '#ff0000';
        // const color = 'rgb(0,0,0,0.5)';

        const hueOffset = Math.random() > 0 ? Math.floor(Math.random() * 360) : (Math.floor(Math.random() * 0) + 10) % 360;
        // const hueOffset = 210;
        const circleEffectNum = 7;
        for (let i = 0; i < circleEffectNum; i++) {
            setTimeout(
                () => this.#circleEffects.push(new CircleEffect(
                    x * scale + Math.floor((Math.random() - 0.5) * this.#domElement.width * (0.05 + 0.05 * i) * (i / circleEffectNum) * i),
                    y * scale + Math.floor((Math.random() - 0.5) * this.#domElement.height * (0.05 + 0.05 * i) * (i / circleEffectNum) * i),
                    new Color(
                        Color.HSL,
                        (hueOffset + Math.floor(360 * i / circleEffectNum) + Math.floor(Math.random() * 10)) % 360,
                        0.7 + Math.floor((Math.random() - 0.5) * 10) / 50 * circleEffectNum / (i + 1) - (i + 1) / circleEffectNum * 0.1 + Math.floor(Math.random() * 10) / 100,
                        0.05 + Math.floor((Math.random() - 0.5) * 5) / 200 * circleEffectNum / (i + 1) - (i + 1) / circleEffectNum * 0.02
                    )
                )),
                (Math.random() - 0.5) * 50 + 200 * i / circleEffectNum
            );
        }
    }

}

class CircleEffect {

    static count = 0;

    x;
    y;
    radius;
    color;

    generatedAt;
    dead;

    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.color = {
            assigned: color instanceof Color ? color : new Color(color),
            current: new Color()
        }

        this.generatedAt = performance.now();
        this.dead = false;

        CircleEffect.count++;
    }

    update(timestamp, canvasElement) {

        const goalRadius = Math.sqrt(Math.pow(Math.max(canvasElement.width - this.x, this.x), 2) + Math.pow(Math.max(canvasElement.height - this.y, this.y), 2));

        this.radius = Math.max(
            goalRadius *
            (
                (Math.pow(timestamp - this.generatedAt, 1 / 2) / Math.pow(200, 1 / 2)) * 0.5 +
                (Math.pow(timestamp - this.generatedAt, 7) / Math.pow(200, 7)) * 0.5
            ),
            0
        );

        this.color.current.r = Math.floor(this.color.assigned.r * (Math.min(Math.max(timestamp - this.generatedAt - 150, 0) / 15, 1) * 0.7 + 0.3));
        this.color.current.g = Math.floor(this.color.assigned.g * (Math.min(Math.max(timestamp - this.generatedAt - 150, 0) / 15, 1) * 0.7 + 0.3));
        this.color.current.b = Math.floor(this.color.assigned.b * (Math.min(Math.max(timestamp - this.generatedAt - 150, 0) / 15, 1) * 0.7 + 0.3));
        this.color.current.a = Math.max(1 - Math.max(timestamp - this.generatedAt - 200, 0) / 500, 0);
        console.log(this.color.current.toString());

        if (this.color.current.a <= 0) {
            this.dead = true;
        }

    }

    draw(context) {
        context.fillStyle = this.color.current.toString();
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
    }

}

class Color {

    r;
    g;
    b;
    a;

    static RGB = {};
    static HSL = {};

    constructor(...args) {

        switch (args?.length) {

            case 1:
                const rgba = Color.stringToRGBA(args[0]);
                Object.assign(this, rgba);
                break;

            case 4:
            case 5:
                const format = args[0];

                switch (format) {

                    case Color.RGB:
                        this.r = args[1];
                        this.g = args[2];
                        this.b = args[3];
                        this.a = args?.[4] ?? 1;
                        break;
                        
                    case Color.HSL:
                        const rgba = Color.stringToRGBA(`hsla(${args[1]}, ${args[2] * 100}%, ${args[3] * 100}%, ${args?.[4] ?? 1})`);
                        Object.assign(this, rgba);
                        break;

                    default:
                        throw new Error('Invalid color format');

                }
                break;

            default:
                this.r = 0;
                this.g = 0;
                this.b = 0;
                this.a = 0;

        }

    }

    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    /**
     * 文字列からRGBAを返す
     * @param {*} colorString 
     * @returns 
     */
    static stringToRGBA(colorString) {

        // Canvas要素を作成
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");

        // 色を設定
        ctx.fillStyle = colorString;

        // 設定した色を取得
        const computedColorString = ctx.fillStyle;

        // 16進数形式の場合
        if (/^#[0-9a-f]{6}$/i.test(computedColorString)) {
            const bigint = parseInt(computedColorString.slice(1), 16);

            return {
                r : (bigint >> 16) & 255,
                g : (bigint >> 8) & 255,
                b : bigint & 255,
                a : 1
            }
        }

        else {

            // rgba形式の場合
            const match = computedColorString.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);

            if (!match) {
                throw new Error('Invalid color format');
            }

            return {
                r : parseInt(match[1], 10),
                g : parseInt(match[2], 10),
                b : parseInt(match[3], 10),
                a : match[4] !== undefined ? parseFloat(match[4]) : 1
            }


        }

    }

}