module.exports = {
  "extends": ["google"],
  "parserOptions": {
    "sourceType": "module",
  },
  "env": {
    "browser": true,
    "es6": true,
    "serviceworker": true
  },
  "rules": {
    "no-undef": "error"
  },
  "globals": {
    "__dirname": true,
    "module": true,
    "require": true
  }
};