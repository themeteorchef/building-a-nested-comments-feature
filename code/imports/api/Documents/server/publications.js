import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Counts } from 'meteor/tmeasday:publish-counts';
import Documents from '../Documents';
import Comments from '../../Comments/Comments';

Meteor.publish('documents', function documents() {
  return Documents.find({ owner: this.userId });
});

// Note: documents.view is also used when editing an existing document.
Meteor.publish('documents.view', function documentsView(documentId, isEditing) {
  check(documentId, String);
  check(isEditing, Match.Maybe(Boolean));

  const query = { _id: documentId };
  if (isEditing) query.owner = this.userId;

  // Run a separate query for the actual comments vs. the one we use for the count as the counter
  // modifies the query, omitting any fields other than _id.
  Counts.publish(this, 'documents.view.commentCount', Comments.find({ documentId }));
  const comments = Comments.find({ documentId });

  return [
    Documents.find(query),
    comments,
    Meteor.users.find({ _id: { $in: comments.fetch().map(({ author }) => author) } }, { profile: { profile: 1 } }),
  ];
});
