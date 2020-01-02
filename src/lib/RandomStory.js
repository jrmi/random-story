class RandomStory {
  constructor() {
    this.domains = {};
  }

  deepcopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  addOld(domain, label, weight, conditions, contextAddition) {
    this.add({
      domain,
      label,
      weight,
      condition: conditions,
      effect: contextAddition
    });
  }

  add({
    domain,
    label,
    weight = 1,
    condition = () => true,
    effect = () => {}
  }) {
    if (typeof label !== 'function') {
      // Replace fixed label by function
      const prev_label = label;
      label = context => prev_label;
    }

    if (typeof weight !== 'function') {
      // Replace fixed weight by function
      const prev_weight = weight;
      weight = context => prev_weight;
    }

    if (Array.isArray(condition)) {
      // Replace condition array by function
      const array_condition = condition;

      condition = context => {
        const { tags = [] } = context;
        for (let cond of array_condition) {
          if (cond[0] === '!') {
            if (tags.includes(cond.slice(1))) {
              return false;
            }
          } else {
            if (!tags.includes(cond)) {
              return false;
            }
          }
        }
        return true;
      };
    }

    if (Array.isArray(effect)) {
      const array_effect = effect;
      // Replace array effect by function
      effect = context => {
        context.tags = context.tags.concat(array_effect);
      };
    }

    if (!this.domains[domain]) {
      this.domains[domain] = [];
    }

    this.domains[domain].push({
      label,
      weight,
      condition,
      effect
    });
  }

  totalWeight(domain, context) {
    // Compute total weight for that domain for current context
    return domain.reduce((prev, cur) => {
      if (cur.condition(context)) {
        return prev + cur.weight(context);
      } else {
        return prev;
      }
    }, 0);
  }

  weightedPick(domain, context = { tags: [] }) {
    // Pick an element from domain

    const random_num = this.rand(0, this.totalWeight(domain, context));
    let weight_sum = 0;

    for (let elt of domain) {
      if (elt.condition(context)) {
        weight_sum += elt.weight(context);
        if (random_num <= weight_sum) {
          return elt;
        }
      }
    }
  }

  resolve(sentence = '<start>', context = { tags: [] }, level = 0) {
    // Resolve sentence by replacing each part by randomly selected one

    let result = sentence.replace(/<([^}]*)>/g, (match, name) => {
      if (this.domains[name]) {
        const part = this.weightedPick(this.domains[name], context);

        if (part) {
          const label = part.label(context);

          // Deep copy context to avoid side effects
          const newContext = this.deepcopy(context);
          part.effect(newContext);

          return this.resolve(label, newContext, level + 1);
        } else {
          return '---';
        }
      } else {
        return '...';
      }
    });

    if (level === 0) {
      // resolve variables
      const { vars = {} } = context;
      result = result.replace(/\$\(([^ )]*)\)/g, (match, name) => {
        return vars[name] || '...';
      });
    }

    return result;
  }
}

export default RandomStory;
