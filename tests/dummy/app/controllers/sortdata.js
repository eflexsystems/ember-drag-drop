import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SortExample extends Controller {
  @tracked book;

  @action
  dragStart(object) {
    console.log('Drag Start', object);
  }

  @action
  onSortEnd() {
    console.log('Sort Ended', this.book.pages);
  }
}
