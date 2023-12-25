import http from 'http';
import { env, port, ip, apiRoot } from './config';
import sequelize from './services/sequelize'; // Importez votre instance Sequelize
import express from './services/express';
import api from './api';

const app = express(apiRoot, api);
const server = http.createServer(app);

// Mettez à jour cette partie pour gérer la connexion à la base de données avec Sequelize
sequelize
  .sync() // Vous pouvez ajouter des options ici si nécessaire
  .then(() => {
    server.listen(port, ip, () => {
      console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

export default app;
