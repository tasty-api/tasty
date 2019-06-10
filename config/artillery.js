/**
 * basic config to make everything about artillery work
 * @type {{}}
 */
module.exports = {
  config: {
    target: "/",
    tls: {
      rejectUnauthorized: false
    },
    http: {
      timeout: 10
    },
    phases: [{
      duration: 10,
      arrivalRate: 1
    }]
  }
};
