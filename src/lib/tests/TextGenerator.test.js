import TextGenerator from "../TextGenerator";

it("Instanciate without crashing", () => {
  new TextGenerator();
});

it("I can add a new value", () => {
  const tg = new TextGenerator();
  tg.add("start", "test");

  expect(tg.domains.start).toEqual([
    {
      additions: [],
      conditions: [],
      label: "test",
      vars: {},
      weight: 1
    }
  ]);
});

it("Total weigth is working well", () => {
  const tg = new TextGenerator();

  tg.add("start", "test");
  expect(tg.total_weight(tg.domains["start"])).toBeCloseTo(1);

  tg.add("start", "end");
  expect(tg.total_weight(tg.domains["start"])).toBeCloseTo(2);

  tg.add("start", "top", 0.2);
  expect(tg.total_weight(tg.domains["start"])).toBeCloseTo(2.2);

  tg.add("start", "28", 0.8, ["condition"]);
  tg.add("start", "42", 0.6, ["!condition"]);

  expect(tg.total_weight(tg.domains["start"], [])).toBeCloseTo(2.8);
  expect(tg.total_weight(tg.domains["start"], ["condition"])).toBeCloseTo(3.0);
  expect(tg.total_weight(tg.domains["start"], ["!condition"])).toBeCloseTo(2.8);
});

it("Weighted_pick is working", () => {
  const tg = new TextGenerator();
  tg.add("start", "test");
  tg.add("start", "end");
  tg.add("start", "28", 0.8, ["condition"]);
  tg.add("start", "42", 0.6, ["!condition"]);

  tg.rand = jest.fn(() => 0.00001);
  expect(tg.weighted_pick(tg.domains["start"]).label).toBe("test");
  tg.rand = jest.fn(() => 0.99999);
  expect(tg.weighted_pick(tg.domains["start"]).label).toBe("test");

  tg.rand = jest.fn(() => 1.999999);
  expect(tg.weighted_pick(tg.domains["start"]).label).toBe("end");
  tg.rand = jest.fn(() => 1.00001);
  expect(tg.weighted_pick(tg.domains["start"]).label).toBe("end");
  expect(tg.weighted_pick(tg.domains["start"], []).label).toBe("end");

  tg.rand = jest.fn(() => 2.00001);
  expect(tg.weighted_pick(tg.domains["start"], ["condition"]).label).toBe("28");
  tg.rand = jest.fn(() => 2.79999);
  expect(tg.weighted_pick(tg.domains["start"], ["condition"]).label).toBe("28");
  tg.rand = jest.fn(() => 2.5999999);
  expect(tg.weighted_pick(tg.domains["start"], ["!condition"]).label).toBe(
    "42"
  );
});

it("It generate something simple", () => {
  const tg = new TextGenerator();
  tg.add("start", "test");
  tg.add("start", "<toto>pouet");
  tg.add("toto", "pouet");
  tg.add("toto", "pit");

  tg.rand = jest.fn(() => 0.5);
  expect(tg.resolve()).toBe("test");

  tg.rand = jest.fn(() => 1.5);
  expect(tg.resolve()).toBe("pitpouet");
});

it("And something hard with condition and context addition", () => {
  const tg = new TextGenerator();
  tg.add("start", "test");
  tg.add("start", "<toto>pouet", 1, ["cond1", "!cond2"], ["add1", "!add2"]);
  tg.add("toto", "pouet");
  tg.add("toto", "pit", 1, ["add1"]);

  tg.rand = jest.fn((min, max) => max - 0.001);
  expect(tg.resolve("<start>", ["cond1"])).toBe("pitpouet");
});

it("And use vars", () => {
  const tg = new TextGenerator();
  tg.add("start", "test");
  tg.add("start", "<toto>pouet", 1, ["cond1", "!cond2"], ["add1", "!add2"]);
  tg.add("toto", "pouet");
  tg.add("toto", "pit$(titi)", 1, ["add1"]);

  tg.rand = jest.fn((min, max) => max - 0.001);
  expect(tg.resolve("<start>", ["cond1"], { titi: "hihi" })).toBe(
    "pithihipouet"
  );
});
