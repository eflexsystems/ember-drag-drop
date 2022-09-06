import Coordinator from 'ember-drag-drop/utils/coordinator';

export function initialize(application) {
  application.register('drag:coordinator', Coordinator);
}

export default {
  name: 'setup coordinator',
  initialize,
};
