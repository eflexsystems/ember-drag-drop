import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';

export default class SortExample extends Controller {
  @tracked sortableObjectList = new TrackedArray([
    { id: 1, title: 'Number 1' },
    { id: 2, title: 'Number 2' },
    { id: 3, title: 'Number 3' },
    { id: 4, title: 'Number 4' },
  ]);

  @tracked sortableObjectList2 = new TrackedArray([
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
