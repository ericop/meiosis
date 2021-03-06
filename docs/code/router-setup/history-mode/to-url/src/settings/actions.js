import { Route, router } from "../router";

export const Actions = update => ({
  logout: () =>
    update({
      user: null,
      route: () =>
        router.getRoute(Route.Home, { queryParams: { message: "You have been logged out." } })
    })
});
