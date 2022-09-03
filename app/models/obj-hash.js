import { tracked } from '@glimmer/tracking';

export default class ObjHash {
  @tracked contentLength = 0;
  @tracked content = [];

  get length() {
    return this.contentLength;
  }

  add(obj) {
    const id = this.generateId();
    this.content[id] = obj;
    this.contentLength += 1;
    return id;
  }

  getObj(key) {
    const res = this.content[key];
    if (!res) {
      throw new Error('no obj for key ' + key);
    }
    return res;
  }

  generateId() {
    let num = Math.random() * 1000000000000.0;
    num = parseInt(num);
    num = '' + num;
    return num;
  }

  keys() {
    const res = [];
    for (const key in this.content) {
      res.push(key);
    }
    return res;
  }
}
