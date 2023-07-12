class ShadowElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'closed' });
    }
}

customElements.define('shadow', ShadowElement, { extends: 'div' });

export default ShadowElement;
