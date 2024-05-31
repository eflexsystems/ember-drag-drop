import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

export default class DraggableObject extends Component {
  @service dragCoordinator;

  @tracked isDraggingObject = false;

  get sortingScope() {
    return this.args.sortingScope ?? 'drag-objects';
  }

  get isDraggable() {
    return this.args.isDraggable ?? true;
  }

  @action
  onDragStart(event) {
    if (!this.isDraggable) {
      event.preventDefault();
      return;
    }

    let dataTransfer = event.dataTransfer;

    const obj = this.args.content;

    dataTransfer.setData('Text', guidFor(obj));

    this.isDraggingObject = true;
    this.dragCoordinator.dragStarted(obj, event, this);

    if (
      !this.dragCoordinator.enableSort &&
      this.dragCoordinator.sortComponent
    ) {
      //disable drag if sorting is disabled
      event.preventDefault();
      return;
    }

    this.args.onDragStart?.(obj, event);

    if (this.dragCoordinator.enableSort) {
      this.args.onDraggingSortItem?.(obj, event);
    }
  }

  @action
  onDragEnd(event) {
    if (!this.isDraggingObject) {
      return;
    }

    const obj = this.args.content;

    this.isDraggingObject = false;
    this.args.onDragEnd?.(obj, event);
  }

  @action
  onDragOver(event) {
    if (this.dragCoordinator.enableSort) {
      this.dragCoordinator.draggingOver(event, this, event.target);
    }
    return false;
  }

  @action
  onDrop(event) {
    //Firefox is navigating to a url on drop, this prevents that from happening
    event.preventDefault();
  }
}
