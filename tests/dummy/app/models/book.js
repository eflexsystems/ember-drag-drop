import Model, { attr, hasMany } from '@ember-data/model';

export default class Book extends Model {
  @attr('string') title;
  @hasMany('page', { inverse: 'book', async: false }) pages;
}
