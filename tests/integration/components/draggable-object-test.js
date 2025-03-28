import { triggerEvent, find, render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import MockEvent from '@eflexsystems/ember-drag-drop/test-support/helpers/mock-event';

module('Integration | Component | draggable object', function (hooks) {
  setupRenderingTest(hooks);

  test('draggable object renders', async function (assert) {
    await render(hbs`<DraggableObject />`);

    assert.strictEqual(this.element.innerText.trim(), '');

    await render(hbs`
      <DraggableObject>
        template block text
      </DraggableObject>
    `);

    assert.strictEqual(this.element.innerText.trim(), 'template block text');
  });

  test('Draggable Object is draggable', async function (assert) {
    let event = new MockEvent();

    this.set('onDrag', (event) => assert.ok(event));

    await render(hbs`
      <DraggableObject
        @content={{this.myObject}}
        class='draggable-object'
        {{on 'drag' this.onDrag}}
      >
        Hi
        <span class="js-dragHandle dragHandle"></span>
        </DraggableObject>
    `);

    let componentSelector = '.draggable-object';

    await triggerEvent(componentSelector, 'dragstart', event);

    assert.true(
      find(componentSelector).classList.contains('is-dragging-object'),
    );

    await triggerEvent(componentSelector, 'drag', event);

    await triggerEvent(componentSelector, 'dragend', event);

    assert.false(
      find(componentSelector).classList.contains('is-dragging-object'),
    );
  });
});
