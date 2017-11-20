import React from 'react';
import PropTypes from 'prop-types';
import store from 'store';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { Button, Tabs, Tab } from 'react-bootstrap';
import parseMarkdown from '../../../modules/parse-markdown';
import setInputHeight from '../../../modules/set-input-height';

import './CommentComposer.scss';

class CommentComposer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { comment: '', activeTab: 1 };

    this.handleCommentSubmission = this.handleCommentSubmission.bind(this);
    this.storeText = this.storeText.bind(this);
    this.setExistingCommentOnState = this.setExistingCommentOnState.bind(this);
    this.getSubmitButtonClass = this.getSubmitButtonClass.bind(this);
    this.handleResetComposer = this.handleResetComposer.bind(this);
  }

  componentDidMount() {
    const { parent, documentId } = this.props;
    const existingComment = store.get(`app_comment_composer_${parent || documentId}`);
    if (existingComment) {
      const commentInput = this.comment;
      commentInput.value = existingComment;
      setInputHeight(100, commentInput);
      this.setExistingCommentOnState(existingComment);
    }
  }

  getSubmitButtonClass() {
    if (this.state.comment && (1500 - this.state.comment.length) < 200) return 'danger';
    if (this.state.comment && (1500 - this.state.comment.length) < 500) return 'warning';
    return 'success';
  }

  setExistingCommentOnState(comment) {
    this.setState({ comment });
  }

  escapeUnwantedMarkdown(message) {
    // Escape h1-h6 tags and inline images ![]() in Markdown.
    return message
      .replace(/#/g, '&#35;')
      .replace(/(!\[.*?\]\()(.*?)(\))+/g, '&#33;&#91;&#93;&#40;&#41;');
  }

  handleResetComposer() {
    const { parent, documentId, setActiveReply } = this.props;
    const commentInput = this.comment;
    commentInput.value = '';
    this.setState({ comment: '' });
    setActiveReply('');
    store.remove(`app_comment_composer_${parent || documentId}`);
    setInputHeight(100, commentInput);
  }

  handleCommentSubmission(event) {
    event.preventDefault();

    const { parent, documentId } = this.props;
    const comment = {
      documentId,
      comment: this.escapeUnwantedMarkdown(this.comment.value.trim()),
    };

    if (parent) comment.parent = parent;

    Meteor.call('comments.insert', comment, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Thanks for the feedback, friend!', 'success');
        this.handleResetComposer();
      }
    });
  }

  storeText(event) {
    const { parent, documentId } = this.props;
    const comment = this.comment.value;
    this.setState({ comment }, () => {
      store.set(`app_comment_composer_${parent || documentId}`, comment);
    });
    setInputHeight(100, event);
  }

  render() {
    return (
      <div className="CommentComposer">
        <form onSubmit={this.handleCommentSubmission} ref={composer => (this.composer = composer)} className="clearfix">
          <Tabs animation={false} activeKey={this.state.activeTab} onSelect={activeTab => this.setState({ activeTab })} id="CommentComposerTabs">
            <Tab eventKey={1} title="Edit">
              <textarea
                name="comment"
                ref={comment => (this.comment = comment)}
                value={this.state.comment}
                className="form-control"
                onChange={this.storeText}
                placeholder="What do you have to say about this?"
              />
              <Button
                type="submit"
                bsStyle={this.getSubmitButtonClass()}
                className="pull-right"
                disabled={this.state.comment && (this.state.comment.length < 1 || this.state.comment.length > 1500)}
              >
                Share Comment
              </Button>
              <p className="CommentComposer__characters-remaining pull-right">{1500 - this.state.comment.length}</p>
            </Tab>
            <Tab eventKey={2} title="Preview">
              <div className="CommentComposer__preview" dangerouslySetInnerHTML={{ __html: parseMarkdown(this.escapeUnwantedMarkdown(this.state.comment || 'Type a comment under "Edit" to preview it here.')) }} />
            </Tab>
          </Tabs>
        </form>
      </div>
    );
  }
}

CommentComposer.defaultProps = {
  parent: null,
};

CommentComposer.propTypes = {
  parent: PropTypes.string,
  documentId: PropTypes.string.isRequired,
  setActiveReply: PropTypes.func.isRequired,
};

export default CommentComposer;
