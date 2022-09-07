import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class SimpleExample extends Controller {
  @tracked sortableObjectList = A([
    { id: 1, title: 'Number 1' },
    { id: 2, title: 'Number 2' },
    { id: 3, title: 'Number 3' },
    { id: 4, title: 'Number 4' },
  ]);

  @tracked sortableObjectList2 = A([
    { id: 1, title: 'Number 5' },
    { id: 2, title: 'Number 6' },
    { id: 3, title: 'Number 7' },
    { id: 4, title: 'Number 8' },
  ]);

  @action
  onSortEnd() {
    console.log('Sort Ended', this.sortableObjectList);
  }

  @action
  onSortEnd2() {
    console.log('Sort Ended on second list', this.sortableObjectList2);
  }
}
