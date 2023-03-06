import JSVariableUpdates, { getUpdatedPaths } from "../JSVariableUpdates";
import { DataTree, ENTITY_TYPE } from "entities/DataTree/dataTreeFactory";
import { createEvaluationContext } from "workers/Evaluation/evaluate";
import JSObjectCollection, { VariableState } from "../Collection";

jest.mock("../../evalTreeWithChanges.ts", () => {
  return {
    triggerEvalWithChanges: () => ({}),
  };
});

jest.mock("../../handlers/evalTree", () => {
  return {
    dataTreeEvaluator: {
      setupUpdateTreeWithDifferences: () => ({
        evalOrder: [],
        unEvalUpdates: [],
      }),
      evalAndValidateSubTree: () => ({ evalMetaUpdates: [] }),
      evalTree: {
        JSObject1: {
          var: {},
          var2: new Set([1, 2]),
          variables: ["var", "var2"],
          ENTITY_TYPE: "JSACTION",
        },
      },
    },
  };
});

describe("Mutation", () => {
  it("Global scope value mutation tracking", async () => {
    const dataTree = ({
      JSObject1: {
        var: {},
        var2: new Set([1, 2]),
        variables: ["var", "var2"],
        ENTITY_TYPE: ENTITY_TYPE.JSACTION,
      },
    } as unknown) as DataTree;

    JSObjectCollection.setVariableState((dataTree as unknown) as VariableState);

    const evalContext = createEvaluationContext({
      dataTree,
      isTriggerBased: true,
      skipEntityFunctions: true,
    });

    JSVariableUpdates.enableTracking();

    Object.assign(self, evalContext);

    eval(`
    JSObject1.var = {};
    JSObject1.var.b = {};
    JSObject1.var.b.a = [];
    JSObject1.var.b.a.push(2);
    JSObject1.var2.add(3);
    `);

    JSVariableUpdates.disableTracking();

    expect(JSVariableUpdates.getAll()).toEqual([
      { path: "JSObject1.var", method: "SET", value: { b: { a: [2] } } },
      { path: "JSObject1.var.b", method: "SET", value: { a: [2] } },
      { path: "JSObject1.var.b.a", method: "SET", value: [2] },
      {
        path: "JSObject1.var.b.a",
        method: "PROTOTYPE_METHOD_CALL",
        value: [].push,
      },
      {
        path: "JSObject1.var2",
        method: "PROTOTYPE_METHOD_CALL",
        value: new Set().add,
      },
    ]);

    const modifiedVariablesList = getUpdatedPaths(JSVariableUpdates.getAll());

    expect(modifiedVariablesList).toEqual([
      ["JSObject1", "var"],
      ["JSObject1", "var", "b"],
      ["JSObject1", "var", "b", "a"],
      ["JSObject1", "var", "b", "a"],
      ["JSObject1", "var2"],
    ]);
  });
});