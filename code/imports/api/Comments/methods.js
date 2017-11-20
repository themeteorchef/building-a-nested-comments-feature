import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import Comments from './Comments';
import rateLimit from '../../modules/rate-limit';

Meteor.methods({
  'comments.insert': function commentsInsert(comment) {
    check(comment, Object);

    if (!this.userId) throw new Meteor.Error('500', 'Need ya logged in for this, bub.');

    if (comment.comment.length > 1500) {
      throw new Meteor.Error('500', 'Novels are great, but not for comment sections, y\'know?');
    }

    try {
      return Comments.insert({ ...comment, author: this.userId });
    } catch (exception) {
      throw new Meteor.Error('500', `${exception}`);
    }
  },
  'comments.remove': function commentsRemove(_id) {
    check(_id, String);

    if (!Meteor.userId()) throw new Meteor.Error('500', 'Need ya logged in for this, bub.');

    const user = this.userId;
    const comment = Comments.findOne(_id);
    const canDelete = comment.author === user || Roles.userIsInRole(user, 'admin');

    try {
      if (canDelete) {
        Comments.update(_id, {
          $set: {
            comment: 'This comment has been deleted.',
            author: 'No author.',
            deleted: true,
          },
        });
      } else {
        throw new Meteor.Error('500', 'Easy on the gas, Neo. You\'re not allowed to delete this!');
      }
    } catch (exception) {
      throw new Meteor.Error('500', `${exception}`);
    }
  },
});

rateLimit({
  methods: [
    'comments.insert',
    'comments.remove',
  ],
  limit: 5,
  timeRange: 1000,
});
