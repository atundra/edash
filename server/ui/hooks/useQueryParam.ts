import { useRouter, NextRouter } from 'next/router';
import { pipe } from 'fp-ts/lib/pipeable';
import { Lens } from 'monocle-ts';
import * as O from 'fp-ts/lib/Option';

const getQueryParamLens = (param: string) => Lens.fromPath<NextRouter>()(['query', param]);

export const useQueryParam = (name: string): RouterQueryParam =>
  pipe(name, getQueryParamLens, (lens) => lens.get(useRouter()), O.fromNullable);

export type RouterQueryParam = O.Option<string | string[]>;
