import { success, notFound } from '../../services/response/';
import User  from './model';
import { sign } from '../../services/jwt';

export const index = async ({ querymen: { query, select, cursor } }, res, next) => {
  try {
    const count = await User.count();
    const users = await User.findAll({ where: query, attributes: select, offset: cursor.skip, limit: cursor.limit });
    const response = {
      rows: users.map((user) => user.view()),
      count,
    };
    success(res)(response);
  } catch (error) {
    next(error);
  }
};

export const show = async ({ params }, res, next) => {
  try {
    const user = await User.findByPk(params.id);
    if (!user) {
      notFound(res)();
    } else {
      success(res)(user.view());
    }
  } catch (error) {
    next(error);
  }
};

export const showMe = ({ user }, res) => {
  res.json(user.view(true));
};

export const create = async ({ bodymen: { body } }, res, next) => {
  try {
    console.log(body)
    const user = await User.create(body);
    const token = await sign(user.id);
    success(res, 201)({ token, user: user.view(true) });
  } catch (err) {
    /* istanbul ignore else */
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({
        valid: false,
        param: 'email',
        message: 'email already registered',
      });
    } else {
      next(err);
    }
  }
};

export const update = async ({ bodymen: { body }, params, user }, res, next) => {
  try {
    const result = await User.findByPk(params.id === 'me' ? user.id : params.id);
    if (!result) {
      notFound(res)();
      return;
    }
    const isAdmin = user.role === 'admin';
    const isSelfUpdate = user.id === result.id;
    if (!isSelfUpdate && !isAdmin) {
      res.status(401).json({
        valid: false,
        message: "You can't change other user's data",
      });
      return;
    }
    const updatedUser = await result.update(body);
    success(res)(updatedUser.view(true));
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async ({ bodymen: { body }, params, user }, res, next) => {
  try {
    const result = await User.findByPk(params.id === 'me' ? user.id : params.id);
    if (!result) {
      notFound(res)();
      return;
    }
    const isSelfUpdate = user.id === result.id;
    if (!isSelfUpdate) {
      res.status(401).json({
        valid: false,
        param: 'password',
        message: "You can't change other user's password",
      });
      return;
    }
    const updatedUser = await result.update({ password: body.password });
    success(res)(updatedUser.view(true));
  } catch (error) {
    next(error);
  }
};

export const destroy = async ({ params }, res, next) => {
  try {
    const user = await User.findByPk(params.id);
    if (!user) {
      notFound(res)();
      return;
    }
    await user.destroy();
    success(res, 204)();
  } catch (error) {
    next(error);
  }
};
