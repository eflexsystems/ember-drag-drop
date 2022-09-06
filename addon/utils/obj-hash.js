import { tracked } from '@glimmer/tracking';

export default class ObjHash {
  @tracked content = [];

  add(obj) {
    let id = Math.random() * 1000000000000.0;
    id = parseInt(id);
    id = '' + id;

    this.content[id] = obj;
    return id;
  }

  getObj(key) {
    return this.content[key];
  }
}
