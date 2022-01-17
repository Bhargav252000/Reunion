'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      // User-Post Relationship
      this.belongsTo(models.User, {
        foreignKey: 'userId',
      });

      // Likes Relationship
      this.belongsToMany(models.User, {
        through: 'PostLikes',
        foreignKey: 'postId',
        as: 'likes',
      });

      // Comments Relationship
      this.hasMany(models.Comment, {
        foreignKey: 'postId',
        as: 'comments',
      });
    }
  }
  Post.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'posts',
      modelName: 'Post',
    }
  );
  return Post;
};
