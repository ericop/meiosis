import { Meiosis } from "../common/types";
import commonSetup from "../common";

export type PatchFunction<S> = (state: S) => S;

const pipe = <S>(fns: PatchFunction<S>[]): PatchFunction<S> => (state: S): S =>
  fns.reduce((arg, fn) => fn(arg), state);

/**
 * Helper to setup the Meiosis pattern with function patches.
 *
 * @async
 * @function meiosis.functionPatches.setup
 *
 * @param {StreamLib} stream - the stream library. This works with `meiosis.simpleStream`, `flyd`,
 * `m.stream`, or anything for which you provide either a function or an object with a `stream`
 * function to create a stream. The function or object must also have a `scan` property.
 * The returned stream must have a `map` method.
 * @param {app} app - the app, with optional properties.
 *
 * @returns {Object} - `{ update, states, actions }`, where `update` and `states` are streams,
 * and `actions` are the created actions.
 */
export default <S>({ stream, app }): Meiosis<S, PatchFunction<S>> =>
  commonSetup({
    stream,
    accumulator: (x: S, fn: PatchFunction<S>) => fn(x),
    combine: pipe,
    app
  });
