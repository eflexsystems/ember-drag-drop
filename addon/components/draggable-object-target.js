import { getOwner } from '@ember/application';
import Component from '@ember/component';

export default Component.extend({
  classNameBindings: [
    'accepts-drag',
    'self-drop',
    'overrideClass',
  ],

  overrideClass: 'draggable-object-target',
  isOver: false,
  _currentDrag: null,

  /**
   * Read-only className property that is set to true when the component is
   * receiving a valid drag event. You can style your element with
   * `.accepts-drag`.
   *
   * @property accepts-drag
   * @private
   */

  'accepts-drag': false,

  /**
   * Will be true when the component is dragged over itself. Can use
   * `.self-drop` in your css to style (or more common, unstyle) the component.
   *
   * @property self-drop
   * @private
   */

  'self-drop': false,

 /**
   * Validates drag events. Override this to restrict which data types your
   * component accepts.
   *
   * Example:
   *
   * ```js
   * validateDragEvent(event) {
   *   return event.dataTransfer.types.contains('text/x-foo');
   * }
   * ```
   *
   * @method validateDragEvent
   * @public
   */

  validateDragEvent() {
    return true;
  },

  /**
   * Called when a valid drag event is dropped on the component. Override to
   * actually make something happen.
   *
   * ```js
   * acceptDrop: function(event) {
   *   var data = event.dataTransfer.getData('text/plain');
   *   doSomethingWith(data);
   * }
   * ```
   *
   * @method acceptDrop
   * @public
   */

  acceptDrop() {},

  handleDragOver() {},
  handleDragOut() {},

  /**
   * @method dragOver
   * @private
   */

  dragOver(event) {
    if (this._droppableIsDraggable(event)) {
      this.set('self-drop', true);
    }
    if (this.get('accepts-drag')) {
      return this._allowDrop(event);
    }
    if (this.validateDragEvent(event)) {
      this.set('accepts-drag', true);
      this._allowDrop(event);
    } else {
      this._resetDroppability();
    }
  },

  /**
   * @method dragEnter
   * @private
   */

  dragEnter() {
    return false;
  },

  /**
   * @method drop
   * @private
   */

  drop(event) {
    // have to validate on drop because you may have nested sortables the
    // parent allows the drop but the child receives it, revalidating allows
    // the event to bubble up to the parent to handle it
    if (!this.validateDragEvent(event)) {
      return;
    }
    this.acceptDrop(event);
    this._resetDroppability();
    // TODO: might not need this? I can't remember why its here
    event.stopPropagation();
    return false;
  },

  /**
   * Tells the browser we have an acceptable drag event.
   *
   * @method _allowDrop
   * @private
   */

  _allowDrop(event) {
    this.handleDragOver(event);
    event.stopPropagation();
    event.preventDefault();
    return false;
  },

  /**
   * We want to be able to know if the current drop target is the original
   * element being dragged or a child of it.
   *
   * @method _droppableIsDraggable
   * @private
   */

  _droppableIsDraggable(event) {
    return this._currentDrag && (
      this._currentDrag === event.target ||
      this._currentDrag.contains(event.target)
    );
  },

  /**
   * @method _resetDroppability
   * @private
   */

  _resetDroppability(event) {
    this.handleDragOut(event);
    this.set('accepts-drag', false);
    this.set('self-drop', false);
  },

  dragLeave() {
   this._resetDroppability();
  },

  // Need to track this so we can determine `self-drop`.
  // It's on `Droppable` so we can test :\
  dragStart(event) {
    this.set('_currentDrag', event.target);
  },

  // idea taken from https://github.com/emberjs/rfcs/blob/master/text/0680-implicit-injection-deprecation.md#stage-1
  get coordinator() {
    if (this._coordinator === undefined) {
      this._coordinator = getOwner(this).lookup('drag:coordinator');
    }

    return this._coordinator;
  },
  set coordinator(value) {
    this._coordinator = value;
  },

  handlePayload(payload, event) {
    let obj = this.get('coordinator').getObject(payload,{target: this});
    this.get('action')(obj, { target: this, event: event });
  },

  handleDrop(event) {
    let dataTransfer = event.dataTransfer;
    let payload = dataTransfer.getData("Text");
    if (payload === '') { return; }
    this.handlePayload(payload, event);
  },

  acceptDrop(event) {
    this.handleDrop(event);
    //Firefox is navigating to a url on drop sometimes, this prevents that from happening
    event.preventDefault();
  },

  handleDragOver(event) {
    if (!this.get('isOver')) {
      //only send once per hover event
      this.set('isOver', true);
      if(this.get('dragOverAction')) {
        this.get('dragOverAction')(event);
      }
    }
  },

  handleDragOut(event) {
    this.set('isOver', false);
    if(this.get('dragOutAction')) {
      this.get('dragOutAction')(event);
    }
  },

  click(e) {
    let onClick = this.get('onClick');
    if (onClick) {
      onClick(e);
    }
  },

  mouseDown(e) {
    let mouseDown = this.get('onMouseDown');
    if (mouseDown) {
      mouseDown(e);
    }
  },

  handleMouseEnter(e) {
    let mouseEnter = this.get('onMouseEnter');
    if (mouseEnter) {
      mouseEnter(e);
    }
  },

  didInsertElement() {
      this._super(...arguments);
      this.element.addEventListener('mouseenter', this.boundHandleMouseEnter);
  },

  willDestroyElement() {
      this._super(...arguments);
      this.element.removeEventListener('mouseenter', this.boundHandleMouseEnter);
  },

  actions: {
    acceptForDrop() {
      let hashId = this.get('coordinator.clickedId');
      this.handlePayload(hashId);
    }
  },

  init() {
    this._super(...arguments);

    this.set('boundHandleMouseEnter', this.handleMouseEnter.bind(this));
  }
});
