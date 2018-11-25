import RandomStory from "../RandomStory";

it("Instanciate without crashing", () => {
  new RandomStory();
});

it("I can add a new value", () => {
  const rs = new RandomStory();
  rs.add("start", "test");

  expect(rs.domains.start).toEqual([
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
  const rs = new RandomStory();

  rs.add("start", "test");
  expect(rs.total_weight(rs.domains["start"])).toBeCloseTo(1);

  rs.add("start", "end");
  expect(rs.total_weight(rs.domains["start"])).toBeCloseTo(2);

  rs.add("start", "top", 0.2);
  expect(rs.total_weight(rs.domains["start"])).toBeCloseTo(2.2);

  rs.add("start", "28", 0.8, ["condition"]);
  rs.add("start", "42", 0.6, ["!condition"]);

  expect(rs.total_weight(rs.domains["start"], [])).toBeCloseTo(2.8);
  expect(rs.total_weight(rs.domains["start"], ["condition"])).toBeCloseTo(3.0);
  expect(rs.total_weight(rs.domains["start"], ["!condition"])).toBeCloseTo(2.8);
});

it("Weighted_pick is working", () => {
  const rs = new RandomStory();
  rs.add("start", "test");
  rs.add("start", "end");
  rs.add("start", "28", 0.8, ["condition"]);
  rs.add("start", "42", 0.6, ["!condition"]);

  rs.rand = jest.fn(() => 0.00001);
  expect(rs.weighted_pick(rs.domains["start"]).label).toBe("test");
  rs.rand = jest.fn(() => 0.99999);
  expect(rs.weighted_pick(rs.domains["start"]).label).toBe("test");

  rs.rand = jest.fn(() => 1.999999);
  expect(rs.weighted_pick(rs.domains["start"]).label).toBe("end");
  rs.rand = jest.fn(() => 1.00001);
  expect(rs.weighted_pick(rs.domains["start"]).label).toBe("end");
  expect(rs.weighted_pick(rs.domains["start"], []).label).toBe("end");

  rs.rand = jest.fn(() => 2.00001);
  expect(rs.weighted_pick(rs.domains["start"], ["condition"]).label).toBe("28");
  rs.rand = jest.fn(() => 2.79999);
  expect(rs.weighted_pick(rs.domains["start"], ["condition"]).label).toBe("28");
  rs.rand = jest.fn(() => 2.5999999);
  expect(rs.weighted_pick(rs.domains["start"], ["!condition"]).label).toBe(
    "42"
  );
});

it("It generate something simple", () => {
  const rs = new RandomStory();
  rs.add("start", "test");
  rs.add("start", "<toto>pouet");
  rs.add("toto", "pouet");
  rs.add("toto", "pit");

  rs.rand = jest.fn(() => 0.5);
  expect(rs.resolve()).toBe("test");

  rs.rand = jest.fn(() => 1.5);
  expect(rs.resolve()).toBe("pitpouet");
});

it("And something hard with condition and context addition", () => {
  const rs = new RandomStory();
  rs.add("start", "test");
  rs.add("start", "<toto>pouet", 1, ["cond1", "!cond2"], ["add1", "!add2"]);
  rs.add("toto", "pouet");
  rs.add("toto", "pit", 1, ["add1"]);

  rs.rand = jest.fn((min, max) => max - 0.001);
  expect(rs.resolve("<start>", ["cond1"])).toBe("pitpouet");
});

it("And use vars", () => {
  const rs = new RandomStory();
  rs.add("start", "test");
  rs.add("start", "<toto>pouet", 1, ["cond1", "!cond2"], ["add1", "!add2"]);
  rs.add("toto", "pouet");
  rs.add("toto", "pit$(titi)", 1, ["add1"]);

  rs.rand = jest.fn((min, max) => max - 0.001);
  expect(rs.resolve("<start>", ["cond1"], { titi: "hihi" })).toBe(
    "pithihipouet"
  );
});
