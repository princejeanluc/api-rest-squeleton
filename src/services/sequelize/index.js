import { Sequelize } from 'sequelize';
import { sequelize as sequelizeConfig } from '../../config';


let conf = {
    host: sequelizeConfig.host,
    dialect: sequelizeConfig.dialect,
    username:sequelizeConfig.username,
    password:  sequelizeConfig.password, 
    database:sequelizeConfig.database,
  
  }
console.log(conf)
const sequelize = new Sequelize(conf);

sequelize.authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

export default sequelize;
