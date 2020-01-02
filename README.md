<div align="center">
  <h2>Javascript procedural text generator to make stories, bullshit generators and other pipotrons.</h2>
</div>

## 📦 Getting Started

```
npm install random-story
```

## usage

```js
import RandomStory from 'random-story';

const rs = new RandomStory();
rs.add({ domain: "start", label: "A sentence"});
rs.add({ domain: "start", label: "Another sentence with <alternatives>", weight: 1,
         condition: ({tags}) => tags.includes("allowalternative") && !tags.includes("cond2"),
         effect: (context) => {context.tags = (context.tags || []).concat(["add1", "!add2"])}});
rs.add({ domain: "start", label: "Another sentence without <alternatives>", weight: 0.5,
         condition: ({tags}) => !tags.includes("allowalternative"),
         effect: (context) => {context.tags = (context.tags || []).concat(["add1", "!add2"])}});
rs.add({ domain: "alternatives", label: "multiple alternatives"});
rs.add({ domain: "alternatives", label: "alternatives and $(substitute)", weight: 3, condition:({tags}) => !tags.includes("add1")};

rs.generate("<start>", {tags: ['allowalternative'], vars : {substitute: "variables"})) // Can generate "Another sentence with alternatives and variables"

...
```

## API

`.add({domain: token, label: label, [ weight=1 ], [ condition ], [ effect ])` Add a new alternative for the specified token. `condition` can be a function evaluated with context. If condition return `false` for current context, the alternative is disabled. `effect` if a function applied to the context that allow you modify it and control sub-token generation according to the new context. `vars` object in context are resolved with this values. `weight` is the appearance probablity. Default value is 1. `Weight` can also be a function that receive the context.

`.resolve([ start_label="<start>" ], [ initial context object ])` generate a new result by resolving reccursivelly all tokens.
