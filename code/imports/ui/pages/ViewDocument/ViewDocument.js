import React from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar, ButtonGroup, Button } from 'react-bootstrap';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { Counts } from 'meteor/tmeasday:publish-counts';
import Documents from '../../../api/Documents/Documents';
import CommentsCollection from '../../../api/Comments/Comments';
import Comments from '../../components/Comments/Comments';
import NotFound from '../NotFound/NotFound';
import Loading from '../../components/Loading/Loading';

const handleRemove = (documentId, history) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('documents.remove', documentId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Document deleted!', 'success');
        history.push('/documents');
      }
    });
  }
};

const renderDocument = (doc, commentCount, comments, match, history) => (doc ? (
  <div className="ViewDocument">
    <div className="page-header clearfix">
      <h4 className="pull-left">{ doc && doc.title }</h4>
      <ButtonToolbar className="pull-right">
        <ButtonGroup bsSize="small">
          <Button onClick={() => history.push(`${match.url}/edit`)}>Edit</Button>
          <Button onClick={() => handleRemove(doc._id, history)} className="text-danger">
            Delete
          </Button>
        </ButtonGroup>
      </ButtonToolbar>
    </div>
    { doc && doc.body }
    <Comments
      documentId={doc._id}
      commentCount={commentCount}
      comments={comments}
    />
  </div>
) : <NotFound />);

const ViewDocument = ({
  loading, doc, commentCount, comments, match, history,
}) => (
  !loading ? renderDocument(doc, commentCount, comments, match, history) : <Loading />
);

ViewDocument.defaultProps = {
  doc: null,
  commentCount: 0,
};

ViewDocument.propTypes = {
  loading: PropTypes.bool.isRequired,
  doc: PropTypes.object,
  commentCount: PropTypes.number,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  comments: PropTypes.array.isRequired,
};

export default withTracker(({ match }) => {
  const documentId = match.params._id;
  const subscription = Meteor.subscribe('documents.view', documentId);

  return {
    loading: !subscription.ready(),
    doc: Documents.findOne(documentId),
    commentCount: Counts.get('documents.view.commentCount'),
    comments: CommentsCollection.find({ documentId, parent: { $exists: false } }).fetch(),
  };
})(ViewDocument);
