const isFunction = obj => typeof obj === "function";

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function MyPromise(callbackFunc) {
  this.state = PENDING;
  this.result = null;
  this.callbacks = [];

  let ignore = false;
  const resolve = value => {
    if (ignore) return;
    ignore = true;
    transition(this, FULFILLED, value);
  };
  const reject = reason => {
    if (ignore) return;
    ignore = true;
    transition(this, REJECTED, reason);
  };
  callbackFunc(resolve, reject);
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  return new MyPromise((resolve, reject) => {
    let callback = { onFulfilled, onRejected, resolve, reject };
    if (this.state === PENDING) {
      this.callbacks.push(callback);
    } else {
      setTimeout(() => handleCallback(callback, this.state, this.result), 0);
    }
  });
};

const transition = (promise, state, result) => {
  if (state === PENDING) return;
  promise.state = state;
  promise.result = result;
  const callbacks = promise.callbacks;
  if (callbacks.length === 0) return;
  setTimeout(() => {
    handleCallback(callbacks.shift(), state, result);
  }, 0);
};

const handleCallback = (callback, state, result) => {
  const { onFulfilled, onRejected, resolve, reject } = callback;
  if (state === FULFILLED) {
    isFunction(onFulfilled) ? resolve(onFulfilled(result)) : resolve(result);
  } else if (state === REJECTED) {
    isFunction(onRejected) ? resolve(onRejected(result)) : reject(result);
  }
};
