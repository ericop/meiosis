/* Equivalent of this code, you can also npm install meiosis-router-setup */
/* See https://meiosis.js.org/router for details. */
import createRouteMatcher from "feather-route-matcher";
import { selectors } from "../state";

export const createRouter = routeConfig => {
  const prefix = "#!";

  const getPath = () => decodeURI(window.location.hash || prefix + "/").substring(prefix.length);

  const getRoute = createRouteMatcher(routeConfig);

  const initialRoute = getRoute(getPath());

  const start = onRouteChange => {
    window.onpopstate = () => onRouteChange(getRoute(getPath()));
  };

  const effect = state => {
    const path = selectors.url(state);

    if (path !== getPath()) {
      window.history.pushState({}, "", prefix + path);
    }
  };

  return { initialRoute, getRoute, start, effect };
};
