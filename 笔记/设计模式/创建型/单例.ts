class singletonClass {
    private static instance: singletonClass;
    public static getInstance(): singletonClass {
        if (this.instance == undefined)
            this.instance = new this();
        return this.instance
    }
    private constructor() {

    }
}
