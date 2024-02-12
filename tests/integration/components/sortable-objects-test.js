import { findAll, find, render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import { drag } from '@eflexsystems/ember-drag-drop/test-support/helpers/drag-drop';
import { TrackedArray } from 'tracked-built-ins';
import { w } from '@ember/string';

let pojoData = new TrackedArray([
  { id: 1, title: 'Number 1' },
  { id: 2, title: 'Number 2' },
  { id: 3, title: 'Number 3' },
  { id: 4, title: 'Number 4' },
]);

module('Integration | Component | sortable objects', function (hooks) {
  setupRenderingTest(hooks);

  let visibleNumbers = function (selector = '.sortObject') {
    return findAll(selector).map((el) => el.textContent.match(/\d/g)[0]);
  };

  let appearsDragging = function (assert, selector, yes = true) {
    const condition = yes ? '' : 'not';
    const startMessage = `when item is ${condition} dragging`;
    const element = find(selector);

    assert.strictEqual(
      element.classList.contains('is-dragging-object'),
      yes,
      `${startMessage} has class 'is-dragging-object' => ${yes}`,
    );
  };

  test('sortable object renders draggable objects', async function (assert) {
    this.set('pojoData', new TrackedArray(pojoData.slice()));

    this.set('onSortEnd', (pojoObj) => {
      //make sure object items are in the right order
      assert.deepEqual(
        pojoObj.map((obj) => obj.id),
        [2, 1, 3, 4],
        'after sorting Pojo item list changed',
      );
    });

    await render(hbs`
      <SortableObjects
        @sortableObjectList={{this.pojoData}}
        @onSortEnd={{this.onSortEnd}}
        class='sortContainer'
        @sortingScope='sortable-objects'
      as |item|>
        <DraggableObject
          class="sortObject"
          @content={{item}}
          @sortingScope='sortable-objects'
        >
          {{item.title}}
        </DraggableObject>
      </SortableObjects>
    `);

    assert.strictEqual(
      findAll('.sortObject').length,
      4,
      'shows 4 sortable elements',
    );

    let startDragSelector = '.sortObject:nth-child(1)',
      dragOverSelector = '.sortObject:nth-child(2)';

    const rect = find(dragOverSelector).getBoundingClientRect();

    await drag(startDragSelector, {
      drop: dragOverSelector,
      dragOverMoves: [
        [{ clientX: 1, clientY: rect.top }],
        [{ clientX: 1, clientY: rect.top + rect.height / 2 }],
      ],
      afterDrag() {
        appearsDragging(assert, startDragSelector, true);
      },
      beforeDrop() {
        assert.deepEqual(
          visibleNumbers(),
          w('2 1 3 4'),
          'After dragging over and before drop items are already shown in correct order',
        );
      },
    });

    appearsDragging(assert, startDragSelector, false);

    assert.deepEqual(
      visibleNumbers(),
      w('2 1 3 4'),
      'Items are still visually in the correct order after drag end',
    );
  });

  test('sortable object renders draggable objects using shift algorithm', async function (assert) {
    this.set('pojoData', new TrackedArray(pojoData.slice()));

    this.set('onSortEnd', (pojoObj) => {
      //make sure object items are in the right order
      assert.deepEqual(
        pojoObj.map((obj) => obj.id),
        [2, 3, 1, 4],
        'after sorting Pojo item list changed',
      );
    });

    await render(hbs`
      <SortableObjects
        @sortableObjectList={{this.pojoData}}
        @onSortEnd={{this.onSortEnd}}
        class='sortContainer'
        @useSwap={{false}}
      as |item|>
        <DraggableObject
          class="sortObject"
          @content={{item}}
        >
          {{item.title}}
        </DraggableObject>
      </SortableObjects>
    `);

    assert.strictEqual(findAll('.sortObject').length, 4);

    let startDragSelector = '.sortObject:nth-child(1)',
      dragOver2Selector = '.sortObject:nth-child(2)',
      dragOver3Selector = '.sortObject:nth-child(3)';

    const rect2 = find(dragOver2Selector).getBoundingClientRect();
    const rect3 = find(dragOver3Selector).getBoundingClientRect();

    await drag(startDragSelector, {
      drop: dragOver3Selector,
      dragOverMoves: [
        [{ clientX: 1, clientY: rect2.top }, dragOver2Selector],
        [
          { clientX: 1, clientY: rect3.top + rect3.height / 2 },
          dragOver3Selector,
        ],
      ],
      beforeDrop() {
        assert.deepEqual(
          visibleNumbers(),
          w('2 3 1 4'),
          'After dragging over and before drop items are already shown in correct order',
        );
      },
    });

    assert.deepEqual(
      visibleNumbers(),
      w('2 3 1 4'),
      'items are still shifted after drop',
    );
  });

  test('sorting does not happen if off', async function (assert) {
    this.set('pojoData', new TrackedArray(pojoData.slice()));

    // onSortEnd should not be called
    let onSortEndCalled = false;
    this.set('onSortEnd', function () {
      onSortEndCalled = true;
    });

    await render(hbs`
      <SortableObjects
        @sortableObjectList={{this.pojoData}}
        @onSortEnd={{this.onSortEnd}}
        class='sortContainer'
        @enableSort={{false}}
      as |item|>
        <DraggableObject
          class='sortObject'
          @content={{item}}
        >
          {{item.title}}
        </DraggableObject>
      </SortableObjects>
    `);

    assert.strictEqual(findAll('.sortObject').length, 4);

    let startDragSelector = '.sortObject:nth-child(1)',
      dragOver2Selector = '.sortObject:nth-child(2)';

    const rect = find(dragOver2Selector).getBoundingClientRect();

    await drag(startDragSelector, {
      drop: dragOver2Selector,
      dragOverMoves: [
        [{ clientX: 1, clientY: rect.top }],
        [{ clientX: 1, clientY: rect.top + rect.height / 2 }],
      ],
      afterDrag() {
        appearsDragging(assert, startDragSelector, true);
      },
      beforeDrop() {
        assert.deepEqual(
          visibleNumbers(),
          w('1 2 3 4'),
          'Drag over does not affect order',
        );
      },
    });

    //Visual drag items are reset
    appearsDragging(assert, startDragSelector, false);

    //Items are still visually in the start order after drag end
    assert.deepEqual(
      visibleNumbers(),
      w('1 2 3 4'),
      'Items did not change order after drop',
    );

    assert.false(onSortEndCalled);
  });
});
