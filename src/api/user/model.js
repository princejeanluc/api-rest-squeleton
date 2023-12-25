import { DataTypes,Model} from 'sequelize';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import sequelize from '../../services/sequelize';   
const roles = ['user', 'admin'];


class User extends Model {
  // Vous pouvez ajouter des méthodes spécifiques à votre modèle ici
  view(full) {
    const view = {};
    let fields = ['id', 'name', 'picture'];

    if (full) {
      fields = [...fields, 'email', 'createdAt'];
    }

    fields.forEach((field) => {
      view[field] = this[field];
    });

    return view;
  }

  authenticate(password) {
    console.log(password)
    console.log("-------in User Model----------")
    console.log(this.password)
    return bcrypt.compare(password, this.password).then((valid) => (valid ? this : false));
  }
}

User.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },
    name: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 255],
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: {
          args: [roles],
          msg: 'Le rôle doit être "user" ou "admin"',
        },
      },
    },
    picture: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 255],
      },
    },
  },
  {
    sequelize,
    modelName: 'User',
    timestamps: true,
    underscored: true,
  }
);

User.beforeSave(async (user, options) => {
  if (!user.changed('password')) return;

  const rounds = process.env.NODE_ENV === 'test' ? 1 : 9;

  try {
    const hash = await bcrypt.hash(toString(user.password), rounds);
    user.dataValues.password = hash;
  } catch (error) {
    throw error;
  }
});

User.beforeSave((user, options) => {
  if (!user.picture || user.picture.indexOf('https://gravatar.com') === 0) {
    const hash = crypto.createHash('md5').update(toString(user.email)).digest('hex');
    user.picture = `https://gravatar.com/avatar/${hash}?d=identicon`;
  }

  if (!user.name) {
    user.name = user.email.replace(/^(.+)@.+$/, '$1');
  }

  return toString(user.email);
});



export default User;

