import RandomStory from '../RandomStory';

it('Instanciate without crashing', () => {
  new RandomStory();
});

it('I can add a new value', () => {
  const rs = new RandomStory();
  rs.add({ domain: 'start', label: 'test' });

  expect(rs.domains.start.length).toEqual(1);
});

it('Is total weight working ?', () => {
  const rs = new RandomStory();

  rs.add({ domain: 'start', label: 'test' });
  expect(rs.totalWeight(rs.domains['start'])).toBeCloseTo(1);

  rs.add({ domain: 'start', label: 'end' });
  expect(rs.totalWeight(rs.domains['start'])).toBeCloseTo(2);

  rs.add({ domain: 'start', label: 'top', weight: 0.2 });
  expect(rs.totalWeight(rs.domains['start'])).toBeCloseTo(2.2);

  rs.add({
    domain: 'start',
    label: '28',
    weight: 0.8,
    condition: ['condition']
  });
  rs.add({
    domain: 'start',
    label: '42',
    weight: 0.6,
    condition: ['!condition']
  });

  expect(rs.totalWeight(rs.domains['start'], { tags: [] })).toBeCloseTo(2.8);
  expect(
    rs.totalWeight(rs.domains['start'], { tags: ['condition'] })
  ).toBeCloseTo(3.0);
  expect(
    rs.totalWeight(rs.domains['start'], { tags: ['!condition'] })
  ).toBeCloseTo(2.8);
});

it('is weightedPick working ?', () => {
  const rs = new RandomStory();
  rs.add({ domain: 'start', label: 'test' });
  rs.add({ domain: 'start', label: 'end' });
  rs.add({
    domain: 'start',
    label: '28',
    weight: 0.8,
    condition: ['condition']
  });
  rs.add({
    domain: 'start',
    label: '42',
    weight: 0.6,
    condition: ['!condition']
  });

  rs.rand = jest.fn(() => 0.00001);
  expect(rs.weightedPick(rs.domains['start']).label({})).toBe('test');
  rs.rand = jest.fn(() => 0.99999);
  expect(rs.weightedPick(rs.domains['start']).label({})).toBe('test');

  rs.rand = jest.fn(() => 1.999999);
  expect(rs.weightedPick(rs.domains['start']).label()).toBe('end');
  rs.rand = jest.fn(() => 1.00001);
  expect(rs.weightedPick(rs.domains['start']).label()).toBe('end');
  expect(rs.weightedPick(rs.domains['start'], { tags: [] }).label()).toBe(
    'end'
  );

  rs.rand = jest.fn(() => 2.00001);
  expect(
    rs.weightedPick(rs.domains['start'], { tags: ['condition'] }).label()
  ).toBe('28');
  rs.rand = jest.fn(() => 2.79999);
  expect(
    rs.weightedPick(rs.domains['start'], { tags: ['condition'] }).label()
  ).toBe('28');
  rs.rand = jest.fn(() => 2.5999999);
  expect(
    rs.weightedPick(rs.domains['start'], { tags: ['!condition'] }).label()
  ).toBe('42');
});

it('It generate something very simple', () => {
  const rs = new RandomStory();
  rs.add({ domain: 'newDom', label: 'test' });
  expect(rs.resolve('<newDom>')).toBe('test');
});

it('It generate something very simple', () => {
  const rs = new RandomStory();
  rs.add({ domain: 'newDom', label: '<test1><test2>' });
  rs.add({ domain: 'test1', label: 'test1' });
  rs.add({ domain: 'test2', label: 'test2' });
  expect(rs.resolve('<newDom>')).toBe('test1test2');
});

it('It generate something simple', () => {
  const rs = new RandomStory();
  rs.add({ domain: 'start', label: 'test' });
  rs.add({ domain: 'start', label: '<toto>pouet' });
  rs.add({ domain: 'toto', label: 'pouet' });
  rs.add({ domain: 'toto', label: 'pit' });

  rs.rand = jest.fn(() => 0.5);
  expect(rs.resolve()).toBe('test');

  rs.rand = jest.fn(() => 1.5);
  expect(rs.resolve()).toBe('pitpouet');
});

it('And something hard with condition and context addition', () => {
  const rs = new RandomStory();
  rs.add({ domain: 'start', label: 'test' });
  rs.add({
    domain: 'start',
    label: '<toto>pouet',
    weight: 1,
    condition: ({ tags = [] }) =>
      tags.includes('cond1') && !tags.includes('cond2'),
    effect: context => (context.tags = context.tags.concat(['add1', '!add2']))
  });
  rs.add({ domain: 'toto', label: 'pouet' });
  rs.add({ domain: 'toto', label: 'pit', weight: 1, condition: ['add1'] });

  rs.rand = jest.fn((min, max) => max - 0.001);
  expect(rs.resolve('<start>', { tags: ['cond1'] })).toBe('pitpouet');
});

it('And use vars', () => {
  const rs = new RandomStory();
  rs.add({ domain: 'start', label: 'test' });
  rs.add({
    domain: 'start',
    label: '<toto>pouet',
    weight: 1,
    condition: ({ tags = [] }) =>
      tags.includes('cond1') && !tags.includes('cond2'),
    effect: context => (context.tags = context.tags.concat(['add1', '!add2']))
  });
  rs.add({ domain: 'toto', label: 'pouet' });
  rs.add({
    domain: 'toto',
    label: 'pit$(titi)',
    weight: 1,
    condition: ({ tags }) => tags.includes('add1')
  });

  rs.rand = jest.fn((min, max) => max - 0.001);
  expect(
    rs.resolve('<start>', { tags: ['cond1'], vars: { titi: 'hihi' } })
  ).toBe('pithihipouet');
});

it('It generate something with complexe conditions', () => {
  const rs = new RandomStory();
  rs.add({
    domain: 'newDom',
    label: 'medium',
    condition: ({ value }) => value <= 10 && value >= 5
  });
  rs.add({
    domain: 'newDom',
    label: 'low',
    condition: ({ value }) => value < 5
  });
  rs.add({
    domain: 'newDom',
    label: 'high',
    condition: ({ value }) => value > 10
  });
  expect(rs.resolve('<newDom>', { value: 2 })).toBe('low');
  expect(rs.resolve('<newDom>', { value: 6 })).toBe('medium');
  expect(rs.resolve('<newDom>', { value: 15 })).toBe('high');
});
