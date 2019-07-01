<p align="center">
  <img src="src/assets/logo.svg" >
</p>


# TastyJS [![Build Status](https://travis-ci.org/JIoJIaJIu/tasty.svg?branch=master)](https://travis-ci.org/JIoJIaJIu/tasty)

TastyJS is an API testing framework which will make your testing process tastier.

TastyJS doesn't pretend to be a Swizz knife in testing world. It's a syntactic sugar above mocha and other testing kitchen
stuf related to api testing. The main goal is make api testing process as easier as it possible.

You don't need to know anything about testing standards, dictionary, and community conventions.

You just write, what you hear.

This tool limits the number of degrees of freedom. In this case, if you a programming geek, here you will be cramped.
If you want to focus on the essence of api testing, and want to increase the speed of this process, this tool is for you.

## PoC

`TastyJS` provides unified approach for development, support and testing REST API endpoints

`TastyJS` is built on top `Application` abstraction  
Every `Application` has list of `Resources`  
one `Resouce` describe single REST API url - `path` and related configuration  

There is `Service` - mock abstraction for `Resource`, that allow to declare required `Resource` headers, status codes, response in declarative maner and use for TDD development  

`TastyJS` provides interface for testing each `Resource` with specific api:

### TEST API

Simple test:
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
