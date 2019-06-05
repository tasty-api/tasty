## Classes

[App](#app)
<dd><p>Class representing an application</p></dd>

[Resource](#resource)
<dd><p>Class representing a resource</p></dd>

[Runner](#runner)
<dd><p>Class representing a test runner</p></dd>

[Service](#service)
<dd><p>Class representing external service</p></dd>

[Tasty](#tasty)
<dd><p>Class representing a Tasty library</p></dd>

## Functions

[captureData - Capture data from response to context(capture, requestData)](#captureData-capture-data-from-response-to-contextcapture-requestData-⇒-object-arrayltobjectgt) ⇒ <code>object</code> | <code>Array.&lt;object&gt;</code>

[getValue - Get value from object by JsonPath(jsonPath, obj)](#getValue-get-value-from-object-by-jsonpathjsonpath-obj-⇒-) ⇒ <code>*</code>

[splitActions - Split action on three five groups(actions)](#splitactions-split-action-on-three-five-groupsactions-⇒-object) ⇒ <code>object</code>

<a name="App"></a>

## App
Class representing an application

**Kind**: global class  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>cfg.host</td><td><code>object</code></td><td><p>Hosts&#39; list by environment</p>
</td>
    </tr><tr>
    <td>cfg.host.develop</td><td><code>string</code></td><td><p>Host for development environment</p>
</td>
    </tr><tr>
    <td>cfg.host.testing</td><td><code>string</code></td><td><p>Host for testing environment</p>
</td>
    </tr><tr>
    <td>cfg.host.product</td><td><code>string</code></td><td><p>Host for production environment</p>
</td>
    </tr>  </tbody>
</table>


* [App](#App)
    * [new App(name, cfg)](#new-appname-cfg)
    * [.init([srcDir])](#appinitsrcdir)
    * [.declare(opts)](#appdeclareopts)

<a name="new_App_new"></a>

### new App(name, cfg)
Create an application

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>name</td><td><code>string</code></td><td><p>Application name</p>
</td>
    </tr><tr>
    <td>cfg</td><td><code>object</code></td><td><p>Application configuration</p>
</td>
    </tr>  </tbody>
</table>

<a name="App+init"></a>

### app.init([srcDir])
Initialize an application

**Kind**: instance method of [<code>App</code>](#App)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[srcDir]</td><td><code>string</code></td><td><code>&quot;&#x27;/app&#x27;&quot;</code></td><td><p>Path to application directory</p>
</td>
    </tr>  </tbody>
</table>

<a name="App+declare"></a>

### app.declare(opts)
Declare an application resource

**Kind**: instance method of [<code>App</code>](#App)  
**Todo:**: - @property {object} [opts.schemas] - JSON schemas of responses by status  
**Todo**

- Maybe additional separation by environment makes sense here [develop|testing|product]
- Maybe additional separation by environment makes sense here [develop|testing|product]

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>opts</td><td><code>object</code></td><td><p>Resource&#39;s options</p>
</td>
    </tr>  </tbody>
</table>

**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>opts.url</td><td><code>string</code></td><td></td><td><p>Resource&#39;s url</p>
</td>
    </tr><tr>
    <td>[opts.methods]</td><td><code>Array.&lt;string&gt;</code></td><td><code>[&quot;get&quot;]</code></td><td><p>Set of available resource&#39;s methods</p>
</td>
    </tr><tr>
    <td>[opts.alias]</td><td><code>string</code></td><td></td><td><p>Short name for resource</p>
</td>
    </tr><tr>
    <td>[opts.headers]</td><td><code>object</code></td><td><code>{}</code></td><td><p>Default headers for resource, which will be used by default while sending
request</p>
</td>
    </tr><tr>
    <td>[opts.params]</td><td><code>object</code></td><td><code>{}</code></td><td><p>Default query parameters for resource, which will be used by default while
sending request</p>
</td>
    </tr><tr>
    <td>[opts.body]</td><td><code>object</code></td><td><code>{}</code></td><td><p>Default body for resource, which will be used by default while sending
request</p>
</td>
    </tr><tr>
    <td>[opts.mock]</td><td><code>object</code></td><td><code>{}</code></td><td><p>Default mock response, which will be used by default while sending request</p>
</td>
    </tr><tr>
    <td>[opts[get|head|post|put|delete|connect|options|trace|patch]]</td><td><code>object</code></td><td></td><td><p>Mock object</p>
</td>
    </tr><tr>
    <td>[opts.schemas[get|head|post|put|delete|connect|options|trace|patch]]</td><td><code>object</code></td><td></td><td><p>Schema for response</p>
</td>
    </tr>  </tbody>
</table>

<a name="Resource"></a>

## Resource
Class representing a resource

**Kind**: global class  
**Todo:**: - @property {object} [opts.schemas] - JSON schemas of responses by status  
**Todo**

- Maybe additional separation by environment makes sense here [develop|testing|product]
- Maybe additional separation by environment makes sense here [develop|testing|product]

**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>opts.url</td><td><code>string</code></td><td></td><td><p>Resource&#39;s url</p>
</td>
    </tr><tr>
    <td>[opts.methods]</td><td><code>Array.&lt;string&gt;</code></td><td><code>[&quot;get&quot;]</code></td><td><p>Set of available resource&#39;s methods</p>
</td>
    </tr><tr>
    <td>[opts.alias]</td><td><code>string</code></td><td></td><td><p>Short name for resource</p>
</td>
    </tr><tr>
    <td>[opts.headers]</td><td><code>object</code></td><td><code>{}</code></td><td><p>Default headers for resource, which will be used by default while sending
request</p>
</td>
    </tr><tr>
    <td>[opts.params]</td><td><code>object</code></td><td><code>{}</code></td><td><p>Default query parameters for resource, which will be used by default while
sending request</p>
</td>
    </tr><tr>
    <td>[opts.body]</td><td><code>object</code></td><td><code>{}</code></td><td><p>Default body for resource, which will be used by default while sending
request</p>
</td>
    </tr><tr>
    <td>[opts.mock]</td><td><code>object</code></td><td><code>{}</code></td><td><p>Default mock response, which will be used by default while sending request</p>
</td>
    </tr><tr>
    <td>[opts[get|head|post|put|delete|connect|options|trace|patch]]</td><td><code>object</code></td><td></td><td><p>Mock object</p>
</td>
    </tr><tr>
    <td>[opts.schemas[get|head|post|put|delete|connect|options|trace|patch]]</td><td><code>object</code></td><td></td><td><p>Schema for response</p>
</td>
    </tr>  </tbody>
</table>


* [Resource](#resource)
    * [new Resource(opts, app)](#new-resourceopts-app)
    * [.setHeaders(headers)](#resourcesetheadersheaders-⇒-resource) ⇒ [<code>Resource</code>](#resource)
    * [.getHeaders()](#resourcegetheaders-⇒-object) ⇒ <code>object</code>
    * [.setParams(params)](#resourcesetparamsparams-⇒-resource) ⇒ [<code>Resource</code>](#resource)
    * [.getParams()](#resourcegetparams-⇒-object) ⇒ <code>object</code>
    * [.setBody(body)](#resourcesetbodybody-⇒-resource) ⇒ [<code>Resource</code>](#resource)
    * [.getBody()](#resourcegetbody-⇒-object) ⇒ <code>object</code>
    * [.setMock(mock)](#resourcesetmockmock-⇒-resource) ⇒ [<code>Resource</code>](#resource)
    * [.getMock(method, mock)](#resourcegetmockmethod-mock-⇒-object) ⇒ <code>object</code>
    * [.getSchema(method, responseCode)](#resourcegetschemamethod-responsecode)
    * [.checkStatus(expected)](#resourcecheckstatusexpected)
    * [.checkStatusText(expected)](#resourcecheckstatustextexpected)
    * [.checkStructure()](#resourcecheckstructure)
    * [.checkHeaders(expected)](#resourcecheckheadersexpected)
    * [.checkMessage(expected)](#resourcecheckmessageexpected)
    * [.check(fn, ctx)](#resourcecheckfn-ctx)

<a name="new_Resource_new"></a>

### new Resource(opts, app)
Create a resource

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>opts</td><td><code>object</code></td><td><p>Resource&#39;s options</p>
</td>
    </tr><tr>
    <td>app</td><td><code><a href="#App">App</a></code></td><td><p>An application instance</p>
</td>
    </tr>  </tbody>
</table>

<a name="Resource+setHeaders"></a>

### resource.setHeaders(headers) ⇒ [<code>Resource</code>](#Resource)
Set temporary headers for request

**Kind**: instance method of [<code>Resource</code>](#Resource)  
**Returns**: [<code>Resource</code>](#Resource) - A Resource object  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>headers</td><td><code>object</code></td><td><p>Headers for request</p>
</td>
    </tr>  </tbody>
</table>

<a name="Resource+getHeaders"></a>

### resource.getHeaders() ⇒ <code>object</code>
Get full headers for request

**Kind**: instance method of [<code>Resource</code>](#Resource)  
**Returns**: <code>object</code> - A headers object  
<a name="Resource+setParams"></a>

### resource.setParams(params) ⇒ [<code>Resource</code>](#Resource)
Set temporary query parameters for request

**Kind**: instance method of [<code>Resource</code>](#Resource)  
**Returns**: [<code>Resource</code>](#Resource) - A Resource object  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>params</td><td><code>object</code></td><td><p>Query parameters for request</p>
</td>
    </tr>  </tbody>
</table>

<a name="Resource+getParams"></a>

### resource.getParams() ⇒ <code>object</code>
Get full query parameters for request

**Kind**: instance method of [<code>Resource</code>](#Resource)  
**Returns**: <code>object</code> - A query parameters object  
<a name="Resource+setBody"></a>

### resource.setBody(body) ⇒ [<code>Resource</code>](#Resource)
Set temporary body for request

**Kind**: instance method of [<code>Resource</code>](#Resource)  
**Returns**: [<code>Resource</code>](#Resource) - A Resource object  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>body</td><td><code>object</code></td><td><p>Body for request</p>
</td>
    </tr>  </tbody>
</table>

<a name="Resource+getBody"></a>

### resource.getBody() ⇒ <code>object</code>
Get full body for request

**Kind**: instance method of [<code>Resource</code>](#Resource)  
**Returns**: <code>object</code> - A body object  
<a name="Resource+setMock"></a>

### resource.setMock(mock) ⇒ [<code>Resource</code>](#Resource)
Mock response with object

**Kind**: instance method of [<code>Resource</code>](#Resource)  
**Returns**: [<code>Resource</code>](#Resource) - A Resource object  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>mock</td><td><code>object</code></td><td><p>A mock object</p>
</td>
    </tr>  </tbody>
</table>

<a name="Resource+getMock"></a>

### resource.getMock(method, mock) ⇒ <code>object</code>
Get mock for response

**Kind**: instance method of [<code>Resource</code>](#Resource)  
**Returns**: <code>object</code> - A mock object  
<table>
  <thead>
    <tr>
      <th>Param</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>method</td>
    </tr><tr>
    <td>mock</td>
    </tr>  </tbody>
</table>

<a name="Resource+getSchema"></a>

### resource.getSchema(method, responseCode)
**Kind**: instance method of [<code>Resource</code>](#Resource)  
**Todo**

- JSDoc

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>method</td><td><code>string</code></td>
    </tr><tr>
    <td>responseCode</td><td><code>number</code></td>
    </tr>  </tbody>
</table>

<a name="Resource+checkStatus"></a>

### resource.checkStatus(expected)
Check response status

**Kind**: instance method of [<code>Resource</code>](#Resource)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>expected</td><td><code>number</code> | <code>string</code></td><td><p>Expected status value</p>
</td>
    </tr>  </tbody>
</table>

<a name="Resource+checkStatusText"></a>

### resource.checkStatusText(expected)
Check response status text

**Kind**: instance method of [<code>Resource</code>](#Resource)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>expected</td><td><code>string</code></td><td><p>Expected statusText value</p>
</td>
    </tr>  </tbody>
</table>

<a name="Resource+checkStructure"></a>

### resource.checkStructure()
Check response body by schema

**Kind**: instance method of [<code>Resource</code>](#Resource)  
<a name="Resource+checkHeaders"></a>

### resource.checkHeaders(expected)
Check response headers

**Kind**: instance method of [<code>Resource</code>](#Resource)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>expected</td><td><code>object</code></td><td><p>Expected headers object</p>
</td>
    </tr>  </tbody>
</table>

<a name="Resource+checkMessage"></a>

### resource.checkMessage(expected)
Check response message

**Kind**: instance method of [<code>Resource</code>](#Resource)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>expected</td><td><code>string</code></td><td><p>Expected message value</p>
</td>
    </tr>  </tbody>
</table>

<a name="Resource+check"></a>

### resource.check(fn, ctx)
Check response by custom checking function

**Kind**: instance method of [<code>Resource</code>](#Resource)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>fn</td><td><code>function</code></td><td><p>Custom checking function</p>
</td>
    </tr><tr>
    <td>ctx</td><td><code>object</code></td><td><p>Execution context</p>
</td>
    </tr>  </tbody>
</table>

<a name="Runner"></a>

## Runner
Class representing a test runner

**Kind**: global class  

* [Runner](#Runner)
    * [new Runner([dir])](#new-runnerdir)
    * [.run(type, isParallel)](#runnerruntype-isparallel)

<a name="new_Runner_new"></a>

### new Runner([dir])
Create a test runner

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[dir]</td><td><code>string</code></td><td><code>&quot;&#x27;/test&#x27;&quot;</code></td><td><p>Path to functional tests directory</p>
</td>
    </tr>  </tbody>
</table>

<a name="Runner+run"></a>

### runner.run(type, isParallel)
Run tests by type

**Kind**: instance method of [<code>Runner</code>](#Runner)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>type</td><td><code>string</code></td><td></td><td><p>Type of tests, could be func or load</p>
</td>
    </tr><tr>
    <td>isParallel</td><td><code>boolean</code></td><td><code>false</code></td><td><p>Flag for running tests in parallel mode</p>
</td>
    </tr>  </tbody>
</table>

<a name="Service"></a>

## Service
Class representing external service

**Kind**: global class  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>opts.host</td><td><code>object</code></td><td><p>Hosts&#39; list by environment</p>
</td>
    </tr><tr>
    <td>opts.host.develop</td><td><code>string</code></td><td><p>Host for development environment</p>
</td>
    </tr><tr>
    <td>opts.host.testing</td><td><code>string</code></td><td><p>Host for testing environment</p>
</td>
    </tr><tr>
    <td>opts.host.product</td><td><code>string</code></td><td><p>Host for production environment</p>
</td>
    </tr><tr>
    <td>opts.headers</td><td><code>object</code></td><td><p>Headers&#39; list by environment</p>
</td>
    </tr><tr>
    <td>opts.headers.develop</td><td><code>string</code></td><td><p>Headers for development environment</p>
</td>
    </tr><tr>
    <td>opts.headers.testing</td><td><code>string</code></td><td><p>Headers for testing environment</p>
</td>
    </tr><tr>
    <td>opts.headers.product</td><td><code>string</code></td><td><p>Headers for production environment</p>
</td>
    </tr>  </tbody>
</table>


* [Service](#Service)
    * [new Service(opts)](#new-serviceopts)
    * [.send(opts)](#servicesendopts)

<a name="new_Service_new"></a>

### new Service(opts)
Create external service

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>opts</td><td><code>object</code></td><td><p>Options for service</p>
</td>
    </tr>  </tbody>
</table>

<a name="Service+send"></a>

### service.send(opts)
Send request to service

**Kind**: instance method of [<code>Service</code>](#Service)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>opts</td><td><code>object</code></td><td><p>Request options</p>
</td>
    </tr>  </tbody>
</table>

<a name="Tasty"></a>

## Tasty
Class representing a Tasty library

**Kind**: global class  

* [Tasty](#Tasty)
    * [.case(title, ...actions)](#tastycasetitle-actions)
    * [.series(...actions)](#tastyseriesactions-⇒-function) ⇒ <code>function</code>
    * [.parallel(...actions)](#tastyparallelactions-⇒-function) ⇒ <code>function</code>
    * [.suite(title, request, assertions)](#tastysuitetitle-request-assertions-⇒-function) ⇒ <code>function</code>
    * [.suites(title, suites, request, assertions, isParallel)](#tastysuitestitle-suites-request-assertions-isparallel-⇒-tests) ⇒ <code>tests</code>

<a name="Tasty+case"></a>

### tasty.case(title, ...actions)
Describe a test case

**Kind**: instance method of [<code>Tasty</code>](#Tasty)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>title</td><td><code>string</code></td><td><p>Test case title</p>
</td>
    </tr><tr>
    <td>...actions</td><td><code>Array.&lt;function()&gt;</code></td><td><p>Test actions</p>
</td>
    </tr>  </tbody>
</table>

<a name="Tasty+series"></a>

### tasty.series(...actions) ⇒ <code>function</code>
Describe a set of actions

**Kind**: instance method of [<code>Tasty</code>](#Tasty)  
**Returns**: <code>function</code> - Function which sent request in series  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>...actions</td><td><code>Array.&lt;function()&gt;</code></td><td><p>Test actions, which will be done in series</p>
</td>
    </tr>  </tbody>
</table>

<a name="Tasty+parallel"></a>

### tasty.parallel(...actions) ⇒ <code>function</code>
Describe a set of action

**Kind**: instance method of [<code>Tasty</code>](#Tasty)  
**Returns**: <code>function</code> - Function which sent request in parallel  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>...actions</td><td><code>Array.&lt;function()&gt;</code></td><td><p>Test actions, which will be done in parallel</p>
</td>
    </tr>  </tbody>
</table>

<a name="Tasty+suite"></a>

### tasty.suite(title, request, assertions) ⇒ <code>function</code>
Describe a test suite

**Kind**: instance method of [<code>Tasty</code>](#Tasty)  
**Returns**: <code>function</code> - - Function which start test  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>title</td><td><code>string</code></td><td><p>Title of test suite</p>
</td>
    </tr><tr>
    <td>request</td><td><code>function</code></td><td><p>Request for testing</p>
</td>
    </tr><tr>
    <td>assertions</td><td><code>object</code></td><td><p>Set of necessary assertions</p>
</td>
    </tr>  </tbody>
</table>

<a name="Tasty+suites"></a>

### tasty.suites(title, suites, request, assertions, isParallel) ⇒ <code>tests</code>
Describe a suites of tests

**Kind**: instance method of [<code>Tasty</code>](#Tasty)  
<table>
  <thead>
    <tr>
      <th>Param</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>title</td>
    </tr><tr>
    <td>suites</td>
    </tr><tr>
    <td>request</td>
    </tr><tr>
    <td>assertions</td>
    </tr><tr>
    <td>isParallel</td>
    </tr>  </tbody>
</table>

<a name="captureData - Capture data from response to context"></a>

## captureData - Capture data from response to context(capture, requestData) ⇒ <code>object</code> \| <code>Array.&lt;object&gt;</code>
**Kind**: global function  
**Returns**: <code>object</code> \| <code>Array.&lt;object&gt;</code> - - Captured data from response  
<table>
  <thead>
    <tr>
      <th>Param</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>capture</td>
    </tr><tr>
    <td>requestData</td>
    </tr>  </tbody>
</table>

<a name="getValue - Get value from object by JsonPath"></a>

## getValue - Get value from object by JsonPath(jsonPath, obj) ⇒ <code>\*</code>
**Kind**: global function  
<table>
  <thead>
    <tr>
      <th>Param</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>jsonPath</td>
    </tr><tr>
    <td>obj</td>
    </tr>  </tbody>
</table>

<a name="splitActions - Split action on three five groups"></a>

## splitActions - Split action on three five groups(actions) ⇒ <code>object</code>
**Kind**: global function  
**Returns**: <code>object</code> - - Object with actions' groups  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>actions</td><td><code>Array.&lt;function()&gt;</code></td><td><p>Tests actions</p>
</td>
    </tr>  </tbody>
</table>

