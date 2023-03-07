import { combineReducers } from "redux";
import evaluatedTreeReducer from "./treeReducer";
import evaluationDependencyReducer from "./dependencyReducer";
import loadingEntitiesReducer from "./loadingEntitiesReducer";
import formEvaluationReducer from "./formEvaluationReducer";
import triggerReducer from "./triggerReducer";
import successfulBindingsReducer from "./successfulBindingsReducer";

export default combineReducers({
  tree: evaluatedTreeReducer,
  dependencies: evaluationDependencyReducer,
  loadingEntities: loadingEntitiesReducer,
  formEvaluation: formEvaluationReducer,
  triggers: triggerReducer,
  bindings: successfulBindingsReducer,
});
