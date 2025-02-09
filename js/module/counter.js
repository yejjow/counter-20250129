import { CountEffect } from './count-effect.js';

export class Counter {

    #value;

    #element;
    #layers;
    
    constructor(domElement = document.createElement('div')) {

        this.#element = domElement;
        this.#element.classList.add('counter');

        this.#layers = {
            value: document.createElement('div'),
            effect: new CountEffect(),
            background: document.createElement('div')
        };
        this.#layers.value.classList.add('value');
        this.#layers.background.classList.add('background');
        this.#element.appendChild(this.#layers.value);
        this.#element.appendChild(this.#layers.effect);
        this.#element.appendChild(this.#layers.background);


        this.#element.addEventListener('pointerdown', e => {
            this.increment();
            this.#layers.effect.touch(e.clientX, e.clientY);

        });

        this.value = 0;

    }

    get value() {
        return this.#value;
    }

    set value(value) {
        this.#value = value;
        this.#updateDOM();
    }

    /**
     * カウントアップ
     * @param {*} amount 
     */
    increment(amount = 1) {
        this.value += amount;
    }

    #updateDOM() {
        setTimeout(() => this.#layers.value.innerText = this.#value, 225);
    }

}