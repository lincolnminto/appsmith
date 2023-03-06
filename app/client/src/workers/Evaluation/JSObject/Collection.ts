import { getEntityNameAndPropertyPath } from "@appsmith/workers/Evaluation/evaluationUtils";
import { klona } from "klona/full";

export type VariableState = Record<string, Record<string, any>>;

type CurrentJSCollectionState = Record<string, any>;
type ResolvedFunctions = Record<string, any>;

export default class JSObjectCollection {
  private static resolvedFunctions: ResolvedFunctions = {};
  private static unEvalState: CurrentJSCollectionState = {};
  private static variableState: VariableState = {};

  static setResolvedFunctions(resolvedFunctions: ResolvedFunctions) {
    this.resolvedFunctions = resolvedFunctions;
  }

  static getResolvedFunctions() {
    return this.resolvedFunctions;
  }

  static getUnEvalState() {
    return this.unEvalState;
  }

  static setVariableValue(variableValue: unknown, fullPropertyPath: string) {
    const { entityName, propertyPath } = getEntityNameAndPropertyPath(
      fullPropertyPath,
    );
    const newVarState = { ...(this.variableState[entityName] || {}) };
    newVarState[propertyPath] = variableValue;
    this.variableState[entityName] = newVarState;
  }

  static setVariableState(variableState: VariableState) {
    this.variableState = variableState;
  }

  static getCurrentVariableState(
    JSObjectName?: string,
  ): VariableState | Record<string, any> {
    if (!JSObjectName || !this.variableState) return klona(this.variableState);
    return klona(this.variableState[JSObjectName]);
  }

  static removeVariable(fullPath: string) {
    const { entityName, propertyPath } = getEntityNameAndPropertyPath(fullPath);
    const jsObject = this.variableState[entityName];
    if (jsObject && jsObject[propertyPath] !== undefined)
      delete jsObject[propertyPath];
  }
}