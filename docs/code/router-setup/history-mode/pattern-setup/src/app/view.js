import m from "mithril";

import { Home } from "../home";
import { Login } from "../login";
import { Settings } from "../settings";
import { Tea } from "../tea";
import { TeaSearch } from "../teaSearch";
import { NotFound } from "../notFound";
import { Link } from "../router/link";
import { selectors } from "../state";

const componentMap = {
  Home,
  Login,
  Settings,
  Tea,
  TeaDetails: Tea,
  TeaSearch,
  NotFound
};

export const App = {
  view: ({ attrs: { state, update, actions } }) => {
    const Component = componentMap[selectors.page(state)];
    const isActive = tab => (tab === Component ? ".active" : "");

    return m(
      "div",
      m(
        "nav.navbar.navbar-default",
        m(
          "ul.nav.navbar-nav",
          m("li" + isActive(Home), m(Link, { href: "/" }, "Home")),
          m("li" + isActive(Login), m(Link, { href: "/login" }, "Login")),
          m("li" + isActive(Settings), m(Link, { href: "/settings" }, "Settings")),
          m("li" + isActive(Tea), m(Link, { href: "/tea" }, "Tea")),
          m("li" + isActive(TeaSearch), m(Link, { href: "/tea/search" }, "Tea Search"))
        )
      ),
      m(Component, { state, update, actions }),

      /* Show or hide the Please Wait modal. See public/css/style.css */
      m(
        "div",
        {
          style: {
            visibility: state.loadTeas || state.loadSearchTeas ? "visible" : "hidden"
          }
        },
        m("div.simpleModal", m("div.simpleBox", m("div", "Loading, please wait...")))
      )
    );
  }
};
