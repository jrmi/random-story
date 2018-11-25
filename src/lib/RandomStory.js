class RandomStory {
  constructor() {
    this.domains = {};
  }

  rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  add(domain, label, weight, conditions, contextAddition, vars) {
    weight = weight || 1;
    conditions = conditions || [];
    contextAddition = contextAddition || [];
    vars = vars || {};

    if (!this.domains[domain]) {
      this.domains[domain] = [];
    }

    this.domains[domain].push({
      label,
      weight,
      conditions,
      additions: contextAddition,
      vars
    });
  }

  valid_in_context(conditions, context) {
    for (let cond of conditions) {
      if (cond[0] === "!") {
        if (context.includes(cond.slice(1))) {
          return false;
        }
      } else {
        if (!context.includes(cond)) {
          return false;
        }
      }
    }
    return true;
  }

  total_weight(domain, context) {
    return domain.reduce((prev, cur, i, arr) => {
      if (this.valid_in_context(cur.conditions, context)) {
        return prev + cur.weight;
      } else {
        return prev;
      }
    }, 0);
  }

  weighted_pick(domain, context) {
    context = context || [];

    // Pick an element from
    const random_num = this.rand(0, this.total_weight(domain, context));
    let weight_sum = 0;

    for (let elt of domain) {
      if (this.valid_in_context(elt.conditions, context)) {
        weight_sum += elt.weight;

        if (random_num <= weight_sum) {
          return elt;
        }
      }
    }
  }

  resolve(sentence, context, vars, level) {
    // Resolve sentence by replacing each part by random one
    sentence = sentence || "<start>";
    context = context || [];
    vars = vars || {};
    level = level || 0;

    let result = sentence.replace(/\<([^\}]*)\>/g, (match, name) => {
      if (this.domains[name]) {
        const part = this.weighted_pick(this.domains[name], context);

        if (part) {
          let label;
          if (typeof part.label === "function") {
            label = part.label(context);
          } else {
            ({ label } = part);
          }
          Object.assign(vars, part.vars);

          return this.resolve(
            label,
            context.concat(part.additions),
            vars,
            level + 1
          );
        } else {
          return "---";
        }
      } else {
        return "...";
      }
    });

    if (level === 0) {
      result = result.replace(/\$\(([^ \)]*)\)/g, function(match, name) {
        if (vars[name] != null) {
          return vars[name];
        } else {
          return "...";
        }
      });
    }

    return result;
  }
}

export default RandomStory;
