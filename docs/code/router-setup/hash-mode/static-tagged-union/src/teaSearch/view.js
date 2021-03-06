import m from "mithril";

import { fold } from "static-tagged-union";

import { Route, router } from "../router";

const types = ["Black", "Green", "Herbal", "Oolong"];

export const TeaSearch = () => ({
  view: ({ attrs: { state } }) =>
    fold({
      TeaSearch: ({ queryParams }) => [
        m("h3", "Tea Search Page"),
        m(
          ".row",
          m(
            ".col-md-6",
            state.searchTeas && [
              m(
                "div",
                types.map(type => [
                  m(
                    "a",
                    {
                      style: { marginRight: "10px" },
                      href: router.toPath(Route.TeaSearch({ queryParams: { type } }))
                    },
                    type
                  )
                ]),
                m("a", { href: router.toPath(Route.TeaSearch()) }, "All")
              ),
              m(
                "table.table.table-bordered.table-striped",
                m("thead", m("tr", m("th", "Type"), m("th", "Description"))),
                m(
                  "tbody",
                  state.searchTeas
                    .filter(tea => !queryParams.type || tea.type === queryParams.type)
                    .map(tea =>
                      m("tr", { key: tea.id }, m("td", tea.type), m("td", tea.description))
                    )
                )
              )
            ]
          )
        )
      ]
    })(state.route)
});
