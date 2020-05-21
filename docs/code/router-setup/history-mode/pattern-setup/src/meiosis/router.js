/* Equivalent of this code, you can also npm install meiosis-router-setup */
/* See https://meiosis.js.org/router for details. */
import createRouteMatcher from "feather-route-matcher";

export const createRouter = routeConfig => {
  const prefix = window.location.pathname;

  const getPath = () => decodeURI(window.location.pathname).substring(prefix.length) || "/";

  const routeMatcher = createRouteMatcher(routeConfig);

  const initialRoute = routeMatcher(getPath());

  const toUrl = path => prefix + path;

  const getLinkHandler = url => evt => {
    evt.preventDefault();
    window.history.pushState({}, "", url);
    window.onpopstate();
  };

  const start = ({ onRouteChange }) => {
    window.onpopstate = () => onRouteChange(routeMatcher(getPath()));
  };

  const locationBarSync = route => {
    const path = route.url;

    if (getPath() !== path) {
      window.history.pushState({}, "", prefix + path);
    }
  };

  const effect = state => {
    locationBarSync(state.route);
  };

  return { initialRoute, routeMatcher, toUrl, getLinkHandler, start, locationBarSync, effect };
};
