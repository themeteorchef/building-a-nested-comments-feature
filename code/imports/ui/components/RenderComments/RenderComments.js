import React from 'react';
import PropTypes from 'prop-types';
import Comment from '../Comment/Comment';
import Comments from '../../../api/Comments/Comments';

import './RenderComments.scss';

class RenderComments extends React.Component {
  fetchChildren(parent) {
    return Comments.find({ parent }).fetch();
  }

  render() {
    const {
      documentId, comments, setActiveReply, replyingComment,
    } = this.props;
    return (
      <ol className="RenderComments">
        {comments.map(comment => (
          <Comment
            setActiveReply={setActiveReply}
            replyingComment={replyingComment}
            isActiveReply={replyingComment === comment._id}
            key={comment._id}
            documentId={documentId}
            comment={comment}
            childComments={this.fetchChildren(comment._id)}
          />
        ))}
      </ol>
    );
  }
}

RenderComments.defaultProps = {
  replyingComment: null,
};

RenderComments.propTypes = {
  setActiveReply: PropTypes.func.isRequired,
  replyingComment: PropTypes.string,
  documentId: PropTypes.string.isRequired,
  comments: PropTypes.array.isRequired,
};

export default RenderComments;
