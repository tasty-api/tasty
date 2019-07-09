const { promisify } = require('util');
const waterfall = promisify(require('async/waterfall'));
const parallel = promisify(require('async/parallel'));
const DriverProvider = require('./DriverProvider');

/** Class representing a Tasty library */
class Tasty {
  constructor() {
    this.context = {};
    this.case = Tasty.case;
  }

  /**
   * Describe a test case
   * @param {string} title - Test case title
   * @param {function[]} actions - Test actions
   */
  static case(title, ...actions) {
    const tasty = new Tasty();
    const driver = DriverProvider.resolve();

    return driver.case(title, actions, tasty);
  }

  /**
   * Describe a set of actions
   * @param {function[]} actions - Test actions, which will be done in series
   * @returns {function} Function which sent request in series
   */
  series(...actions) {
    return async () => {
      const resources = await waterfall(actions.map( action => (
        async (resources = []) => {
          resources.capturedData = resources.capturedData || {};

          const resource = await action(resources.capturedData);

          resources.push(resource);

          resources.capturedData = {
            ...resources.capturedData,
            ...resource.capturedData,
          };

          return resources;
        }
      )));

      this.context = {
        ...this.context,
        ...resources.capturedData,
      };

      return resources;
    };
  }

  /**
   * Describe a set of action
   * @param {function[]} actions - Test actions, which will be done in parallel
   * @returns {function} Function which sent request in parallel
   */
  parallel(...actions) {
    return async () => {
      const resources = await parallel(actions.map( action => (
        async () => (await action(this.context))
      )));

      resources.capturedData = resources.reduce((acc, res) => ({
        ...acc,
        ...res.capturedData,
      }), {});

      this.context = {
        ...this.context,
        ...resources.capturedData,
      };

      return resources;
    };
  }

  /**
   * Describe a test suite
   * @param {string} title - Title of test suite
   * @param {function} request - Request for testing
   * @param {object} assertions - Set of necessary assertions
   * @returns {function} - Function which start test
   */
  test(title, request, assertions) {
    const driver = DriverProvider.resolve();

    return function test(tasty) {
      driver.test(title, request, assertions, tasty);
    };
  }

  /**
   * Describe a suites of tests
   * @param title
   * @param suites
   * @param request
   * @param assertions
   * @param isParallel
   * @returns {tests}
   */
  tests(title, suites, request, assertions, isParallel) {
    const driver = DriverProvider.resolve();

    return function tests(tasty) {
      driver.tests(title, suites, request, assertions, isParallel, tasty);
    };
  }

  /**
   * Descripes think function to get special structure for waiting procedure
   * @param {number} seconds - seconds to pause the virtual user
   */
  think(seconds) {
    const driver = DriverProvider.resolve();

    return driver.think(seconds);
  }

  log(message) {
    const driver = DriverProvider.resolve();

    return driver.log(message);
  }
}

module.exports = Tasty;
