class XML {
    static #parser = new DOMParser();
    static #serializer = new XMLSerializer();

    static parse(str) {
        return this.#parser.parseFromString(str, 'text/xml');;
    }
    static stringify(obj) {
        return this.#serializer.serializeToString(obj);
    }
}
