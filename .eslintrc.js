module.exports = {
    "env": {
        "browser": true,
        "node":true,
        "es6": true,
        "jquery":true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
        "requirejs":false,
        "$page":false,
        "$pop":false,
        "Mock":false,
        "axios":false,
        "moment":false
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": 1,
        'no-unreachable':1
    }
};