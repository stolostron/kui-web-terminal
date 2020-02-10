module.exports = {
    "env": {
        "node": true,
        "commonjs": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "plugins": [
    "import"
    ],
    "rules": {
        "no-unused-vars": "warn",
        "no-console": "off",
        "import/no-unresolved": ["error",
        {
            "commonjs": true
        }
    ],
    }
};
