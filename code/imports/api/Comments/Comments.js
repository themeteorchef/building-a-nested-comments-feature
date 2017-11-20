import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Comments = new Mongo.Collection('Comments');

Comments.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Comments.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

const CollectionSchema = new SimpleSchema({
  documentId: {
    type: String,
    label: 'The ID of the document this comment belongs to.',
  },
  author: {
    type: String,
    label: 'The user ID of the author posting this comment.',
  },
  date: {
    type: String,
    label: 'Date the comment was posted.',
    autoValue() { // eslint-disable-line
      if (this.isInsert && !this.field('date').value) return (new Date()).toISOString();
    },
  },
  comment: {
    type: String,
    label: 'The content of the comment.',
  },
  parent: {
    type: String,
    label: 'The parent of this comment, if one exists.',
    optional: true,
  },
  deleted: {
    type: Boolean,
    label: 'Has this comment been deleted?',
    defaultValue: false,
  },
});

Comments.attachSchema(CollectionSchema);

export default Comments;
