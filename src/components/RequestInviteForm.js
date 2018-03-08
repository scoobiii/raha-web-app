import React, { Component } from 'react';
import { connect } from 'react-redux';
import { auth, db } from '../firebaseInit';
import { getRequestInviteOperation } from '../operations';
import { getMemberId } from '../members';
import { postOperation, fetchMemberIfNeeded } from '../actions';
import YoutubeVideo from './YoutubeVideo';

interface Props {
  partialAuthData: Map<string, string>;
  members: Map<string, any>;
}

const getPartialAuthData = (firebaseAuth) => {
  return {
    displayName: firebaseAuth.currentUser ? firebaseAuth.currentUser.displayName : ""
  }
}

export class RequestInviteForm extends Component<Props> {
    constructor(props) {
      super(props);
      this.state = {
        videoUrl: "",
        toUid: "",
        errorMessage: ""
      };
    }

    setVideoURL = async (event: any) : void => {
      this.setState({ videoUrl: event.target.value })
    }

    setToUid = async (event: any) : void => {
      this.setState({ toUid: event.target.value })
      this.props.fetchMemberIfNeeded(event.target.value);
    }

    handleOnSubmit = async (event: any) : void => {
      event.stopPropagation();

      if (this.state.videoUrl.length <= 0) {
        this.setState({ errorMessage: "Please enter a valid video url" });
      }

      else if (this.state.toUid.length <= 0 || !this.props.members[this.state.toUid]) {
        this.setState({ errorMessage: "Please enter a valid friend's uid" });
      }

      else {
        let toUid = this.state.toUid;
        let toMid = this.props.members[toUid].doc.get("mid");
        let fullName = this.props.partialAuthData.displayName;
        let creatorMid = getMemberId(fullName);
        let videoUrl = this.state.videoUrl;

        let requestOp = getRequestInviteOperation(toUid, toMid, creatorMid, fullName, videoUrl);
        await this.props.postOperation(requestOp);
      }
    }

    clearErrorMessage(e: any) : void {
      this.setState({ errorMessage: "" });
    }

    render() {
      return (
        <div>
          <b>Request Invite</b>
          <div>We are excited to have you! To sign up, all we need are:</div>
          <div>
            <ul>
              <li>your full name (we get this from Google)</li>
              <li>your invite video url</li>
              <li>member id of friend on raha</li>
            </ul>
          </div>
          <div>
            <input
              value={this.props.partialAuthData.displayName}
              className="InviteInput ExtraWidth DisplayNameInput"
              disabled
            />           
          </div>
          <div>
            <input
              onChange={this.setVideoURL}
              placeholder="VideoUrl"
              className="InviteInput ExtraWidth VideoUrlInput"
            />           
          </div>
          <div>
            <input
              onChange={this.setToUid}
              placeholder="Trusted raha friend's uid"
              className="InviteInput ExtraWidth UidInput"
            />           
          </div>
          <button className="InviteButton"
            onClick={this.handleOnSubmit}>
            Invite me!
          </button>
          <div className="InviteError">{ this.state.errorMessage }</div>
          <div className="InviteVideoContainer">
            {this.state.videoUrl && <YoutubeVideo youtubeUrl={this.state.videoUrl} />}
          </div>
        </div>
      );
    }
}

function mapStateToProps(state, ownProps) {
  return {
    partialAuthData: getPartialAuthData(auth),
    members: state.uidToMembers
  };
}

export default connect(mapStateToProps, { postOperation, fetchMemberIfNeeded })(RequestInviteForm);