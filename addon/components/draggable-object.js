import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';
import { action, set } from '@ember/object';
import { wrapper } from 'ember-drag-drop/utils/proxy-unproxy-objects';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class DraggableObject extends Component {
  @service dragCoordinator;

  @tracked isDraggingObject = false;

  get sortingScope() {
    return this.args.sortingScope ?? 'drag-objects';
  }

  get isDraggable() {
    return this.args.isDraggable ?? true;
  }

  get proxyContent() {
    return wrapper(this.args.content);
  }

  dragStartHook(event) {
    if (this.args.dragStartHook) {
      this.args.dragStartHook?.(event);
      return;
    }
    event.target.style.opacity = '0.5';
  }

  dragEndHook(event) {
    if (this.args.dragEndHook) {
      this.args.dragEndHook?.(event);
      return;
    }

    event.target.style.opacity = '1';
  }

  @action
  onDragStart(event) {
    if (!this.isDraggable) {
      event.preventDefault();
      return;
    }

    let dataTransfer = event.dataTransfer;

    let obj = this.proxyContent;
    const id = this.dragCoordinator.setObject(obj, { source: this });

    dataTransfer.setData('Text', id);

    if (obj && typeof obj === 'object') {
      set(obj, 'isDraggingObject', true);
    }
    this.isDraggingObject = true;
    if (
      !this.dragCoordinator.enableSort &&
      this.dragCoordinator.sortComponentController
    ) {
      //disable drag if sorting is disabled this is not used for regular
      event.preventDefault();
      return;
    } else {
      next(() => {
        this.dragStartHook(event);
      });
      this.dragCoordinator.dragStarted(obj, event, this);
    }

    this.args.onDragStart?.(obj, event);

    if (this.args.isSortable) {
      this.args.onDraggingSortItem?.(obj, event);
    }
  }

  @action
  onDragEnd(event) {
    if (!this.isDraggingObject) {
      return;
    }

    let obj = this.proxyContent;

    if (obj && typeof obj === 'object') {
      set(obj, 'isDraggingObject', false);
    }
    this.isDraggingObject = false;
    this.dragEndHook(event);
    this.dragCoordinator.dragEnded();
    this.args.onDragEnd?.(obj, event);
  }

  @action
  onDragOver(event) {
    if (this.args.isSortable) {
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
