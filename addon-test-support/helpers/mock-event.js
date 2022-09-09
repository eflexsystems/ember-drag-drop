class DataTransfer {
  data = {};

  setData(type, value) {
    this.data[type] = value;
    return this;
  }

  getData(type = 'Text') {
    return this.data[type];
  }

  setDragImage() {}
}

export default class MockEvent {
  dataTransfer = new DataTransfer();

  constructor(options = {}) {
    this.dataTransfer.setData('Text', options.dataTransferData);
    Object.assign(this, options);
  }

  useDataTransferData(otherEvent) {
    this.dataTransfer.setData('Text', otherEvent.dataTransfer.getData());
    return this;
  }

  preventDefault() {}

  stopPropagation() {}
}

export function createDomEvent(type) {
  let event = document.createEvent('CustomEvent');
  event.initCustomEvent(type, true, true, null);
  event.dataTransfer = new DataTransfer();
  return event;
}
