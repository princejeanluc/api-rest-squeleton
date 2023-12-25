const path = require('path')
const merge = require('lodash/merge')
/* istanbul ignore next */
const requireProcessEnv = (name) => {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
};

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv-safe');
  dotenv.config({
    allowEmptyValues:true,
    path: path.join(__dirname, '../.env'),
    example: path.join(__dirname, '../.env.example')
  });
}

const config = {
  all: {
    env: process.env.NODE_ENV || 'development',
    root: path.join(__dirname, '..'),
    port: process.env.PORT || 9000,
    ip: process.env.IP || '0.0.0.0',
    apiRoot: process.env.API_ROOT || '',
    masterKey: requireProcessEnv('MASTER_KEY'),
    jwtSecret: requireProcessEnv('JWT_SECRET'),
    sequelize: {
      username: requireProcessEnv('DB_USERNAME'),
      password: requireProcessEnv('DB_PASSWORD'),
      database: requireProcessEnv('DB_NAME'),
      host: requireProcessEnv('DB_HOST'),
      dialect: 'mysql', // Remplacez-le par le dialecte de votre base de données (mysql, postgres, etc.)
    },
  },
  test: {},
  development: {},
  production: {
    ip: process.env.IP || undefined,
    port: process.env.PORT || 8080,
  },
};

module.exports = merge(config.all, config[config.all.env]);
export default module.exports;
