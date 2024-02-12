import Service from '@ember/service';
import { isEqual } from '@ember/utils';

const removeObject = (array, obj) => {
  if (!array) {
    return;
  }

  const index = array.indexOf(obj);

  if (index === -1) {
    return;
  }

  array.splice(index, 1);
};

const swapInPlace = (items, a, b) => {
  const aPos = items.indexOf(a);
  const bPos = items.indexOf(b);

  items.splice(aPos, 1, b);
  items.splice(bPos, 1, a);
};

const shiftInPlace = (items, a, b) => {
  const bPos = items.indexOf(b);

  removeObject(items, a);
  items.splice(bPos, 0, a);
};

const relativeClientPosition = (el, event) => {
  const rect = el.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  return {
    x: x,
    y: y,
    px: x / rect.width,
    py: y / rect.height,
  };
};

export default class DragCoordinator extends Service {
  sortComponent;
  currentDragObject;

  #currentOffsetItem;
  #currentDragItem;
  #currentDragEvent;
  #lastEvent;
  #sortComponents = {};

  get enableSort() {
    return this.sortComponent?.enableSort ?? false;
  }

  get useSwap() {
    return this.sortComponent?.useSwap;
  }

  pushSortComponent(component) {
    const sortingScope = component.sortingScope;
    this.#sortComponents[sortingScope] ??= [];
    this.#sortComponents[sortingScope].push(component);
  }

  removeSortComponent(component) {
    const sortingScope = component.sortingScope;
    removeObject(this.#sortComponents[sortingScope], component);
  }

  dragStarted(object, event, emberObject) {
    this.currentDragObject = object;
    this.#currentDragEvent = event;
    this.#currentDragItem = emberObject;
    event.dataTransfer.effectAllowed = 'move';
  }

  dragEnded() {
    this.currentDragObject = null;
    this.#currentDragEvent = null;
    this.#currentDragItem = null;
    this.#currentOffsetItem = null;
  }

  draggingOver(event, emberObject, element) {
    const currentOffsetItem = this.#currentOffsetItem;
    const pos = relativeClientPosition(element, event);
    const hasSameSortingScope =
      this.#currentDragItem.sortingScope === emberObject.sortingScope;
    let moveDirections = [];

    this.#lastEvent ??= event;

    if (event.clientY < this.#lastEvent.clientY) {
      moveDirections.push('up');
    }

    if (event.clientY > this.#lastEvent.clientY) {
      moveDirections.push('down');
    }

    if (event.clientX < this.#lastEvent.clientX) {
      moveDirections.push('left');
    }

    if (event.clientX > this.#lastEvent.clientX) {
      moveDirections.push('right');
    }

    this.#lastEvent = event;

    if (this.#currentDragEvent) {
      if (
        event.target !== this.#currentDragEvent.target &&
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
            this.#currentOffsetItem = emberObject;
          }
        }
      } else {
        //reset because the node moved under the mouse with a move
        this.#currentOffsetItem = null;
      }
    }
  }

  moveElements(overElement) {
    const isEnabled = Object.keys(this.#sortComponents).length;
    const draggingItem = this.#currentDragItem;
    const sortComponents = this.#sortComponents[draggingItem.sortingScope];

    if (!isEnabled) {
      return;
    }

    let a = draggingItem.args.content;
    let b = overElement.args.content;

    const aSortable = sortComponents.find((component) =>
      component.sortableObjectList.find((sortable) => isEqual(sortable, a)),
    );
    const bSortable = sortComponents.find((component) =>
      component.sortableObjectList.find((sortable) => isEqual(sortable, b)),
    );
    const swap = aSortable === bSortable;

    if (swap) {
      const list = [...aSortable.sortableObjectList];

      if (this.useSwap) {
        swapInPlace(list, a, b);
      } else {
        shiftInPlace(list, a, b);
      }

      aSortable.sortableObjectList = list;
    } else {
      // Move if items are in different sortable-objects component
      const aList = aSortable.sortableObjectList;
      const bList = bSortable.sortableObjectList;

      // Remove from aList and insert into bList
      removeObject(aList, a);
      bList.splice(bList.indexOf(b), 0, a);
    }
  }
}
