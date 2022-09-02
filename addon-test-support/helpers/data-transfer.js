export default class DataTransfer {
  payload;
  data;

  constructor(props) {
    Object.assign(this, props);
  }

  getData() {
    return this.payload;
  }

  setData(dataType, payload) {
    this.data = { dataType: dataType, payload: payload };
  }

  static makeMockEvent(payload) {
    var transfer = new DataTransfer({ payload: payload });
    var res = { dataTransfer: transfer };
    res.preventDefault = function () {
      console.log('prevent default');
    };
    res.stopPropagation = function () {
      console.log('stop propagation');
    };
    return res;
  }

  static createDomEvent(type) {
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, true, true, null);
    event.dataTransfer = {
      data: {},
      setData(type, val) {
        this.data[type] = val;
      },
      getData(type) {
        return this.data[type];
      },
    };
    return event;
  }
}
