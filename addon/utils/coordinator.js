import ObjHash from 'ember-drag-drop/utils/obj-hash';
import { unwrapper } from 'ember-drag-drop/utils/proxy-unproxy-objects';

export default class Coordinator {
  objectMap = new ObjHash();

  static create(props) {
    return new Coordinator(props);
  }

  getObject(id) {
    var payload = this.objectMap.getObj(id);

    if (
      payload.ops.source &&
      !payload.ops.source.isDestroying &&
      !payload.ops.source.isDestroyed
    ) {
      payload.ops.source.action?.(payload.obj);
    }

    if (
      payload.ops.target &&
      !payload.ops.target.isDestroying &&
      !payload.ops.target.isDestroyed
    ) {
      payload.ops.target.action?.(payload.obj);
    }

    return unwrapper(payload.obj);
  }

  setObject(obj, ops = {}) {
    return this.objectMap.add({ obj: obj, ops: ops });
  }
}
