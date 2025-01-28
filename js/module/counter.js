import { Background } from '/js/module/background.js';

export class Counter {

    #value;
    
    #domElements;
    #background;
    
    constructor(domElement) {
        this.#domElements = {
            container: domElement,
            value: document.createElement('div')
        };
        this.#domElements.container.appendChild(this.#domElements.value);
        this.#domElements.container.classList.add('counter');
        this.#domElements.value.classList.add('value');
        this.#background = new Background(this.#domElements.container);

        this.#domElements.container.addEventListener('touchstart', e => {
            e.preventDefault();
        
            this.increment();
            const touch = e.touches[e.touches.length - 1];
            this.#background.touch(touch.clientX, touch.clientY);

        }, { passive: false });

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
        setTimeout(() => this.#domElements.value.innerText = this.#value, 225);
    }

}