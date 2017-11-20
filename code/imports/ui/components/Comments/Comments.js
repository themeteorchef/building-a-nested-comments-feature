import React from 'react';
import PropTypes from 'prop-types';
import CommentComposer from '../CommentComposer/CommentComposer';
import RenderComments from '../RenderComments/RenderComments';

import './Comments.scss';

class Comments extends React.Component {
  constructor(props) {
    super(props);
    this.state = { replyingComment: null };
    this.setActiveReply = this.setActiveReply.bind(this);
  }

  setActiveReply(commentId) {
    this.setState({ replyingComment: commentId });
  }

  pluralizeComments(length) {
    return length === 1 ? '1 response' : `${length} responses`;
  }

  render() {
    const { documentId, comments, commentCount } = this.props;
    return (
      <div id="Comments" className="Comments">
        <div className="Comments-inner">
          <h4>{this.pluralizeComments(commentCount)}</h4>
          <CommentComposer
            setActiveReply={this.setActiveReply}
            documentId={documentId}
          />
          <RenderComments
            setActiveReply={this.setActiveReply}
            replyingComment={this.state.replyingComment}
            setCommentCount={this.setCommentCount}
            documentId={documentId}
            comments={comments}
          />
        </div>
      </div>
    );
  }
}

Comments.defaultProps = {
  commentCount: 0,
};

Comments.propTypes = {
  commentCount: PropTypes.number,
  documentId: PropTypes.string.isRequired,
  comments: PropTypes.array.isRequired,
};

export default Comments;
