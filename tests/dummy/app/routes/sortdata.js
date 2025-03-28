import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class extends Route {
  @service store;
  createdStore = false;

  model() {
    if (!this.createdStore) {
      let page1 = this.store.createRecord('page', {
        id: 1,
        title: 'Page Title 1',
      });
      let page2 = this.store.createRecord('page', {
        id: 2,
        title: 'Page Title 2',
      });
      let page3 = this.store.createRecord('page', {
        id: 3,
        title: 'Page Title 3',
      });
      let page4 = this.store.createRecord('page', {
        id: 4,
        title: 'Page Title 4',
      });
      this.createdStore = true;
      return this.store.createRecord('book', {
        id: 1,
        title: 'Book Title',
        pages: [page1, page2, page3, page4],
      });
    }
  }

  setupController(controller, book) {
    controller.book = book;
  }
}
