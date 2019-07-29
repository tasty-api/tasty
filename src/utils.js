const path = require('path');

module.exports = {
  resetCache: (module) => {
    if (require.cache[path.resolve(module)]) {
      delete require.cache[path.resolve(module)];
    }
  }
};
