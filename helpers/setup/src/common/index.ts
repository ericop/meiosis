import { ActionsObject, Meiosis, MeiosisParams, ServiceParams, Stream } from "./types";

/**
 * Stream library. This works with `meiosis.simpleStream`, `flyd`, `m.stream`, or anything for
 * which you provide either a function or an object with a `stream` function to create a stream. The
 * function or object must also have a `scan` property. The returned stream must have a `map`
 * method.
 *
 * @typedef {Object|Function} StreamLib
 * @param {*} [value] - the stream's initial value.
 * @property {Function} stream - the function to create a stream, if the stream library itself is
 * not a function.
 * @property {Function} scan - the stream library's `scan` function.
 * @return {simpleStream} - the created stream.
 */

/**
 * Base helper to setup the Meiosis pattern. If you are using Mergerino, Function Patches, or Immer,
 * use their respective `setup` function instead.
 *
 * Patch is merged in to the state by default. Services have access to the state, previous state,
 * and patch, and can return a patch that further updates the state, reverts to the previous state,
 * and so on. State changes by services are available to the next services in the list.
 *
 * After the services have run and the state has been updated, effects are executed and have the
 * opportunity to trigger more updates.
 *
 * @async
 * @function meiosis.common.setup
 *
 * @param {StreamLib} stream - the stream library. This works with `meiosis.simpleStream`, `flyd`,
 * `m.stream`, or anything for which you provide either a function or an object with a `stream`
 * function to create a stream. The function or object must also have a `scan` property. The
 * returned stream must have a `map` method.
 * @param {Function} accumulator - the accumulator function.
 * @param {Function} combine - the function that combines an array of patches into one.
 * @param {app} app - the app, with optional properties.
 *
 * @returns {Object} - `{ update, states, actions }`, where `update` and `states` are streams, and
 * `actions` are the created actions.
 */
export default function <S, P>({
  stream,
  accumulator,
  combine,
  app: { initial, Actions = (): ActionsObject => ({}), services = [], effects = [] }
}: MeiosisParams<S, P>): Meiosis<S, P> {
  if (!stream) {
    throw new Error("No stream library was specified.");
  }
  if (!accumulator) {
    throw new Error("No accumulator function was specified.");
  }
  if (!combine) {
    throw new Error("No combine function was specified.");
  }

  const singlePatch = (patch: P): P => (Array.isArray(patch) ? combine(patch) : patch);
  const accumulatorFn = (state: S, patch?: P): S =>
    patch != null ? accumulator(state, singlePatch(patch)) : state;

  const createStream = typeof stream === "function" ? stream : stream.stream;
  const scan = stream.scan;

  const update: Stream<P> = createStream();
  const actions = Actions(update);
  const states: Stream<S> = createStream();

  // context is { state, patch, previousState }
  // state is optionally updated by service patches; patch and previousState never change.
  const runServices = (context: ServiceParams<S, P>): ServiceParams<S, P> => {
    const updatedContext = context;

    for (let i = 0; i < services.length; i++) {
      // a service should (optionally) return a patch
      const servicePatch: P | undefined = services[i](updatedContext);
      updatedContext.state = accumulatorFn(updatedContext.state, servicePatch);
    }
    return updatedContext;
  };

  const contexts = scan(
    (context, patch) =>
      runServices({
        previousState: context.state,
        state: accumulatorFn(context.state, patch),
        patch
      }),
    runServices({ state: initial }),
    update
  );

  contexts
    .map(context => {
      if (context.state !== states()) {
        states(context.state);
      }

      return Object.assign(context, {
        update,
        actions
      });
    })
    .map(context => {
      effects.forEach(effect => effect(context));
    });

  return { update, states, actions };
}
