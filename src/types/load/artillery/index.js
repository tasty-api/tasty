//const nconf = require('nconf');
const path = require('path');
const fs = require('fs');
const qs = require('querystring');
//const ajv = require('ajv');
/**
 * оборачивает функции вида (path, data, callback)
 * @param fcn {function}
 * @param dirname {string}
 * @param options {object=} {}
 * @param data {object}
 * @returns {Promise<any>}
 */
const promisifyWriteFs = (fcn, dirname, options, data = null) => {
  let _data = data;
  // if options are specified, the data will be specified as 4th parameter,
  // otherwise the data will be on the options' place
  if (!_data) {
    _data = options;
    options = null;
  }
  return new Promise((resolve, reject) => {
    fcn(dirname, _data, options, (err, res) => {
      if (!err) {
        resolve(res);
      } else {
        reject(err);
      }
    });
  });
};

/**
 * artillery functionality class
 */
class Artillery {
  constructor(defaultParams = {}) {
    if(defaultParams && Object.keys(defaultParams).length)
    {
      this.configuration={};
      this.configuration.config = defaultParams;
      this.configuration.scenarios = [];
    }
    else {
      this.configuration = {
        config: {
          target: null,
          tls: {},
          phases: [],
        },
        scenarios: []
      };
    }
    this.configfileName = 'artilleryConfig.json';
  }

  /**
   * cleans the scenario section of empty scenarios
   * @private
   */
  _cleanScenarios(){
    let i = 0;
    this.configuration.scenarios = this.configuration.scenarios.filter(elt=>(Object.keys(elt).length));
    /*while(i<this.configuration.scenarios.length)
    {
      if(this.configuration.scenarios[i] && !Object.keys(this.configuration.scenarios[i]).length)
      {
        this.configuration.scenarios.splice(i,1);
      }
      i++;
    }*/
  }
  /**
   * sets the configuration for artillery
   * @param configuration
   */
  setConfiguration(configuration)
  {
    this.configuration.config = configuration.config;
  }
  /**
   *
   * @param scenariosObject - an array of flow objects:[{flow:....},{flow:...}]
   * @returns {Scenario}
   */
  static createScenarios(scenariosObject = []) {
    if (scenariosObject && scenariosObject.length) {
      return new Scenario(scenariosObject);
    } else {
      return new Scenario();
    }
  }

  /**
   * adds the flow object to
   * @param scenario
   * @returns {Artillery}
   */
  addScenarioSection(scenario) {
    // if scenario.scenarios = input object is an instance of Scenario class
    if (scenario.scenarios) {
      this.configuration.scenarios.push(...scenario.scenarios);
    } else {
      //else - we just pass scenario as an array of {flow:...} objects
      this.configuration.scenarios.push(...scenario);
    }
    this._cleanScenarios();
    return this;
  }

  get() {
    return this.configuration;
  }

  addPhase(phaseObject) {
    //@todo check via jsonSchema!!!
    this.configuration.config.phases.push(phaseObject);
    return this;
  }

  changeTarget(targetString) {
    this.configuration.config.target = targetString;
    return this;
  }

  disableTLS() {
    this.configuration.config.tls = {
      rejectUnauthorized: false
    };
    return this;
  }

  requestTimeout(seconds) {
    this.configuration.config.http = {
      timeout: seconds
    };
    return this;
  }


  //@todo make refactoring!!!
  /**
   *
   * @param fullPath
   * @param options
   * @returns {Promise<any>}
   */
  async saveToFile(options = null, fullPath = null) {
    this.config = {
      a: 1,
      b: 2
    };
    return await promisifyWriteFs(fs.writeFile, fullPath ? path.resolve(fullPath) : this.configfileName, options, JSON.stringify(this.config));
  }


}

class Scenario {
  /**
   *
   * @param flowsArray - an array of flow objects:[{flow:....},{flow:...}]
   */
  constructor(flowsArray = []) {
    //@todo add jsonSchema validation!
    this.scenarios = [];
    if (flowsArray.flow) {
      //if we have an object
      this.scenarios = [flowsArray];
    } else if (Array.isArray(flowsArray) && flowsArray.length) {
      this.scenarios = [...flowsArray];
    }
  }

  /**
   * creates new flow object to manipulate it inside Scenarios property of Artillery config
   * @param flowObject - an array of requests or the object with flow property equal to array of requests:
   * {flow:[]}
   * @returns {HttpFlow}
   */
  static createFlow(flowObject = {}) {
    if (flowObject && Object.keys(flowObject).length) {
      if (flowObject.flow) {
        return (new HttpFlow(flowObject.flow)).get();
      } else {
        return (new HttpFlow(flowObject)).get();
      }
    }
  }

  /**
   * adds single flow to scenarios object
   * @param flowObject
   */
  addFlowToScenarios(flowObject) {
    //@todo add schema validation
    if (flowObject.flow) {
      this.scenarios.push(flowObject);
    } else {
      this.scenarios.push({ flow: flowObject });
    }
    return this;
  }

  get() {
    return { scenarios: this.scenarios };
  };
}

/**
 * class representing basic http flow for artillery
 */
/**
 * ARTILLERY DOCUMENTATION:
 * An HTTP request object may have the following attributes:

 url - the request URL; it will be appended to the target but can be fully qualified also
 json - a JSON object to be sent in the request body
 body - arbitrary data to be sent in the request body
 headers - a JSON object describing header key-value pairs
 cookie - a JSON object describing cookie key-value pairs
 capture - use this to capture values from the response body of a request and store those in variables
 */
class HttpFlow {
  /**
   *
   * @param {array} requests - instances of class SingleRequest.get()
   */
  constructor(requests = []) {
    //flow consists of @SingleRequest instances, the class is described further
    this.flow = [];
    if (requests.length) {
      this.flow.push(...requests);
      //@todo add jsonSchema validation to check the input structure of flow
    }
  }

  /**
   * get the flow object
   * @returns {{flow: Array}}
   */
  get() {
    return { flow: this.flow };
  }

  /**
   * create SingleRequest instance to manipulate it in flow
   * @param reqObject
   * @returns {SingleRequest}
   */
  static createSingleRequest(reqObject = {}) {
    //@todo add jsonSchema validation to check the input structure of reqObject
    return new SingleRequest(reqObject);
  }

  /**
   * adds the request object (the instance of SingleRequest) to the flow
   * @param requestInstance
   */
  addRequest(requestInstance = null) {
    //@todo check instanceof(request instance)!!! if it is SingleRequest, process it, else - create SingleRequest instance and process it
    if (requestInstance.request) {
      const request = requestInstance.get();
      this.flow.push(request);
    } else {
      this.flow.push(requestInstance);
    }
    return this;
  }

  addWaitSection(secondsCount) {
    const instance = (new SingleRequest({ think: secondsCount })).get();
    this.flow.push(instance);
    return this;
  }

  addLogSection(logMessage) {
    const instance = (new SingleRequest({ log: logMessage })).get();
    this.flow.push(instance);
    return this;
  }
}


const avaliableRequestTypes = new Set(['get', 'post', 'put', 'patch', 'delete']);

/**
 * instance represents a single request object like get{}, post{},etc to be passed into flow object array
 * TYPES: "get" | "post" | "put" | "patch" | "delete" and additional "log" for logging
 * and "think" for waiting process
 */
class SingleRequest { //flow action
  /**
   *
   * @param {object} requestObject - an object like {get:{url:"/pets"}}
   */
  constructor({ method, path, body, headers, params, capture } = {}) {
    //@todo add json schema object validation for incoming requestObject
    /*this.avaliableTypes = new Set(['get', 'post', 'put', 'patch', 'delete', 'log', 'think']);*/
    this.request = {};
    if(arguments[0] && Object.keys(arguments[0]).length) {
      if (method) {
        this.name = method;
        this._keys = [{ path: 'url' }];

        this.request = {
          [method]: {
            url:path
          }
        };
        if (body && Object.keys(body).length) {
          this.request[method].json = body;
        }
        if (headers && Object.keys(headers).length) {
          this.request[method].headers = headers;
        }
        if (params && Object.keys(params).length) {
          //@todo not implemented
          this.request._params = { ...params };
          this._changeValuesForArtilleryConfig();
          this.request[method].url += '?' + qs.stringify(this.request._params);
          delete this.request._params;
        }
        if (capture) {
          this.request[method].capture = capture;
        }
      }
    }
  }

  /**
   * gets the schema for constructor to check whether incoming structure is correct
   * @returns {null}
   */
  static _getSchemaForInputValidation() {
    return true;
  }

  /**
   * stab for validation
   * @param data
   * @param schema
   * @returns {boolean}
   * @private
   */
  static _validateData(data = null, schema = null) {
    //@todo validation of real schema
    return true;
  }

  setUrl(url) {
    //@todo check input value for matching the url-structure
    this.request[this.name].url = url;
    return this;
  }

  /** headers section **/
  /**
   * sets the headers for the request
   * @param headers
   * @returns {SingleRequest}
   */
  setHeaders(headers) {
    //@todo issue: capture headers in input headers' notation
    // capture section will come as:
    //                     capture: {
    //                         json: '#["content-type"]',
    //                         as: 'ct',
    //                     }
    // Since artillery does not understand '#'-capturing character, so
    //@todo is to make capturing via afterResponse hook, store it in context
    //todo   variables as context[capture.as]=response.headers[capture.json(without symbol #)]
    //@ for more info see https://artillery.io/docs/http-reference/#function-signatures
    //@ and this issue: https://github.com/artilleryio/artillery/issues/82

    //now if we see something that matches pattern # in capture section, ignore or delete it from the result structure

    //@todo check headers for matching the correct structure
    this.request[this.name].headers = headers;
    return this;
  }

  /**
   * adds the headers to existing headers inside the request structure
   * @param headers
   * @returns {SingleRequest}
   */
  addHeaders(headers) {
    this.request[this.name].headers = { ...this.request.headers, ...headers };
    return this;
  }

  /**
   * sets the body of request object
   * @param body - json object of request body
   */
  setBody(body) {
    if ((avaliableRequestTypes.has(this.request[this.name])) && this.name !== 'get') {
      this.request[this.name].json = body;
    }
    return this;
  }

  /**
   * sets necessary cookies
   */
  setCookie(cookie) {
    this.request[this.name].cookie = cookie;
    return this;
  }

  /**
   * sets the interval for 'think'-type of request structure
   * @param seconds
   */
  setWaitInterVal(seconds) {
    const numberSeconds = Number(seconds);
    if (this.name === 'think' && !isNaN(numberSeconds)) {
      this.request[this.name] = numberSeconds;
    }
    return this;
  }

  /**
   * adds capture section to request object
   * @param capture
   */
  setCapture(capture) {
    if (this.request.capture && this.request.capture.length) {
      //if type of input capture is array, decompose it to the sequence of elements
      Array.isArray(capture) ? this.request.capture.push(...capture) : this.request.capture.push(capture);
    } else {
      this.request.capture = Array.isArray(capture) ? capture : [capture];
    }
  }


  /**
   * main function to get the ready request object from the instance
   * @returns {*|Object}
   */
  get() {
    //clean the object before returning it back
    if(this.request && Object.keys(this.request).length) {
      this._captureCheckRemove();
      this._changeValuesForArtilleryConfig();
      this._changeKeysForArtilleryConfig();
    }
    return this.request;
  }

  /**
   * cleans and replaces everything we want (use it inside constructor and get() method only)
   * @private
   */
  __cleanAndReplaceEverything() {
    this._captureCheckRemove();
    this._changeValuesForArtilleryConfig();
    this._changeKeysForArtilleryConfig();
  }

  _searchAndReplaceForArtillery(inputString) {
    function replacer(str) {
      const rE = /\${([^{}]+)}/;
      return `{{ ${str.match(rE)[1]} }}`;
    }

    const rExp = /(\${[^{}]+})/g;
    return inputString.replace(rExp, replacer);
  }
  static _searchAndReplaceForArtillery(inputString) {
    function replacer(str) {
      const rE = /\${([^{}]+)}/;
      return `{{ ${str.match(rE)[1]} }}`;
    }

    const rExp = /(\${[^{}]+})/g;
    return inputString.replace(rExp, replacer);
  }

  /**
   * changes the object keys from the ${some_key} to {{ some_key }} for artillery config
   * iterate through the request object recursively and change the strings containing ${some_name}
   * to strings containing {{ some_name }} - for artillery
   * @private
   */
  _changeValuesForArtilleryConfig() {
    /**
     * recursively iterate over object keys like tree traversal, replace all strings containing special characters
     * @param exceptionNames - names for keys that have not to be processed, e.g. "capture" -
     * the algorithm will leave it as it is
     */
    const self = this;

    function iterateWithExceptions(...exceptionNames) {
      const exceptions = new Set(exceptionNames);
      return function recursiveIterator(object) {
        //input object can be an array
        if (Array.isArray(object)) {
          //iterate over array elements to find strings
          for (let i = 0; i < object.length; i++) {
            object[i] = recursiveIterator(object[i]);
          }
          return object;
        } else if (typeof object === 'object') {
          for (let key in object) {
            //if the name of a key is included in exceptions array, do not do anything
            // example: we do not handle the "capture" objects
            if (!exceptions.has(key)) {
              object[key] = recursiveIterator(object[key]);
            }
          }
          return object;
        } else if (typeof object === 'string') {
          return self._searchAndReplaceForArtillery(object);
        } else {
          //return object as it is: only replace strings
          return object;
        }
      };
    }

    this.request = iterateWithExceptions('capture')(this.request);
  };

  /**
   *
   * @param keys - key-value pairs:
   *
   * @private
   */
  _changeKeysForArtilleryConfig() {
    const self = this;

    /**
     * search for key occurence in array
     * @param element {a:"b"}
     * @param array [{a:123,c:"abc"},...]
     */
    function finder(element, array) {
      const nameOfProperty = Object.keys(element)[0];
      return array.find(elt => (!!elt[nameOfProperty]));
    }

    /**
     * iterate over dictionary keys
     * @param key
     * @param array
     * @returns {*}
     */
    function keyFinder(key) {
      return self._keys.find(elt => (!!elt[key]));
    }

    function recursiveIterator(object) {
      if (Array.isArray(object)) {
        //iterate over an array
        for (let i = 0; i < object.length; i++) {
          object[i] = recursiveIterator(object[i]);
        }
      } else if (typeof object === 'object') {
        for (let key in object) {
          object[key] = recursiveIterator(object[key]);
          //checking if this key is in array of what to be changed
          const found = keyFinder(key);
          if (found) {
            //change the name of a key:
            object[found[key]] = object[key];
            //delete an old key:
            delete object[key];
          }
        }
      }
      return object;
    }

    this.request = recursiveIterator(this.request);
  }

  /**
   * auxiliary function to delete capture section if it contains hashtag(#) symbol
   * @private
   */
  _captureCheckRemove() {
    //to get the "capture" section, we should fall 1 level deeper:
    // insude get, post, delete, etc
    //const requestName = Object.keys(this.request)[0];// => 'get','post', etc
    const request = this.request[this.name];
    //this.capture may be null, object or array of objects to capture
    if (request.capture) {
      if (Array.isArray(request.capture)) {
        this._checkAndDeleteHashtagElementsFromCaptureArray(request, this.name);
      } else {
        //checking the same for object
        if (this._checkForHashtagElement(request.capture.json)) {
          delete this.request[this.name].capture;
        }
      }
    }
  }

  /**
   * checks input string for containing the hashtag symbol #
   * @param string
   * @returns {boolean}
   * @private
   */
  _checkForHashtagElement(string) {
    const regExp = /^#.*$/;
    return regExp.test(string);
  }

  /**
   * check for #-elements in capture section and delete them from an array of capture objects
   * @param request
   * @param requestName
   * @private
   */
  _checkAndDeleteHashtagElementsFromCaptureArray(request, requestName) {
    if (request.capture.length) {
      for (let i = 0; i < request.capture.length; i++) {
        if (this._checkForHashtagElement(request.capture[i].json)) {
          this.request[requestName].capture.splice(i, 1);
        }
      }
    }
  }
}

/**
 * simple adapter to be merged with tasty system
 */
class TastyAdapter{
  log(message) {
    return { log: SingleRequest._searchAndReplaceForArtillery(message) };
  };

  think(seconds){return { think: Number(seconds) };};
}

module.exports = {
  HttpFlow,
  SingleRequest,
  Scenario,
  Artillery: new Artillery(),
  TastyAdapter
};
