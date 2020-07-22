module.exports = {
  reporter: "mochawesome",        // Reporter name.
  reporterOptions: {              // Reporter settings object.
    reportDir: 'reports/func/',
    reportFilename: 'index.js',
  },
  color: true,                    // Color TTY output from reporter?
  // allowUncaught: "boolean",    // Propagate uncaught errors?
  // asyncOnly: "boolean",        // Force done callback or promise?
  // bail: "boolean",             // Bail after first test failure?
  // checkLeaks: "boolean",       // If true, check leaks.
  // delay: "boolean",            // Delay root suite execution?
  // enableTimeouts: "boolean",   // Enable timeouts?
  // fgrep: "string",             // Test filter given string.
  // forbidOnly: "boolean",       // Tests marked only fail the suite?
  // forbidPending: "boolean",    // Pending tests fail the suite?
  // fullStackTrace: "boolean",   // Full stacktrace upon failure?
  // global: "Array:string",      // Variables expected in global scope.
  // grep: "RegExp | string",     // Test filter given regular expression.
  // growl: "boolean",            // Enable desktop notifications?
  // hideDiff: "boolean",         // Suppress diffs from failures?
  // ignoreLeaks: "boolean",      // Ignore global leaks?
  // invert: "boolean",           // Invert test filter matches?
  // noHighlighting: "boolean",   // Disable syntax highlighting?
  // retries: "number",           // Number of times to retry failed tests.
  // slow: "number",              // Slow threshold value.
  // timeout: "number | string",  // Timeout threshold value.
  // ui: "string",                // Interface name.
  // useInlineDiffs: "boolean",   // Use inline diffs?
};
