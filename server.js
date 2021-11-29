const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Error Outside: UNCAUGHT EXCEPTION
// handle all errors that occur in synchronous code
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION !');
  console.log('SHUTTING DOWN...');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

// Error Outside: UNHANDLER REJECTION
// handle all errors that occur in asynchronous code
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION !');
  console.log('SHUTTING DOWN...');
  server.close(() => {
    process.exit(1);
  });
});
