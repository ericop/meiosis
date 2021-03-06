import m from "mithril";

import { selectors } from "../state";

export const Home = {
  view: ({ attrs: { state } }) =>
    m(
      "div",
      m("div", "Home Page"),
      state.user && m("div", "You are logged in as: ", state.user),
      selectors.params(state).message && m("div", selectors.params(state).message)
    )
};
