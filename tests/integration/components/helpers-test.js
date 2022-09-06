import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { drag } from 'ember-drag-drop/test-support/helpers/drag-drop';
import { find, render } from '@ember/test-helpers';

module('Integration | Helpers', function (hooks) {
  setupRenderingTest(hooks);

  const collection = ['hiphop', 'jazz', 'funk'];
  const template = hbs`
    {{#each this.collection as |genre index|}}

      <DraggableObject class={{genre}} @content={{genre}}>
        <div class="item">{{this.genre}}</div>
      </DraggableObject>

      <DraggableObjectTarget class="drop-target {{genre}}" @action={{this.dropAction}} @destination={{index}} />
    {{/each}}
  `;

  test('drag helper drags to a draggable object target and calls the action upon drop', async function (assert) {
    assert.expect(1);

    this.set('collection', collection);
    this.set('dropAction', (obj) => {
      assert.equal(obj, 'hiphop');
    });

    await render(template);

    await drag('.draggable-object.hiphop', { drop: '.drop-target.jazz' });
  });

  test('drag helper allows a callback to be called before dropping', async function (assert) {
    assert.expect(2);

    this.set('collection', collection);
    this.set('dropAction', (obj) => {
      assert.equal(obj, 'jazz');
    });
    await render(template);

    await drag('.draggable-object.jazz', {
      drop: '.drop-target.funk',
      beforeDrop() {
        assert.ok(find('.is-dragging-object.draggable-object.jazz'));
      },
    });
  });
});
