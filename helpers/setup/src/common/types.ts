export type MapFunction<T, U> = (value: T) => U;

export interface Stream<T> {
  (value?: T): T | undefined;
  map<U>(fn: MapFunction<T, U>): Stream<U>;
}

export type Accumulator<T, U> = (acc: U, value: T) => U;

export type Scan = <T, U>(
  accumulator: Accumulator<T, U>,
  initial: U,
  sourceStream: Stream<T>
) => Stream<U>;

export interface StreamLib {
  stream: <T>(value?: T) => Stream<T>;
  scan: Scan;
}

export type ActionsObject = {
  [key: string]: Function;
};

export interface ServiceParams<S, P> {
  state: S;
  previousState?: S;
  patch?: P;
}

export type Service<S, P> = (params: ServiceParams<S, P>) => P | undefined;

export interface EffectParams<S, P> extends ServiceParams<S, P> {
  update: Stream<P>;
  actions: ActionsObject;
}

export type Effect<S, P> = (params: EffectParams<S, P>) => void;

/**
 * Application object.
 *
 * @typedef {Object} app
 * @property {Object} [initial={}] - an object that represents the initial state.
 * If not specified, the initial state will be `{}`.
 * @property {Function} [Actions=()=>({})] - a function that creates actions, of the form
 * `update => actions`.
 * @property {Array<Function>} [services=[]] - an array of service functions, each of which
 * should be `({ state, previousState, patch }) => patch?`.
 * @property {Array<Function>} [effects=[]] - an array of effect functions, each of which
 * should be `({ state, previousState, patch, update, actions }) => void`, with the function
 * optionally calling `update` and/or `actions`.
 */
export interface App<S, P> {
  initial: S;
  Actions?: (update: Stream<P>) => ActionsObject;
  services?: Service<S, P>[];
  effects?: Effect<S, P>[];
}

export interface MeiosisParams<S, P> {
  stream: StreamLib;
  accumulator: Accumulator<P, S>;
  combine: (arr: P[]) => P;
  app: App<S, P>;
}

export interface Meiosis<S, P> {
  update: Stream<P>;
  states: Stream<S>;
  actions: ActionsObject;
}
