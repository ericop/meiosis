import { teas } from "../teaDetails/data";

export const effect = ({ state, update }) => {
  if (state.routeTransition.arrive.Tea) {
    setTimeout(() => {
      update({ teas });
    }, 500);
  }
};
