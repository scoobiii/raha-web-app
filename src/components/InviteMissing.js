/**
 * For users who are logged in but have not issued any REQUEST_INVITE operation,
 * they have no member id so the page /m/:memberId does not exist. Instead after
 * log in they will be taken to this page at /invite_missing where we explain
 * how they can request and invite to become Raha members.
 */

import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage as FM } from 'react-intl';
import { Link, Redirect } from 'react-router-dom';

import Loading from './Loading';
import { getAuthMemberDocIsLoaded, getAuthMemberDoc } from '../connectors';

// TODO redirect if you are registered
function InviteMissing({ authFirebaseUser, authIsLoaded, authMemberDocIsLoaded, authMemberDoc }) {
  if (authIsLoaded && authFirebaseUser === null) {
    return <Redirect to="/login" />;
  }
  if (!authMemberDocIsLoaded) {
    return <Loading />;
  }
  if (authMemberDoc && authMemberDoc.exists) {
    return <Redirect to={`/m/${authMemberDoc.get('mid')}`} />;
  }
  return (
    <FM
      id="invite_missing"
      values={{
        display_name: authFirebaseUser.displayName,
        help_email: <a href="mailto:help@raha.io">help@raha.io</a>,
        login_account: <b>{authFirebaseUser.email}</b>,
        logout: <Link to='/logout'>logout</Link>
      }}
    />
  );
}

function mapStateToProps(state, ownProps) {
  const authMemberDoc = getAuthMemberDoc(state);
  return {
    authIsLoaded: state.auth.isLoaded,
    authFirebaseUser: state.auth.firebaseUser,
    authMemberDocIsLoaded: getAuthMemberDocIsLoaded(state),
    authMemberDoc
  };
}

export default connect(mapStateToProps, {})(InviteMissing);