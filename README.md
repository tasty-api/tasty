<p align="center">
  <img alt="TastyJS" src="https://raw.githubusercontent.com/tasty-api/tasty/master/src/assets/logos/tasty-new.svg" />
</p>

# TastyJS [![CircleCI](https://circleci.com/gh/tasty-api/tasty/tree/master.svg?style=svg)](https://circleci.com/gh/tasty-api/tasty/tree/master)

TastyJS is an API testing framework (contract testing) which will make your testing process tastier.

TastyJS doesn't pretend to be a Swizz knife in testing world. It's a syntactic sugar above mocha and other testing kitchen
stuff related to api testing. The main goal is make api testing process as easy as it possible.

You don't need to know anything about testing standards, dictionary, and community conventions.

You just write, what you hear.

This tool limits the number of degrees of freedom. In this case, if you a programming geek, here you will be cramped.
If you want to focus on the essence of api testing, and want to increase the speed of this process, this tool is for you.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [Sponsors](#sponsors)
- [License](#license)

## Installation

```shell
npm i -S tasty-api
```

## Usage

You need just 5 simple steps:

### 1. Define an application

```javascript
const App = require('tasty-api').App; // 1. import App constructor

const app = module.exports = new App('application_name', { // 2. Define application name
  host: {
    develop: 'http://localhost:3000/api/v1', // 3. Define application hosts by environments (develop by default)
  },
});

app.init(__dirname); // 4. Initialize application resources
```

### 2. Define an application resources

```javascript
const app = require('path to your defined application on the previous step'); // 1. import your defined application

app.declare({ // 2. declare resource in the application
  url: 'resource/url', // without leading slash
  alias: 'resource', // define short alias for resource if needed
  methods: ['get', 'post', 'delete'], // define a set of available methods for resource
  // also you can predefine some common settings, like headers or query parameters, which will be set by default
});

// ... etc.
```

### 3. Write tests

```javascript
const app = require('path to your defined application on the first step'); // 1. import your defined application
const tasty = require('tasty-api').tasty; // 2. import tasty

tasty.case(
  'Title your test case',
  null, // use `null` to write predefined static tests, or you can use any preparation here to get data based on which tests will be formed
  // do any preparations before tests
  // for example:
  // app.login.post(); // you should define login resource in your application
  tasty.test(
    'Title your test',
    app.resource.get(), // specify resource and method, which you want to test
    {
      checkStatus: 200,
      checkSchema: { /* here could be your JSON Schema*/ },
    }, // specify checkers
  ),
  // do any completions after tests
  // for example:
  // app.logout.post(); // you should define logout resource in you application
);

// ... etc.
```

### 4. Run tests

```shell
tasty-api
```

### 5. Drink coffee with a slice of cherry pie :coffee: :cake:

## Contributing

In the project strictly used:

- [GitFlow](https://ru.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) workflow
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) in commit messages

## Sponsors
![Leroy Merlin](https://raw.githubusercontent.com/tasty-api/tasty/master/src/assets/sponsors/LM.svg)
![LM Tech](https://raw.githubusercontent.com/tasty-api/tasty/master/src/assets/sponsors/LM-tech.svg)

## License
This project is licensed under the terms of the Apache-2.0 license.
