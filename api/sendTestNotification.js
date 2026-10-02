require('dotenv').config();
const notificationsService = require('./modules/notifications/service');

async function run() {
  const result = await notificationsService.notify({
    userId: 3,
    type: 'test',
    message: 'This is a test notification',
    orderId: 5,
  });
  console.log(result);
  process.exit();
}

run();