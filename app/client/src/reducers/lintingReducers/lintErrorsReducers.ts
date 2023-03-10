import { ReduxActionTypes } from "@appsmith/constants/ReduxActionConstants";
import { LintError } from "utils/DynamicBindingUtils";
import { createImmerReducer } from "utils/ReducerUtils";
import { SetLintErrorsAction } from "actions/lintingActions";

export type LintErrorsStore = Record<string, LintError[]>;

const initialState: LintErrorsStore = {};

export const lintErrorReducer = createImmerReducer(initialState, {
  [ReduxActionTypes.FETCH_PAGE_INIT]: () => initialState,
  [ReduxActionTypes.SET_LINT_ERRORS]: (
    state: LintErrorsStore,
    action: SetLintErrorsAction,
  ) => {
    const { errors } = action.payload;
    for (const entityPath of Object.keys(errors)) {
      const entityPathLintErrors = errors[entityPath];
      state[entityPath] = entityPathLintErrors;
    }
  },
});
