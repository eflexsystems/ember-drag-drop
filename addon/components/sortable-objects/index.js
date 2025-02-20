import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { TrackedArray } from 'tracked-built-ins';

export default class SortableObjects extends Component {
  @service dragCoordinator;

  @tracked sortableObjectList =
    this.args.sortableObjectList ?? new TrackedArray();

  get sortingScope() {
    return this.args.sortingScope ?? 'drag-objects';
  }

  get useSwap() {
    return this.args.useSwap ?? true;
  }

  get enableSort() {
    return this.args.enableSort ?? true;
  }

  constructor() {
    super(...arguments);
    if (this.enableSort) {
      this.dragCoordinator.pushSortComponent(this);
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.dragCoordinator.removeSortComponent(this);
    if (this.dragCoordinator.sortComponent === this) {
      this.dragCoordinator.sortComponent = null;
    }
  }

  @action
  onDragStart(event) {
    event.stopPropagation();
    if (!this.enableSort) {
      event.preventDefault();
      return false;
    }
    this.dragCoordinator.sortComponent = this;
  }

  @action
  onDragEnter(event) {
    //needed so drop event will fire
    event.stopPropagation();
    event.preventDefault();
    return false;
  }

  @action
  onDragOver(event) {
    //needed so drop event will fire
    event.stopPropagation();
    event.preventDefault();
    return false;
  }

  @action
  onDrop(event) {
    event.stopPropagation();
    event.preventDefault();
    this.dragCoordinator.sortComponent = null;
    if (this.enableSort) {
      this.args.onSortEnd?.(this.sortableObjectList, event);
    }
  }
}
