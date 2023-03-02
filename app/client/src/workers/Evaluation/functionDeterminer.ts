import { addDataTreeToContext } from "@appsmith/workers/Evaluation/Actions";
import { EvalContext } from "./evaluate";
import { DataTree } from "entities/DataTree/dataTreeFactory";
import JSVariableUpdates from "./JSObject/JSVariableUpdates";
import userLogs from "./fns/overrides/console";

class FunctionDeterminer {
  private evalContext: EvalContext = {};

  setupEval(dataTree: DataTree) {
    /**** Setting the eval context ****/
    const evalContext: EvalContext = {
      $isDataField: true,
      $isAsync: false,
    };

    JSVariableUpdates.disableTracking();

    addDataTreeToContext({
      dataTree,
      EVAL_CONTEXT: evalContext,
      isTriggerBased: true,
      enableJSObjectFactory: false,
    });

    // Set it to self so that the eval function can have access to it
    // as global data. This is what enables access all appsmith
    // entity properties from the global context
    Object.assign(self, evalContext);

    this.evalContext = evalContext;
    userLogs.disable();
  }

  close() {
    userLogs.enable();
    JSVariableUpdates.enableTracking();
    for (const entityName in this.evalContext) {
      if (this.evalContext.hasOwnProperty(entityName)) {
        // @ts-expect-error: Types are not available
        delete self[entityName];
      }
    }
  }

  isFunctionAsync(userFunction: unknown, logs: unknown[] = []) {
    self["$isDataField"] = true;
    self["$isAsync"] = false;

    return (function() {
      try {
        if (typeof userFunction === "function") {
          if (userFunction.constructor.name === "AsyncFunction") {
            // functions declared with an async keyword
            self["$isAsync"] = true;
          } else {
            const returnValue = userFunction();
            if (!!returnValue && returnValue instanceof Promise) {
              self["$isAsync"] = true;
            }
          }
        }
      } catch (e) {
        // We do not want to throw errors for internal operations, to users.
        // logLevel should help us in debugging this.
        logs.push({ error: "Error when determining async function " + e });
      }
      const isAsync = !!self["$isAsync"];

      return isAsync;
    })();
  }
}

export const functionDeterminer = new FunctionDeterminer();
