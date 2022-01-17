'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // Follow relationship
      this.belongsToMany(models.User, {
        through: 'UserFollow',
        foreignKey: 'followerId',
        as: 'following',
      });

      // Follow relationship
      this.belongsToMany(models.User, {
        through: 'UserFollow',
        foreignKey: 'followeeId',
        as: 'follower',
      });

      // User has many posts --> One-to-Many Relationship
      this.hasMany(models.Post, {
        foreignKey: 'userId',
      });

      // Likes relationship
      this.belongsToMany(models.Post, {
        through: 'PostLikes',
        foreignKey: 'userId',
        as: 'likes',
      });

      // comments relationship
      // this.hasMany(models.Comment, {
      //   foreignKey: 'userId',
      //   as: 'comments',
      // });
    }

    // don't send password
    toJSON() {
      return {
        ...this.get(),
        password: undefined,
      };
    }
  }

  User.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'user_name',
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'users',
      modelName: 'User',
    }
  );
  return User;
};
