const expect = require('chai').expect;
const uuid = require('uuid').v4;

const captureData = require('../libs/utils').captureData;

describe('Check captureData function', () => {
  let TOKEN;
  let CONTEXT_PROP_NAME;

  beforeEach(() => {
    TOKEN = uuid();
    CONTEXT_PROP_NAME = uuid();
  });

  it('Should capture the first level one prop from object', () => {
    const res = captureData({
      as: CONTEXT_PROP_NAME,
      json: '$.authorizationToken',
    }, {
      data: {
        authorizationToken: TOKEN,
      },
    });

    expect(res).has.property(CONTEXT_PROP_NAME);
    expect(res[CONTEXT_PROP_NAME]).equal(TOKEN);
  });

  it('Should capture any deep level one prop from object', () => {
    const res = captureData({
      as: CONTEXT_PROP_NAME,
      json: '$.auth.user.authorizationToken',
    }, {
      data: {
        auth: {
          user: {
            authorizationToken: TOKEN,
          },
        },
      },
    });

    expect(res).has.property(CONTEXT_PROP_NAME);
    expect(res[CONTEXT_PROP_NAME]).equal(TOKEN);
  });

  it('Should capture many props from object', () => {
    const res = captureData([{
      as: 'a',
      json: '$.a',
    }, {
      as: 'b',
      json: '$.bb.b',
    }], {
      data: {
        a: 1,
        b: 2,
        bb: {
          b: 3,
        },
      },
    });

    expect(res).has.property('a');
    expect(res.a).equal(1);
    expect(res).has.property('b');
    expect(res.b).equal(3);
  });
});
