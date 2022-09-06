import Service from '@ember/service';
import { A } from '@ember/array';
import { isEqual } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

function indexOf(items, a) {
  return items.findIndex(function (element) {
    return isEqual(element, a);
  });
}

function swapInPlace(items, a, b) {
  const aPos = indexOf(items, a);
  const bPos = indexOf(items, b);

  items.replace(aPos, 1, [b]);
  items.replace(bPos, 1, [a]);
}

function shiftInPlace(items, a, b) {
  const aPos = indexOf(items, a);
  const bPos = indexOf(items, b);

  items.removeAt(aPos);
  items.insertAt(bPos, a);
}

export default class DragCoordinator extends Service {
  #objectMap = {};

  @tracked sortComponentController = null;
  @tracked currentDragObject = null;
  @tracked currentDragEvent = null;
  @tracked currentDragItem = null;
  @tracked currentOffsetItem = null;
  @tracked isMoving = false;
  @tracked lastEvent = null;
  @tracked sortComponents = [];

  get enableSort() {
    return this.sortComponentController?.enableSort;
  }

  get useSwap() {
    return this.sortComponentController?.useSwap;
  }

  get inPlace() {
    return this.sortComponentController?.inPlace;
  }

  pushSortComponent(component) {
    const sortingScope = component.sortingScope;
    this.sortComponents[sortingScope] ??= A();
    this.sortComponents[sortingScope].pushObject(component);
  }

  removeSortComponent(component) {
    const sortingScope = component.sortingScope;
    this.sortComponents[sortingScope].removeObject(component);
  }

  dragStarted(object, event, emberObject) {
    this.currentDragObject = object;
    this.currentDragEvent = event;
    this.currentDragItem = emberObject;
    event.dataTransfer.effectAllowed = 'move';
  }

  dragEnded() {
    this.currentDragObject = null;
    this.currentDragEvent = null;
    this.currentDragItem = null;
    this.currentOffsetItem = null;
  }

  draggingOver(event, emberObject, element) {
    const currentOffsetItem = this.currentOffsetItem;
    const pos = this.relativeClientPosition(element, event);
    const hasSameSortingScope =
      this.currentDragItem.sortingScope === emberObject.sortingScope;
    let moveDirections = [];

    if (!this.lastEvent) {
      this.lastEvent = event;
    }

    if (event.clientY < this.lastEvent.clientY) {
      moveDirections.push('up');
    }

    if (event.clientY > this.lastEvent.clientY) {
      moveDirections.push('down');
    }

    if (event.clientX < this.lastEvent.clientX) {
      moveDirections.push('left');
    }

    if (event.clientX > this.lastEvent.clientX) {
      moveDirections.push('right');
    }

    this.lastEvent = event;

    if (!this.isMoving && this.currentDragEvent) {
      if (
        event.target !== this.currentDragEvent.target &&
        hasSameSortingScope
      ) {
        //if not dragging over self
        if (currentOffsetItem !== emberObject) {
          if (
            (pos.py < 0.67 && moveDirections.indexOf('up') >= 0) ||
            (pos.py > 0.33 && moveDirections.indexOf('down') >= 0) ||
            (pos.px < 0.67 && moveDirections.indexOf('left') >= 0) ||
            (pos.px > 0.33 && moveDirections.indexOf('right') >= 0)
          ) {
            this.moveElements(emberObject);
            this.currentOffsetItem = emberObject;
          }
        }
      } else {
        //reset because the node moved under the mouse with a move
        this.currentOffsetItem = null;
      }
    }
  }

  moveObjectPositions(a, b, sortComponents) {
    const aSortable = sortComponents.find((component) => {
      return component.sortableObjectList.find((sortable) => {
        return isEqual(sortable, a);
      });
    });
    const bSortable = sortComponents.find((component) => {
      return component.sortableObjectList.find((sortable) => {
        return isEqual(sortable, b);
      });
    });
    const swap = aSortable === bSortable;

    if (swap) {
      let list = aSortable.sortableObjectList;
      if (!this.inPlace) {
        list = A(list.toArray());
      }

      if (this.useSwap) {
        swapInPlace(list, a, b);
      } else {
        shiftInPlace(list, a, b);
      }

      if (!this.inPlace) {
        aSortable.sortableObjectList = list;
      }
    } else {
      // Move if items are in different sortable-objects component
      const aList = aSortable.sortableObjectList;
      const bList = bSortable.sortableObjectList;

      // Remove from aList and insert into bList
      aList.removeObject(a);
      bList.insertAt(indexOf(bList, b), a);
    }
  }

  moveElements(overElement) {
    const isEnabled = Object.keys(this.sortComponents).length;
    const draggingItem = this.currentDragItem;
    const sortComponents = this.sortComponents[draggingItem.sortingScope];

    if (!isEnabled) {
      return;
    }

    this.moveObjectPositions(
      draggingItem.args.content,
      overElement.args.content,
      sortComponents
    );
  }

  relativeClientPosition(el, event) {
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    return {
      x: x,
      y: y,
      px: x / rect.width,
      py: y / rect.height,
    };
  }

  getObject(id) {
    const payload = this.#objectMap[id];

    if (
      payload.ops.source &&
      !payload.ops.source.isDestroying &&
      !payload.ops.source.isDestroyed
    ) {
      payload.ops.source.action?.(payload.obj);
    }

    return payload.obj;
  }

  setObject(obj, ops = {}) {
    const item = { obj, ops };
    const id = guidFor(item);
    this.#objectMap[id] = item;
    return id;
  }
}
