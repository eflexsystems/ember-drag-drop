import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

export default class ObjHash {
  @tracked content = {};

  add(obj) {
    const id = guidFor(obj);
    this.content[id] = obj;
    return id;
  }

  getObj(key) {
    return this.content[key];
  }
}
