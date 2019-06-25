module.exports = {
  Runner: require('./src/Runner'),
  App: require('./src/App'),
  Services: require('./src/Services'),
  tasty: new (require('./src/Tasty')),
};
