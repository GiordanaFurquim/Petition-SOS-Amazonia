var redis = require('redis');
var client = redis.createClient({
    host: 'localhost',
    port: 6379
});

const {promisify} = require('util');

client.on('error', function(err) {
    console.log(err);
});

//here we have all the Redis methods we're going to use
//now we are going to pomisify our Redis methods!
exports.get = promisify(client.get).bind(client);
exports.setex = promisify(client.setex).bind(client);
exports.del = promisify(client.del).bind(client);









//old school callback way.
// client.set('name', 'giordana', (error, data) => {
//
// });
