import { App, Meiosis, StreamLib } from "../common/types";
import commonSetup from "../common";

export type Produce<S, P> = (state: S, patch: P) => S;

export interface ImmerMeiosis<S, P> {
  stream: StreamLib;
  produce: Produce<S, P>;
  app: App<S, P>;
}

/**
 * Helper to setup the Meiosis pattern with [Immer](https://github.com/immerjs/immer).
 *
 * @async
 * @function meiosis.immer.setup
 *
 * @param {StreamLib} stream - the stream library. This works with `meiosis.simpleStream`, `flyd`,
 * `m.stream`, or anything for which you provide either a function or an object with a `stream`
 * function to create a stream. The function or object must also have a `scan` property.
 * The returned stream must have a `map` method.
 * @param {Function} produce - the Immer `produce` function.
 * @param {app} app - the app, with optional properties.
 *
 * @returns {Object} - `{ update, states, actions }`, where `update` and `states` are streams,
 * and `actions` are the created actions.
 */
export default <S, P>({ stream, produce, app }: ImmerMeiosis<S, P>): Meiosis<S, P> =>
  commonSetup({
    stream,
    accumulator: produce,
    // can't use patches.reduce(produce, state) because that would send a third argument to produce
    combine: (patches: P[]) =>
      (((state: S): S =>
        patches.reduce((result, patch) => produce(result, patch), state)) as unknown) as P,
    app
  });
