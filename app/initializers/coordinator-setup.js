import Coordinator from '../models/coordinator';

export function initialize(application) {
  application.register('drag:coordinator', Coordinator);
}

export default {
  name: 'setup coordinator',
  initialize,
};
