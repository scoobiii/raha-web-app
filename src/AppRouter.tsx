import * as React from "react";
import { Route, Switch } from "react-router-dom";
import { ConnectedRouter } from "react-router-redux";
import createHistory from "history/createBrowserHistory";

import "./App.css";

import { AppLayout } from "./pages/AppLayout";
import { CodeOfConduct } from "./pages/CodeOfConduct";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { LogIn } from "./components/LogIn";
import { LogOut } from "./pages/LogOut";
import { GlobalFeed } from "./pages/GlobalFeed";
import { PageNotFound } from "./pages/PageNotFound";
import { ProxyVotes } from "./pages/ProxyVotes";
import { Splash } from "./pages/Splash";
import { TermsOfService } from "./pages/TermsOfService";
import { Leaderboard } from "./pages/Leaderboard";
import { Network } from "./pages/Network";
import { AccountMigration } from "./pages/AccountMigration";
import { SSODiscourse } from "./pages/SSODiscourse";
import { AcceptInvite } from "./pages/AcceptInvite";
import { Metrics } from "./pages/Metrics";

// tslint:disable-next-line:no-any
const DefaultLayout = (props: any) => {
  const { component, ...rest } = props;
  const Component = component;
  return (
    <Route
      {...rest}
      render={matchProps => (
        <AppLayout>
          <Component {...matchProps} />
        </AppLayout>
      )}
    />
  );
};

export const routerHistory = createHistory();
function AppRouter() {
  return (
    <ConnectedRouter history={routerHistory}>
      <Switch>
        <DefaultLayout exact={true} path="/" component={Splash} />
        <DefaultLayout path="/invite-missing" component={AccountMigration} />
        <DefaultLayout path="/login" component={LogIn} />
        <DefaultLayout path="/logout" component={LogOut} />
        <DefaultLayout path="/code-of-conduct" component={CodeOfConduct} />
        <DefaultLayout path="/privacy-policy" component={PrivacyPolicy} />
        <DefaultLayout path="/feed" component={GlobalFeed} />
        <DefaultLayout path="/terms-of-service" component={TermsOfService} />
        <DefaultLayout path="/leaderboard" component={Leaderboard} />
        <DefaultLayout path="/votes" component={ProxyVotes} />
        <DefaultLayout path="/network" component={Network} />
        <DefaultLayout path="/accountMigration" component={AccountMigration} />
        <DefaultLayout path="/metrics" component={Metrics} />
        <DefaultLayout path="/sso/discourse" component={SSODiscourse} />
        <DefaultLayout path="/invite" component={AcceptInvite} />

        <DefaultLayout
          path="/m/:memberUsername/invite"
          component={AccountMigration}
        />
        <DefaultLayout
          path="/m/:memberUsername/wallet"
          component={AccountMigration}
        />
        <DefaultLayout path="/m/:memberUsername" component={AccountMigration} />

        <DefaultLayout component={PageNotFound} />
      </Switch>
    </ConnectedRouter>
  );
}

export { AppRouter };
