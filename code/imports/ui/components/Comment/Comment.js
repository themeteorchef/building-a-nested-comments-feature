import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import ComposeComment from '../CommentComposer/CommentComposer';
import RenderComments from '../RenderComments/RenderComments';
import { timeago } from '../../../modules/dates';
import parseMarkdown from '../../../modules/parse-markdown';

import './Comment.scss';

class Comment extends React.Component {
  constructor(props) {
    super(props);
    this.toggleReply = this.toggleReply.bind(this);
    this.handleDeleteComment = this.handleDeleteComment.bind(this);
  }

  getAuthorName(authorId) {
    const user = Meteor.users.findOne({ _id: authorId }, { fields: { profile: 1 } });
    return `${user.profile.name.first} ${user.profile.name.last}`;
  }

  toggleReply(event) {
    event.preventDefault();
    const { comment, isActiveReply, setActiveReply } = this.props;
    const active = isActiveReply ? null : comment._id;
    setActiveReply(active);
  }

  handleDeleteComment() {
    if (confirm('You sure? This is permanent, honcho.')) {
      const { _id } = this.props.comment;
      Meteor.call('comments.remove', _id, (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          if (this.props.comment.parent) window.location.reload();
        }
      });
    }
  }

  renderCommentBody() {
    const { comment } = this.props;
    return comment.deleted ? (
      <div className="comment-body">
        <p className="deleted">{comment.comment}</p>
      </div>
    ) : (
      <div className="Comment__comment-body">
        <h5 className="Comment__author-date">
          <div className="name-date">
            <span className="name">{this.getAuthorName(comment.author)}</span>
            <span className="date">{timeago(comment.date)}</span>
          </div>
        </h5>
        <div dangerouslySetInnerHTML={{ __html: parseMarkdown(comment.comment) }} />
      </div>
    );
  }

  renderCommentFooter() {
    const { comment, isActiveReply } = this.props;
    return !comment.deleted && Meteor.userId() ? (
      <div className="Comment__comment-footer clearfix">
        <Button
          className="comment-reply"
          bsStyle="default"
          bsSize="small"
          onClick={this.toggleReply}
        >
          {isActiveReply ? 'Cancel' : 'Reply'}
        </Button>
        {comment.author === Meteor.userId() ? (
          <Button
            className="comment-delete"
            bsStyle="danger"
            bsSize="small"
            onClick={this.handleDeleteComment}
          >
            Delete
          </Button>
        ) : ''}
      </div>
    ) : '';
  }

  render() {
    const {
      documentId,
      comment,
      isActiveReply,
      setActiveReply,
      replyingComment,
      childComments,
    } = this.props;

    return (
      <li id={`comment-${comment._id}`} className="Comment">
        <div className="Comment__comment-frame">
          { this.renderCommentBody() }
          { this.renderCommentFooter() }
        </div>
        { isActiveReply ? (
          <ComposeComment
            ref={`composer_${comment._id}`}
            setActiveReply={setActiveReply}
            documentId={documentId}
            parent={comment._id}
          />
        ) : '' }
        <RenderComments
          setActiveReply={setActiveReply}
          replyingComment={replyingComment}
          documentId={documentId}
          comments={childComments}
        />
      </li>
    );
  }
}

Comment.defaultProps = {
  childComments: [],
  replyingComment: null,
};

Comment.propTypes = {
  childComments: PropTypes.array,
  documentId: PropTypes.string.isRequired,
  comment: PropTypes.object.isRequired,
  setActiveReply: PropTypes.func.isRequired,
  isActiveReply: PropTypes.bool.isRequired,
  replyingComment: PropTypes.string,
};

export default Comment;
