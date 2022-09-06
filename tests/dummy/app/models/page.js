import Model, { attr, belongsTo } from '@ember-data/model';

export default class Page extends Model {
  @attr('string') title;
  @belongsTo('book', { inverse: 'pages', async: false }) book;
}
