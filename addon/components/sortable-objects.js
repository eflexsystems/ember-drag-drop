import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class SortableObjects extends Component {
  @service dragCoordinator;

  get sortableObjectList() {
    return this.args.sortableObjectList ?? [];
  }

  get sortingScope() {
    return this.args.sortingScope ?? 'drag-objects';
  }

  get inPlace() {
    return this.args.inPlace ?? true;
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
    if (this.enableSort) {
      this.dragCoordinator.removeSortComponent(this);
    }
  }

  @action
  onDragStart(event) {
    event.stopPropagation();
    if (!this.enableSort) {
      return false;
    }
    this.dragCoordinator.set('sortComponentController', this);
  }

  @action
  onDragEnter(event) {
    //needed so drop event will fire
    event.stopPropagation();
    return false;
  }

  @action
  onDragOver(event) {
    //needed so drop event will fire
    event.stopPropagation();
    return false;
  }

  @action
  onDrop(event) {
    event.stopPropagation();
    event.preventDefault();
    this.dragCoordinator.set('sortComponentController', undefined);
    if (this.enableSort) {
      this.args.onSortEnd?.(event);
    }
  }
}
