export type Environment = 'Node' | 'Library' | 'Browser';

export type Visibility = 'Public' | 'Private';

export type Record<K extends string | symbol = string, V = unknown> = {
  [k in K]: V;
};

export type ReadonlyRecord<K extends string | symbol = string, V = unknown> = {
  readonly [k in K]: V;
};

export interface ReadonlyStringRecord extends ReadonlyRecord.Type<string, string> {}

export interface Config extends Record<string, string | ReadonlyRecord> {}
