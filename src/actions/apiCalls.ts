import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import { ApiCallFailedError } from "@raha/api/dist/errors/ApiCallFailedError";

import { AsyncAction } from ".";

export const enum ApiCallsActionType {
  STARTED = "API_CALLS.STARTED",
  SUCCESS = "API_CALLS.SUCCESS",
  FAILURE = "API_CALLS.FAILURE"
}

export interface ApiCallsActionBase {
  endpoint: ApiEndpointName;
  identifier: string;
}

interface ApiCallStartedAction extends ApiCallsActionBase {
  type: ApiCallsActionType.STARTED;
}
interface ApiCallSuccessAction extends ApiCallsActionBase {
  type: ApiCallsActionType.SUCCESS;
}
interface ApiCallFailedAction extends ApiCallsActionBase {
  type: ApiCallsActionType.FAILURE;
  error: ApiCallFailedError;
}
export type ApiCallsAction =
  | ApiCallStartedAction
  | ApiCallSuccessAction
  | ApiCallFailedAction;

/**
 * Wrap an action that runs an API call, so that:
 * a) Errors from failed API calls are caught, and
 * b) The state of the API request is logged.
 *
 * @param asyncAction API call redux action to be wrapped
 * @param endpoint API endpoint being hit
 * @param identifier A way of identifying the outgoing API call. For example, if
 * the logged in user calls the API to trust another user, that other user's UID
 * would work. These should be unique, especially for non-idempotent calls, so
 * that they don't overwrite the state of earlier calls to the same endpoint.
 *
 * TODO: come up with a way to overcome this restriction.
 */
export const wrapApiCallAction: (
  asyncAction: AsyncAction,
  endpoint: ApiEndpointName,
  identifier: string
) => AsyncAction = (asyncAction, endpoint, identifier) => {
  return async (dispatch, getState, extraArgument) => {
    try {
      const startedAction: ApiCallsAction = {
        type: ApiCallsActionType.STARTED,
        endpoint,
        identifier
      };
      dispatch(startedAction);

      const result = await asyncAction(dispatch, getState, extraArgument);

      const successAction: ApiCallsAction = {
        type: ApiCallsActionType.SUCCESS,
        endpoint,
        identifier
      };
      dispatch(successAction);
      return result;
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.error("API Call failed:", err);
      const failureAction: ApiCallsAction = {
        type: ApiCallsActionType.FAILURE,
        endpoint,
        identifier,
        error: err
      };
      dispatch(failureAction);

      // continue throwing unrelated errors
      if (!(err instanceof ApiCallFailedError)) {
        throw err;
      }
    }
  };
};
