/* global b, m, R */

const I = x => x;
const o = (f, g) => (...args) => f(g(...args));
const K = x => () => x;

const humanList = s => xs =>
  xs.length > 1
    ? xs.slice(0, -1).join(", ") +
      " " +
      s +
      " " +
      xs.slice(-1)
    : xs.join("");

const pipe = xs => xs.reduceRight(o, I);
const $ = {
  prop: k => f => o => Object.assign(o, { [k]: f(o[k]) }),
  get: lens => o => {
    var y;
    lens(x => (y = x))(o);
    return y;
  }
};

const $boxes = $.prop("boxes");
const $description = $.prop("description");
const $colors = $.prop("colors");

const Action = {
  addBox: x =>
    pipe([K(x), x => xs => xs.concat(x), $boxes]),
  removeBox: i => $boxes(xs => xs.filter((x, j) => i != j))
};

const view = update => state =>
  m(
    ".app" + b.d("grid").ff("Helvetica"),
    m(
      "nav.header" +
        b
          .d("flex")
          .jc("space-between")
          .ai("center")
          .bc("steelblue")
          .c("white")
          .p("1em"),

      m("h1" + b.m(0), "Boxes"),
      $.get($colors)(state).map(x =>
        m(
          "button" +
            b
              .bc(x)
              .c("white")
              .w("2em")
              .h("2em")
              .fs("2em")
              .m(0)
              .border("none"),
          { onclick: pipe([Action.addBox(x), update]) },
          "+"
        )
      )
    ),
    m("p", $.get($description)(state)),
    m(
      "" +
        b
          .d("grid")
          .gridTemplateColumns("repeat(3, 1fr)")
          .alignItems("center")
          .justifyItems("center")
          .padding("1em")
          .gridRowGap("1em")
          .maxHeight("14em")
          .overflowY("auto"),

      $.get($boxes)(state).map((x, i) =>
        m(
          "" +
            b
              .bc(x)
              .c("white")
              .w("4em")
              .h("4em"),
          {
            onclick: pipe([K(Action.removeBox(i)), update])
          }
        )
      )
    )
  );

const T = (x, f) => f(x);

const StatsService = {
  initial(state) {
    return state.colors
      .map(R.objOf)
      .map(K(0))
      .reduce(R.merge, {});
  },
  accept: R.pipe(
    x => x.boxes,
    R.countBy(I),
    R.assoc("stats")
  )
};

const LocalStorageService = {
  initial() {
    return [localStorage.getItem("v1")]
      .filter(Boolean)
      .map(JSON.parse)
      .concat({ boxes: [] })
      .shift();
  },
  service: ({ state }) => {
    T(
      state,
      R.pipe(
        R.pick(["boxes"]),
        x => localStorage.setItem("v1", JSON.stringify(x))
      )
    );
  }
};

const DescriptionService = {
  initial() {
    return {
      description: ""
    };
  },
  accept: R.pipe(
    x => x.stats,
    R.toPairs,
    R.groupBy(R.last),
    R.map(R.map(R.head)),
    R.map(humanList("and")),
    R.toPairs,
    R.map(R.join(" ")),
    humanList("and"),
    x => x + ".",
    R.assoc("description")
  )
};

const initial = [
  LocalStorageService.initial,
  StatsService.initial,
  DescriptionService.initial
];

const acceptors = [
  StatsService.accept,
  DescriptionService.accept
];

const services = [LocalStorageService.service];

const initialState = () => {
  const state = {
    boxes: [],
    colors: ["red", "purple", "blue"]
  };
  return Object.assign(
    {},
    state,
    initial.map(fn => fn(state)).reduce(R.merge, {})
  );
};

const accept = state =>
  acceptors.reduce(
    (updatedState, acceptor) =>
      T(updatedState, acceptor(updatedState)),
    state
  );

const update = m.stream();
const states = m.stream.scan(
  o(accept, T),
  accept(initialState()),
  update
);
const element = document.getElementById("app");
states.map(view(update)).map(v => m.render(element, v));

states.map(state =>
  services.forEach(service => service({ state, update }))
);