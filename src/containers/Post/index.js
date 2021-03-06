import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PostEditor from "./components/PostEditor";
import PostView from "./components/PostView";
import CommentList from "./components/CommentList";
import { getLoggedUser } from "../../redux/modules/auth";
import { actions as postActions } from "../../redux/modules/posts";
import { actions as commentActions } from "../../redux/modules/comments";
import { actions as uiActions, isEditDialogOpen } from "../../redux/modules/ui";
import { getPostDetail, getCommentsWithAuthors } from "../../redux/modules";
import "./style.css";

// 创建评论请求数据
const getCommentRequest = (postId, userId, content) => ({
  method: "createComment",
  jsonStringParameter: JSON.stringify({ postId, userId, content }),
});

class Post extends Component {
  componentDidMount() {
    const postId = this.props.match.params.id;
    this.props.fetchPost(postId);
    this.props.fetchComments(postId);
  }

  handleEditClick = () => {
    this.props.openEditDialog();
  };

  handlePostSave = (data) => {
    const id = this.props.match.params.id;
    this.props.updatePost(id, data);
  };

  handlePostCancel = () => {
    this.props.closeEditDialog();
  };

  handleCommentSubmit = (content) => {
    const postId = this.props.match.params.id;
    const { user } = this.props;
    const commentRequest = getCommentRequest(postId, user.get("userId"), content);
    this.props.createComment(commentRequest);
  };

  handlePraiseOrStar = (postId, mapType, method) => {
    this.props.postPraiseOrStar(postId, mapType, method);
  };

  render() {
    const { post, comments, user, isEditDialogOpen } = this.props;
    if (!post) {
      return null;
    }
    const rawPost = post.toJS();
    const rawComments = comments.toJS();
    const editable = user.get("userId") === rawPost.author.id;
    return (
      <div className="post">
        {isEditDialogOpen ? (
          <PostEditor
            post={rawPost}
            onSave={this.handlePostSave}
            onCancel={this.handlePostCancel}
          />
        ) : (
          <PostView
            post={rawPost}
            editable={editable}
            onEditClick={this.handleEditClick}
            onPraiseOrStar={this.handlePraiseOrStar}
          />
        )}
        <CommentList
          comments={rawComments}
          editable={!!user.get("userId")}
          onSubmit={this.handleCommentSubmit}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    user: getLoggedUser(state),
    post: getPostDetail(state, props.match.params.id),
    comments: getCommentsWithAuthors(state, props.match.params.id),
    isEditDialogOpen: isEditDialogOpen(state)
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(postActions, dispatch),
    ...bindActionCreators(commentActions, dispatch),
    ...bindActionCreators(uiActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Post);
