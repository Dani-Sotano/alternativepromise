
class AlternativePromise {

    constructor(executor) { // executor has two arguments resolve (to execute promise) and reject (to reject promsie) 
        this._state = 'PENDING' // PENDING, FULFILLED, REJECTED
        this._promiseChain = []; 
        this._handleError = undefined;
        this._handleFinally = undefined;
        this._storedValue = undefined;
        this._errorMessage = undefined;

        this._onResolve = this._onResolve.bind(this);
        this._onReject = this._onReject.bind(this);

        executor(this._onResolve, this._onReject)
    }


    then(handleSuccess) {
        if (this._state === 'FULFILLED') {
            let returnValue = handleSuccess(this._storedValue);
            if (returnValue) {
                this._storedValue = returnValue;
            }
        } else if (this._state === 'PENDING') {
            this._promiseChain.push(handleSuccess);
        }
        return this; // returns promise as value of promise might not exist yet
    }

    catch(handleError) {
        if (this._state === 'PENDING') {
            this._handleError = handleError;
        } else if (this._state == 'REJECTED') {
            handleError(this._errorMessage)
        }
        return this;
    }

    finally(handleFinally) {
        if (this._state === 'PENDING') {
            this._handleFinally = handleFinally;
        }
        return this;
    }

    _onResolve(v) {
        if (this._state == 'PENDING') {
            this._state = 'FULFILLED'
            this._storedValue = v;

            this._promiseChain.forEach((nextFunction) => {
                let returnValue = nextFunction(this._storedValue);
                if (returnValue) {
                    this._storedValue = returnValue;
                }
            });
            if (this._handleFinally) {
                this._handleFinally()
            }
        }
    }

    _onReject(v) {
        this._state = 'REJECTED'
        this._promiseChain = [];
        this._errorMessage = v;
        if (this._handleError) {
            this._handleError(this._errorMessage);
        }
        if (this._handleFinally) {
            this._handleFinally(this._storedValue)
        }
    }
}

module.exports.AlternativePromise = AlternativePromise;






