const app = require('./src/app');
const connectDB = require('./src/config/db');
const config = require('./src/config');

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const startServer = async () => {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(
      `[Server] SmartTaskFlow running in ${config.env} mode on http://localhost:${config.port}`
    );
  });

  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();

