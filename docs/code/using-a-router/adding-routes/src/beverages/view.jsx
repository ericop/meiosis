import React from "react";

import { Route, siblingRoute } from "routing-common/src/routes";

export const Beverages = ({ state, actions, route, beveragesId }) =>
  state[beveragesId] && (
    <ul>
      {state[beveragesId].map(beverage => (
        <li key={beverage.id}>
          <a
            href="javascript://"
            onClick={() =>
              actions.navigateTo(siblingRoute(route, [Route.Beverage({ id: beverage.id })]))
            }
          >
            {beverage.title}
          </a>
        </li>
      ))}
    </ul>
  );
