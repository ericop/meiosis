# [Meiosis](https://meiosis.js.org) Tutorial

[Table of Contents](toc.html)

## 04 - Patchinko

In the previous lesson, [04 - Streams](04-streams-mithril.html), we started setting up the
Meiosis pattern:

- an `update` stream of **patches**
- a `states` stream of states, obtained with `scan` on the `update` stream and applying
an **accumulator**
- an `actions` object created by passing `update` and having functions that call `update`
to trigger state changes
- a component that receives the latest `state` and the `actions`.

Our state had the following shape:

```js
{
  value: 0
}
```

Our patches were numbers such as `1` and `-1`, and our accumulator applied the patches to the
state by adding the number to `state.value`.

We are going to change our patches and accumulator function to be general-purpose, so that the
shape of our state can be much more flexible, and our actions can issue patches to make all sorts
of changes to the state.

### A Temperature Example

Let's build a temperature example with the following initial state:

```js
{
  value: 22,
  units: "C"
}
```

We can increase and decrease the value, as well as change the units betwen `C` (Celsius) and
`F` (Farenheit), converting the value in the process.

We need to:

- Decide the shape of our patches
- Write an accumulator function that will use those patches to produce the updated state.

In this section, we will use one approach - my personal favourite - using a library called
Patchinko. In a [later section](08-function-patches-mithril.html), we will look at another
approach, using function patches. The Meiosis pattern is flexible enough that you can use
either of these approaches or even one of your own.

### Introducing Patchinko

[Patchinko](https://github.com/barneycarroll/patchinko) is a brilliant utility that
[Barney Carroll](http://barneycarroll.com/) wrote in just 30-some lines of code. We will
use it to issue patches onto our `update` stream, and to produce the updated state from
our accumulator function.

Imagine that our patches are objects that describe how we want to update the state. If
we want to change the temperature value to 23, we would call:

```js
update({ value: 23 })
```

To change the units:

```js
update({ units: "F" })
```

To convert the value at the same time as changing the units:

```js
update({ value: 72, units: "F" })
```

How to we write an accumulator function that handles these object patches to update the
state?

Remember that the accumulator function gets the current state and the incoming patch as
parameters, and must return the updated state:

```js
function(state, patch) {
  return state;
}
```

Patchinko comes with a function, `P` (for "Patch") that takes a target object as its first
parameter, and patch objects in the remainder of the parameters. It patches the target object
by copying over the properties from the patch objects onto the target object:

```javascript
P({ value: 22, units: "C" }, { value: 23 })
// result:
{ value: 23, units: "C" }

P({ value: 23, units: "C" }, { comfortable: true })
// result:
{ value: 23, units: "C", comfortable: true }
```

If you find that this looks like `Object.assign`, you are correct: `P` does the equivalent.
However, `P` has more capabilities when combined with Patchinko's other functions:
`S`, `PS`, and `D`.

### Patching based on the current value: `S`

Within a patch, you can include calls to other Patchinko functions. One of those is `S` (Scope).
`S` allows us to use the current value of the target object to determine the updated value.

We pass a **function** to `S()`. Patchinko passes the value of that property to the function, and
assigns the function's return value back to that property.

This makes it easy for us to update a value using the previous value. For example, say that
we want to increment the temperature value by 1. We need the previous value to compute the updated
value. We can pass a function to `S()`:

```js
P({ value: 22, units: "C" }, { value: S(x => x + 1) }) // The function receives 22
// result:
{ value: 23, units: "C" }
```

> Note that `x => x + 1` is ES6 syntax that is short for
```js
function(x) {
  return + 1;
}
```

By passing `S()` for the `value` property, Patchinko passes the previous value of that property
to the function that we indicate in our call to `S()`. Our function receives `22`, adds `1` and
returns `23`, which Patchinko assigns back to the `value` property.

### Deep Patching: `PS`

When we pass plain objects to `P`, it acts like `Object.assign` and does a _shallow_ merge.
If our target object is:

```javascript
{ air:   { value: 22, units: "C" },
  water: { value: 84, units: "F" }
}
```

And we want to change the `air` `value` to `25` by calling:

```javascript
P(
  { air:   { value: 22, units: "C" },
    water: { value: 84, units: "F" }
  },
  { air:   { value: 25 } }
)
```

We get this result:

```js
{ air:   { value: 25 },
  water: { value: 84, units: 'F' }
}
```

We lost the `units`! This is because properties are merged only at the first level, just like
with `Object.assign`. Beyond that, properties are overwritten.

This is where Patchinko's `PS()` function comes in.

To use it, we call `PS` with a single object. This is the equivalent of `P` _for that property_.
We can merge properties deeper than the first level without losing the rest:

```javascript
P(
  { air:   { value: 22, units: "C" },
    water: { value: 84, units: "F" }
  },
  { air: PS({ value: 25 }) } // notice PS() here
)
// result:
{ air:   { value: 25, units: "C" }, // now we didn't lose the units!
  water: { value: 84, units: "F" }
}
```

By having `{ air: PS({ value: 25 }) }`, Patchinko does `P(target.air, { value: 25 })` and assigns
the result back to the `air` property. The equivalent with `Object.assign` would be:

```javascript
const target =
  { air:   { value: 22, units: "C" },
    water: { value: 84, units: "F" }
  };

Object.assign(target, { air: Object.assign(target.air, { value: 25 }) })
```

But of course in a more concise manner. Moreover, we can use `PS()` in this fashion for any
number of levels deep within our objects.

`PS` and `S` can also be used together:

```javascript
P(
  { air:   { value: 22, units: "C" },
    water: { value: 84, units: "F" }
  },
  { air:  PS({ value: S(x => x + 8) }) } // PS to merge air, S to update value
)
// result:
{ air:   { value: 30, units: "C" }, // we increased the value by 8, and didn't lose the units
  water: { value: 84, units: "F" }
}
```

### Deleting a property: `D`

Finally, Patchinko provides `D` to delete a property. To use it, we just have to specify `D`
as the value for the property that we wish to delete:

```js
P(
  { air:   { value: 22, units: "C" },
    water: { value: 84, units: "F" }
  },
  { air:  D }
)
// result:
{ water: { value: 84, units: "F" } }
```

Note that if we want to delete a property past the first level, we still need to use `PS`:

```js
P(
  { air:   { value: 22, units: "C" },
    water: { value: 84, units: "F" }
  },
  { air: PS({ value: D }) }
)
// result:
{ air:   { units: "C" },
  water: { value: 84, units: "F" }
}
```

Try it out. Using the code window below, try the following exercises. Use `console.log` to
verify your answers.

@flems code/04-patchinko-01.js patchinko 550

### Exercises

1. Change `water` to `{ value: 84, units: "F" }`
1. Toggle the `comfortable` property with a function that changes the value to the
opposite of what it was
1. Change the `air` value to `20` without losing the units
1. Delete the `invalid` property.

### Solution

@flems code/04-patchinko-01-solution.js patchinko 800 hidden

### Alternative: Using the Overloaded version of Patchinko

We are using the
[explicit](https://github.com/barneycarroll/patchinko#explicit) version of Patchinko, which
provides `P`, `S`, `PS`, and `D`.

If you prefer, you can also use the
[overloaded](https://github.com/barneycarroll/patchinko#overloaded) version, which provides
a single function, `O`, that uses what you pass to the function to determine whether to do the
equivalent of `P`, `S`, `PS`, or `D`.

In a nutshell:

- With multiple arguments: `O(target, patch)`, does the same as `P`
- With a single **function** argument: `O(x => y)` does the same as `S`
- With a single **object** argument:`O({..})` does the same as `PS`
- With no arguments, as the value of a property: `O` does the same as `D`.

When you are ready, continue on to [06 - Components](06-components-mithril.html).

[Table of Contents](toc.html)

-----

[Meiosis](https://meiosis.js.org) is developed by [@foxdonut00](http://twitter.com/foxdonut00) / [foxdonut](https://github.com/foxdonut) and is released under the MIT license.