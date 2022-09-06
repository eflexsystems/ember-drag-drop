import EmberObject from '@ember/object';
import { Promise } from 'rsvp';

const isNumber = function (obj) {
  const a = obj - 1;
  const b = obj + 1;
  return b - a === 2;
};

const FakeStore = EmberObject.extend({
  findSingle: function (name, id) {
    return new Promise((success) => {
      let res = null;
      this.all.forEach(function (obj) {
        if (obj.id === id) {
          res = obj;
        }
      });

      success(res);
    });
  },

  find: function (name, ops = {}) {
    if (isNumber(ops)) {
      return this.findSingle(name, ops);
    } else {
      return this.findMultiple(name, ops);
    }
  },
});

FakeStore.reopenClass({
  makeNumberStore: function (max) {
    const all = [];
    for (let i = 1; i <= max; i++) {
      all.push(Object.create({ id: i }));
    }
    return this.create({ all: all });
  },
});

export default FakeStore;
