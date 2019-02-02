import React, { Component } from "react";

import { dropRepeats } from "../util";
import { toPath } from "../util/router";

const coffees = [
  { id: "c1", title: "Coffee 1", description: "Description of Coffee 1" },
  { id: "c2", title: "Coffee 2", description: "Description of Coffee 2" }
];

const coffeeMap = coffees.reduce((result, next) => {
  result[next.id] = next;
  return result;
}, {});

export const coffee = {
  service: (states, update) => {
    dropRepeats(states, ["navigateTo"]).map(state => {
      if (state.navigateTo.id === "Coffee") {
        setTimeout(() => update({ coffees, route: state.navigateTo }), 500);
      }
      else if (state.navigateTo.id === "CoffeeDetails") {
        const id = state.navigateTo.values.id;
        const coffee = coffeeMap[id].description;

        update({ coffee, route: state.navigateTo });
      }
    });
  }
};

export class Coffee extends Component {
  render() {
    const { state } = this.props;

    return (
      <div>
        <p>Coffee Page</p>
        <ul>
          {state.coffees && state.coffees.map(coffee =>
            <li key={coffee.id}>
              <a href={toPath({ id: "CoffeeDetails", values: { id: coffee.id } })}
              >{coffee.title}</a>
            </li>
          )}
        </ul>
        {state.coffee}
      </div>
    );
  }
}
