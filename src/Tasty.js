const { promisify } = require('util');
const waterfall = promisify(require('async/waterfall'));
const log = require('../libs/log')(module);

class Tasty {
  constructor() {
    this.context = {}; // @todo for every launch only single instance of context
  }

  getRunner() {
    // console.log('init test runner for project');
  };

  case(title, test) {
    // const { ante = [], anteEach = [], post = [], postEach = [], test = [] } = splitActions(actions);

    describe(title, () => {
      console.log(title, this.context);
      test();
    });
  };

  series(...steps) {
    const that = this;

    return function series() {
      log.warn('series');
      const bef = [];
      const che = [];
      const aft = [];
      const ser = [];

      const start = steps.findIndex(step => step.name === 'checkingFunc');

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];

        if (step.name === 'series') {
          ser.push(step);
        }

        if (i < start || start === -1) {
          bef.push(step);
        } else if (step.name === 'checkingFunc') {
          che.push(step);
        } else {
          aft.push(step);
        }
      }
      before(async () => {
        const ctx = await waterfall(bef.map((step, i) => {
          return async (context = {}) => {
            const response = await step(context);

            that.context = {
              ...context,
              ...(response ? response.context : {}),
            };
            return that.context;
          };
        }));

        ser.forEach(s => s());
      });

      che.forEach(c => c(that.context));

      after(async () => {
        await waterfall(aft.map((step, i) => {
          return async (context = {}) => {
            const response = await step(context);
          };
        }));
      });
      return that.context;
    }
  };

  parallel(...args) {
    // console.log('parallel', args);
  }

  suite(title, request, assertions) {
    const that = this;
    return function checkingFunc (context) {
      log.warn('suite');

      it(title, async () => {
        const { res } = await request(that.context);

        Object.keys(assertions).forEach(assertion => {
          res[assertion](assertions[assertion]);
        });
      });

      return true;
    };
  }
}

module.exports = Tasty;

function splitActions(actions) {
  actions.forEach(action => {
    console.log(action.name);
  });

  return {
    ante: [],
    anteEach: [],
    post: [],
    postEach: [],
    test: [],
  };
}
