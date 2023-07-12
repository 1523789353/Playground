class RevokeablePromise {
    #state = 'pending'; // pending fulfilled rejected revoked
    #promise = null;
    #reject = null;
    #revokeHandlers = [];
    constructor(executor) {
        let $this = this;
        this.#promise = new Promise(
            function (resolve, reject) {
                $this.#reject = reject;
                function wrapedResolve() {
                    if ($this.#state == 'pending')
                        $this.#state = 'fulfilled';
                    resolve(...arguments);
                }
                function wrapedReject() {
                    if ($this.#state == 'pending')
                        $this.#state = 'rejected';
                    reject(...arguments);
                }
                function onRevoke(handler) {
                    $this.#revokeHandlers.push(handler);
                }
                executor(wrapedResolve, wrapedReject, onRevoke);
            }
        );
    }
    then(onfulfilled = null, onrejected = null) {
        this.#promise?.then(...arguments);
        return this;
    }
    catch(onrejected = null) {
        this.#promise?.catch(...arguments);
        return this;
    }
    finally(onfinally = null) {
        this.#promise?.finally(...arguments);
        return this;
    }
    revoke() {
        if (this.#state != 'pending')
            return;
        this.#state = 'revoked';
        this.#revokeHandlers.forEach(f => {
            try {
                f();
            } catch (e) {
                console.error(e);
            }
        });
        this.#reject('Promise revoked');
        this.#promise = null;
        return this;
    }

    // static part
    static all(...promises) {
        return new RevokeablePromise(
            function (resolve, reject, onRevoke) {
                let count = 0;
                let results = [];
                onRevoke(() => promises.forEach(p => p?.revoke()));
                for (let index in promises) {
                    promises[index].then(
                        function (value) {
                            results[index] = value;
                            if (++count == promises.length)
                                resolve(results);
                            return value;
                        }
                    ).catch(
                        function (reason) {
                            reject(reason);
                            return reason;
                        }
                    );
                }
            }
        )
    }
    static race(...promises) {
        return new RevokeablePromise(
            function (resolve, reject, onRevoke) {
                onRevoke(() => promises.forEach(p => p?.revoke()));
                promises.forEach(p =>
                    p.then(
                        function (value) {
                            resolve(value);
                            return value;
                        }
                    ).catch(
                        function (reason) {
                            reject(reason);
                            return reason;
                        }
                    )
                );
            }
        )
    }
}
