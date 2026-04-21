require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5001;

const bootstrap = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`XPLearning API running on port ${PORT}`);
  });
};

bootstrap().catch((err) => {
  console.error('Failed to start API:', err.message);
  process.exit(1);
});
