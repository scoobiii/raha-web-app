import * as React from "react";
import * as firebase from "firebase";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
import styled from "styled-components";

import {
  fetchMemberByMidIfNeeded,
  fetchMemberByUidIfNeeded,
  postOperation
} from "../actions";
import { getPrivateVideoInviteRef, getMemberDocByMid } from "../connectors";
import { getMemberId, MemberDoc } from "../members";
import { getRequestInviteOperation } from "../operations";
import { storageRef } from '../firebaseInit';
import { AppState } from "../store";
import InviteVideo from "./InviteVideo";
import Loading from "./Loading";
import LogIn from "./LogIn";
import Video from "./Video";

const RequestInviteElem = styled.main`
  div {
    margin: 1vh 1vw;
  }

  > .completelyFree {
    font-weight: bold;
  }

  > .requestInviteMessage {
    font-weight: bold;
  }
`;

interface State {
  videoUrl: string;
  toUid: string;
  errorMessage: string;
  // TODO: why is this here if it's already in state?
  fullName: string | null;
  submitted?: boolean;
  creatorMid?: string;
  uploading: boolean;
  uploaded: boolean;
  uploadedBytes: number;
  totalBytes: number;
}

// TODO: could be more but this is a really confusing component
// TODO: this seems to be duplicated in multiple places
interface OwnProps {
  match: { params: { memberId: string } };
}

type Props = OwnProps & {
  fullName: string | null;
  postOperation: typeof postOperation;
  fetchMemberByMidIfNeeded: typeof fetchMemberByMidIfNeeded;
  fetchMemberByUidIfNeeded: typeof fetchMemberByUidIfNeeded;
  isAuthLoaded: boolean;
  isAuthMemberDocLoaded: boolean;
  isToMemberDocLoaded: boolean;
  memberId: string;
  toMemberDoc: MemberDoc;
  notSignedIn: boolean;
  authFirebaseUser: { uid: string };
};

interface HTMLInputEvent extends React.FormEvent<HTMLInputElement> {
  target: HTMLInputElement & EventTarget;
}

export class RequestInvite extends React.Component<Props, State> {
  private inviteVideoInput: HTMLInputElement | null;

  constructor(props: Props) {
    super(props);
    this.inviteVideoInput = null;
    this.state = {
      videoUrl: "",
      toUid: "",
      errorMessage: "",
      fullName: props.fullName,
      uploading: false,
      uploaded: false,
      uploadedBytes: 0,
      totalBytes: 0
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (nextProps.fullName !== this.props.fullName) {
      this.setState({ fullName: nextProps.fullName });
    }
    this.fetchIfNeeded(nextProps);
  }

  private readonly fetchIfNeeded = (props: Props) => {
    // TODO this logic very similar to Profile.componentWillReceiveProps.
    // Decomp/https://reactjs.org/docs/higher-order-components.html/https://github.com/acdlite/recompose
    if (props.memberId) {
      this.props.fetchMemberByMidIfNeeded(props.memberId);
    }
    if (props.authFirebaseUser) {
      this.props.fetchMemberByUidIfNeeded(props.authFirebaseUser.uid);
    }
  }

  private readonly setVideoURL = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.setState({ videoUrl: event.currentTarget.value });
  };

  private readonly setFullName = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    this.setState({ fullName: event.currentTarget.value });
  };

  private readonly inviteVideoStorageRef = () => {
    const userId = this.props.authFirebaseUser.uid;
    return getPrivateVideoInviteRef(storageRef, userId);
  }

  private uploadInviteVideo = async (event: HTMLInputEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (event.target.files === null) {
      this.setState({ errorMessage: 'Invalid video file' });
      return;
    }
    const file = event.target.files[0];

    if (file.size > 40 * 1024 * 1024) {
      this.setState({ errorMessage: 'Video is larger than 40 MB, please upload smaller video.' });
    }

    const metadata = {
      'contentType': file.type
    };

    this.setState({ uploading: true });
    const uploadTask = this.inviteVideoStorageRef().put(file, metadata);
    uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
      s => {
        const snapshot = s as firebase.storage.UploadTaskSnapshot;
        this.setState({uploadedBytes: snapshot.bytesTransferred, totalBytes: snapshot.totalBytes});
      },
      e => this.setState({ errorMessage: 'Could not upload' }),
      () => this.setState({ videoUrl: uploadTask.snapshot.downloadURL as string, uploading: false })
    );
  }

  private isOwnInvitePage() {
    return this.props.authFirebaseUser.uid === this.props.toMemberDoc.id;
  }

  private readonly handleOnSubmit = async (
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    event.stopPropagation();

    if (this.isOwnInvitePage()) {
      this.setState({ errorMessage: 'Sorry, cannot invite yourself!' });
      return;
    }

    if (this.state.uploaded !== true) {
      this.setState({ errorMessage: 'Upload a video first!' });
      return;
    }

    if (this.state.uploading === true) {
      this.setState({ errorMessage: 'Please wait for video upload to finish' });
      return;
    }

    if (this.state.uploaded !== true) {
      this.setState({ errorMessage: 'Upload a video first!' });
      return;
    }

    const toMemberDoc = this.props.toMemberDoc;
    const toUid = toMemberDoc.id;
    const toMid = toMemberDoc.get("mid");
    const fullName = this.state.fullName;
    // TODO: is this how we want to handle lack of name?
    const creatorMid = getMemberId(fullName || "");
    const videoUrl = this.state.videoUrl;
    // TODO: should null fullName be handled this way?
    const requestOp = getRequestInviteOperation(
      creatorMid,
      this.props.authFirebaseUser.uid,
      toMid,
      toUid,
      fullName || "",
      videoUrl
    );
    try {
      await this.props.postOperation(requestOp);
    } catch (e) {
      this.setState({ errorMessage: 'Failed to request invite' });
      return;
    }
    this.setState({ submitted: true, creatorMid });
  };

  private renderLogIn() {
    // TODO while login is loading user should not see the rest of page
    return (
      <div>
        <LogIn noRedirect={true} />
        <FormattedMessage id="sign_up_above" />
      </div>
    );
  }

  private renderForm() {
    return (
      <div>
        <br />
        <div>
          <input
            value={this.state.fullName || ""}
            onChange={this.setFullName}
            placeholder="First and last name"
            className="InviteInput DisplayNameInput"
          />
        </div>
        <div>
          <label><FormattedMessage id="record_invite" /></label>
          <input onChange={this.uploadInviteVideo} id="inviteVideo" capture={true} accept="video/mp4" type="file" />
        </div>
        {this.state.uploading && <div>Uploaded {Math.round(100.0 * this.state.uploadedBytes / this.state.totalBytes)}%</div>}
        <button className="InviteButton Green" onClick={this.handleOnSubmit}>
          Invite me!
        </button>
        <div className="InviteError">{this.state.errorMessage}</div>
        {this.state.videoUrl && (
          <div>
            <h2>
              <FormattedMessage id="join_video" />
            </h2>
            <Video videoUrl={this.state.videoUrl} />
          </div>
        )}
      </div>
    );
  }

  public render() {
    // TODO check if user already invited
    if (this.state.submitted) {
      // TODO we should instead redirect to profileUrl, which should display this message along with their invite video.
      const profileUrl = `${window.location.origin}/m/${this.state.creatorMid}`;
      return (
        <div>
          Your video has been submitted for review! After approval by us and{" "}
          {this.props.toMemberDoc.get("full_name")}, your profile will appear at{" "}
          <a href={profileUrl}>{profileUrl}</a>. We are available at{" "}
          <a href="mailto:help@raha.io">help@raha.io</a> if you have any
          questions.
        </div>
      );
    }
    if ((!this.props.notSignedIn && !this.props.isAuthMemberDocLoaded) || !this.props.isToMemberDocLoaded) {
      // TODO the loading appears again breifly is user goes from logged out to signed in with this.renderLogIn()
      return <Loading />;
    }
    return (
      <RequestInviteElem>
        {this.isOwnInvitePage() && <div><FormattedMessage id="own_invite_page" /></div>}
        <div className="requestInviteMessage">
          <FormattedMessage
            id="request_invite"
            values={{
              full_name: this.props.toMemberDoc.get("full_name"),
              mid: this.props.memberId
            }}
          />
        </div>
        <InviteVideo memberId={this.props.memberId} userId={this.props.toMemberDoc.id} />
        <div>
          <FormattedMessage
            id="invite_me_intro"
            values={{
              full_name: this.props.toMemberDoc.get("full_name"),
              completely_free: (
                <span className="completelyFree">
                  <FormattedMessage id="completely_free" />
                </span>
              )
            }}
          />
        </div>
        {this.props.notSignedIn ? (
          this.renderLogIn()
        ) : this.props.isAuthLoaded ? (
          this.renderForm()
        ) : (
              <Loading />
            )}
      </RequestInviteElem>
    );
  }
}

function mapStateToProps(state: AppState, ownProps: OwnProps): Partial<Props> {
  const memberId = ownProps.match.params.memberId;
  const isAuthLoaded = state.auth.isLoaded;
  const toMemberDoc = getMemberDocByMid(state, memberId);

  const stateToPropsMap = {
    isAuthLoaded,
    memberId,
    isToMemberDocLoaded: toMemberDoc && !toMemberDoc.isFetching,
    toMemberDoc,
    notSignedIn: true
  };

  if (!isAuthLoaded) {
    return stateToPropsMap;
  }
  const authFirebaseUser = state.auth.firebaseUser;
  if (!authFirebaseUser) {
    return stateToPropsMap;
  }
  const authMember = state.members.byUid[authFirebaseUser.uid];

  const extraProps = {
    ...stateToPropsMap,
    notSignedIn: false,
    authFirebaseUser,
    isAuthMemberDocLoaded: authMember && !authMember.isFetching
  };
  return state.auth.firebaseUser !== null
    ? {
      ...extraProps,
      fullName: state.auth.firebaseUser.displayName
    }
    : extraProps;
}

export default connect(mapStateToProps, {
  postOperation,
  fetchMemberByMidIfNeeded,
  fetchMemberByUidIfNeeded
})(RequestInvite);
