import ObjHash from 'ember-drag-drop/utils/obj-hash';
import { unwrapper } from 'ember-drag-drop/utils/proxy-unproxy-objects';
import Service from '@ember/service';

export default class Coordinator extends Service {
  objectMap = new ObjHash();

  getObject(id) {
    const payload = this.objectMap.getObj(id);

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
