class DriverProvider {
  constructor() {
    this.runType = null;
    this.drivers = {
      func: 'mocha',
      load: 'artillery',
    };
  }

  resolve() {
    return require(`./drivers/${this.runType}/${this.drivers[this.runType]}`);
  }

  setRunType(type) {
    this.runType = type;
  }

  setDrivers(drivers = { func: 'mocha', load: 'artillery' }) {
    this.drivers = drivers;
  }
}

module.exports = new DriverProvider();
