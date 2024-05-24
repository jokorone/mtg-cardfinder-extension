export type Prettify<T> = {
  [K in keyof T]: T[K] extends object ? Prettify<T[K]> : T[K];
} & object;

type CreateAPImethod = <TInput extends Record<string, string>, TOutput>(opts: {
  buildUrl: (opts: TInput) => URL;
  handleResponse: (response: Response, opts: TInput) => Promise<TOutput>;
}) => (input: TInput) => Promise<TOutput>;

export const createAPIMethod: CreateAPImethod = (opts) => (input) => {
  return fetch(opts.buildUrl(input))
    .catch((e) => e)
    .then((result) => opts.handleResponse(result, input));
};
