const { expect } = require('@jest/globals');
const { AlternativePromise } = require('./alternativePromise.js')

var TestPromise = AlternativePromise

test('executor function is called immediately', done => {

    var string;
    new TestPromise(function () {
        string = 'foo';
    })
    expect(string).toBe('foo')
    done(); //for test purpose - otherwise test finishes bevore promise
});

test('resolution handler is called when promise is resolved', done => {
    var testStrig = 'foo';
    var promise = new TestPromise(function (resolve) {
        setTimeout(function () {
            resolve(testStrig);
        }, 1000);
    });

    promise.then(function (string) {
        expect(string).toBe('foo');
        done();
    })

});

test('promise supports many resolution handlers', done => {
    var testStrig = 'foo';
    var promise = new TestPromise(function (resolve) {
        setTimeout(function () {
            resolve(testStrig);
        }, 1000);
    });
    promise
        .then((string) => 'hello ' + string)
        .then(function (string) {
            expect(string).toBe('hello foo');
            done();
        })
});

test('chaining works with non-promise return values', done => {
    var testStrig = 'foo';
    var promise = new TestPromise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, 1000);
    });
    promise
        .then(() => 'hello ' + testStrig)
        .then(function (string) {
            expect(string).toBe('hello foo');
            done();
        })
});


test('resolution handlers can be attached when promise is resolved', done => {
    var testString = 'foo';
    var promise = new TestPromise(function (resolve) {
        setTimeout(function () {
            resolve(testString);
        }, 1000);
    });
    promise
        .then(function () {
            setTimeout(function () {
                promise.then(function (value) {
                    expect(value).toBe(testString)
                })
                done();
            })
        })
});


test('calling resolved a second time has no effect', done => {
    var testString = 'foo';
    var testString2 = 'bar';
    var promise = new TestPromise(function (resolve) {
        setTimeout(function () {
            resolve(testString);
            resolve(testString2);
        }, 1000);
    });
    promise
        .then(function (value) {
            expect(value).toBe(testString)
            done();
        })
});


test('rejection handler is called when promise is rejected', done => {
    var testError = new Error("Something went wrong")
    var promise = new TestPromise(function (resolve, reject) {
        setTimeout(function () {
            reject(testError);
        }, 1000);
    });
    promise
        .catch(function (value) {
            expect(value).toBe(testError);
            done();
        })
});

test('chaining works with rejection handlers', done => {
    var testError = new Error("Something went wrong")
    var promise = new TestPromise(function (resolve, reject) {
        setTimeout(function () {
            reject(testError);
        }, 1000);
    });
    promise
        .then(function () {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    resolve(testError);
                }, 100)
            })
        })
        .catch(function (value) {
            expect(value).toBe(testError);
            done();
        })
});

test('rejections are passed downstream', done => {
    var testError = new Error("Something went wrong")
    var promise = new TestPromise(function (resolve, reject) {
        setTimeout(function () {
            reject(testError);
        }, 1000);
    });
    promise
        .then(function () {
            return new TestPromise(function (resolve) {
                setTimeout(function () {
                    resolve(testError);
                }, 100)
            })
        })
        .catch(function (value) {
            expect(value).toBe(testError);
            done();
        })
});

test("might not handle value forwarding when promise is already resolved", done => {
    var string = 'resolveString';
    var promise = new TestPromise(function (resolve, reject) {
        resolve(string);
    });
    promise
        .then((s) => s + '_hello')
        .then((s) => {
            expect(s).toBe(string);
            done();
        });
});

test("provide error return value", done => {
    var errorMessage = "error is included"
    var promise = new TestPromise(function (resolve, reject) {
        reject("error is included");
    });
    promise
        .then(value => { return value + ' and bar'; })
        .then(value => { return value + ' and bar again'; })
        .then(value => { return value + ' and again'; })
        .then(value => { return value + ' and again'; })
        .catch(err => { 
            expect(err).toBe(errorMessage);
            done();
        });
})

test("catch might not work when promise is still pending while catch is added", done => {
    var promise = new SimplePromise(function (resolve, reject) {
        setTimeout(() => reject("error is included"), 100);
    });
    promise
        .then(value => { return value + ' and bar'; })
        .catch(err => { 
            expect.err(err).toBe("error is included");
            done();
        });
});


test("got  to finally after resolve or reject promise", done => {
    let resolvePromise = new Promise(function (resolve, reject) {
        setTimeout(() => {
            resolve();
        }, 1000);
    })
    resolvePromise
        .then(() => {})
        .finally(() => {
            expect(true).toBe(true);
            done();
        });


    let rejectPromise = new Promise(function (resolve, reject) {
        setTimeout(() => {
            reject();
        }, 1000);
    })
    rejectPromise
        .then(() => {})
        .catch(() => {})
        .finally(() => {
            expect(true).toBe(true);
            done();
        });
})
