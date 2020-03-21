module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "prettier"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": [
      "error",
      {
        "args": "after-used",
        "argsIgnorePattern": "^_"
      }
    ],
    "prettier/prettier": [
      "error",
      {
        "printWidth": 100,
        "semi": true,
        "singleQuote": false
      }
    ],
    "react/display-name": [
      0
    ],
    "react/jsx-no-undef": [
      1,
      { "allowGlobals": true }
    ],
    "react/no-deprecated": [
      0
    ],
    "react/prop-types": [
      0
    ]
  },
  "plugins": [
    "prettier",
    "react"
  ],
  "settings": {
    "react": {
      "pragma": "h"
    }
  }
}
