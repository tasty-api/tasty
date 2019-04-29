# TastyJS

TastyJS is an API testing framework which will make your testing process tastier.

Tasty doesn't pretend to be a Swizz knife in testing world. It's a syntactic sugar under mocha and other testing kitchen
staff related to api testing. The main goal is make api testing process as easier as it possible.

You don't need to know anything about testing standards, dictionary, and community conventions.

You just write, what you hear.

```javascript
import tasty from 'tasty';
import app from '../app';

tasty.case('Tests for /login',
  tasty.suite(
    'Response status',
    app.login.post(),
    {
      checkStatus: 200
    }
  )
);
```
or something more complex
```javascript
import tasty from 'tasty';
import app from '../app';

tasty.case('Tests for /product',
  app.login
    .setMock({
      token: 'some mock server token',
    })
    .post({
    capture: {
      json: '$.token',
      as: 't',
    },
  }),
  tasty.suite(
    'Response structure',
    app.product.get(),
    {
      checkStatus: 200,
      checkStatusText: 'OK',
      checkStructure: true,
      check: (res, ctx) => ctx.t === 'some mock server token',
    },
  ),
  app.logout.post(),
);
```

This tool limits the number of degrees of freedom. In this case, if you a programming geek, here you will be cramped.
If you want to focus on the essence of api testing, and want to increase the speed of this process, this tool is for you.
