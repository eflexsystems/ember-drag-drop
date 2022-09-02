import EmberObject from '@ember/object';
import Evented from '@ember/object/evented';
import ObjHash from './obj-hash';
import { unwrapper } from 'ember-drag-drop/utils/proxy-unproxy-objects';
import classic from 'ember-classic-decorator';

@classic
export default class Coordinator extends EmberObject.extend(Evented) {
  objectMap = ObjHash.create();

  getObject(id, ops) {
    ops = ops || {};
    var payload = this.objectMap.getObj(id);

    if (
      payload.ops.source &&
      !payload.ops.source.isDestroying &&
      !payload.ops.source.isDestroyed
    ) {
      const action = payload.ops.source['action'];
      // Support when action is a function
      if (typeof action === 'function') {
        action(payload.obj);
      }

      // Support when action is a string
      if (
        typeof action === 'string' &&
        typeof payload.ops.source.target[action] === 'function'
      ) {
        payload.ops.source.target[action](payload.obj);
      }
    }

    if (
      payload.ops.target &&
      !payload.ops.target.isDestroying &&
      !payload.ops.target.isDestroyed
    ) {
      const action = payload.ops.target['action'];
      // Support when action is a function
      if (typeof action === 'function') {
        action(payload.obj);
      }

      // Support when action is a string
      if (
        typeof action === 'string' &&
        typeof payload.ops.target.source[action] === 'function'
      ) {
        payload.ops.target.source[action](payload.obj);
      }
    }

    this.trigger('objectMoved', {
      obj: unwrapper(payload.obj),
      source: payload.ops.source,
      target: ops.target,
    });

    return unwrapper(payload.obj);
  }

  setObject(obj, ops) {
    ops = ops || {};
    return this.objectMap.add({ obj: obj, ops: ops });
  }
}
