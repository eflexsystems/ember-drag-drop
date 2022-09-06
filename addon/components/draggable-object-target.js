import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class DraggableObjectTarget extends Component {
  #currentDrag = null;

  @service dragCoordinator;

  /**
   * Read-only className property that is set to true when the component is
   * receiving a valid drag event. You can style your element with
   * `.accepts-drag`.
   *
   * @property acceptsDrag
   * @private
   */

  @tracked acceptsDrag = false;

  /**
   * Will be true when the component is dragged over itself. Can use
   * `.self-drop` in your css to style (or more common, unstyle) the component.
   *
   * @property selfDrop
   * @private
   */

  @tracked selfDrop = false;

  @tracked isOver = false;

  /**
   * Tells the browser we have an acceptable drag event.
   *
   * @method _allowDrop
   * @private
   */

  _allowDrop(event) {
    if (!this.isOver) {
      //only send once per hover event
      this.isOver = true;
      this.args.onDragOver?.(event);
    }

    event.stopPropagation();
    event.preventDefault();
    return false;
  }

  /**
   * We want to be able to know if the current drop target is the original
   * element being dragged or a child of it.
   *
   * @method _droppableIsDraggable
   * @private
   */

  _droppableIsDraggable(event) {
    return (
      this.#currentDrag &&
      (this.#currentDrag === event.target ||
        this.#currentDrag.includes(event.target))
    );
  }

  /**
   * @method _resetDroppability
   * @private
   */

  _resetDroppability(event) {
    this.isOver = false;
    this.args.onDragOut?.(event);
    this.acceptsDrag = false;
    this.selfDrop = false;
  }

  /**
   * Called when a valid drag event is dropped on the component. Override to
   * actually make something happen.
   *
   * ```js
   * acceptDrop: function(event) {
   *   const data = event.dataTransfer.getData('text/plain');
   *   doSomethingWith(data);
   * }
   * ```
   *
   * @method acceptDrop
   * @public
   */
  acceptDrop(event) {
    let dataTransfer = event.dataTransfer;
    let payload = dataTransfer.getData('Text');
    if (payload === '') {
      return;
    }

    const obj = this.dragCoordinator.getObject(payload);
    this.args.action(obj, { target: this, event });

    //Firefox is navigating to a url on drop sometimes, this prevents that from happening
    event.preventDefault();
  }

  @action
  onDragLeave() {
    this._resetDroppability();
  }

  // Need to track this so we can determine selfDrop.
  // It's on `Droppable` so we can test :\
  @action
  onDragStart(event) {
    this.#currentDrag = event.target;
  }

  @action
  onDragOver(event) {
    if (this._droppableIsDraggable(event)) {
      this.selfDrop = true;
    }
    if (this.acceptsDrag) {
      return this._allowDrop(event);
    }
    if (!this.args.validateDragEvent || this.args.validateDragEvent(event)) {
      this.acceptsDrag = true;
      this._allowDrop(event);
    } else {
      this._resetDroppability();
    }
  }

  @action
  onDrop(event) {
    // have to validate on drop because you may have nested sortables the
    // parent allows the drop but the child receives it, revalidating allows
    // the event to bubble up to the parent to handle it
    if (this.args.validateDragEvent && !this.validateDragEvent(event)) {
      return;
    }
    this.acceptDrop(event);
    this._resetDroppability();
    // TODO: might not need this? I can't remember why its here
    event.stopPropagation();
    return false;
  }

  @action
  onDragEnter() {
    return false;
  }
}
