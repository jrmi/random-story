 <div align="center">
 <img align="center" width="180" src="https://franciscohodge.com/project-pages/js-library-boilerplate/images/JSLibraryBoilerplate.png" />
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
rs.add("start", "A sentence");
rs.add("start", "Another sentence with <alternatives>", 1, ["allowalternative", "!cond2"], ["add1", "!add2"]);
rs.add("start", "Another sentence without <alternatives>", 1, ["!allowalternative"], ["add1", "!add2"]);
rs.add("alternatives", "multiple alternatives");
rs.add("alternatives", "alternatives and $(vars)", 1, ["add1"]);

rs.generate("<start>", ['allowalternative'], {vars: "variables"}) # Can generate "Another sentence with alternatives and variables"

...
```

## API

`.add(token, label, [ weight=1 ], [ conditionnal_tag_list=[] ], [ tag_addition_list=[] ], [ variables={} ])` Add a new alternative for the specified token. Conditionnal_tag_list can be a list of tags. If any tag is missing, the alternative is disabled. You can reverse the logic by adding a `!` in front of the tag. Tag_addition_list allow you to add tag to control sub-token generation. Variables are added S

`.generate([ start_label="<start>" ], [ initial_condition_list=[] ], [ initial_vars={} ])` generate a new result by resolving reccursivelly all tokens.