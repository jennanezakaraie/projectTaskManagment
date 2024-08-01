const Pusher = require('pusher');

const pusher = new Pusher({
  appId: '1839252',
  key: '8e7f9942d9f91fae4f0e',
  secret: 'c3e2bc760f804e809c4d',
  cluster: 'eu',
  useTLS: true
});

module.exports = pusher;