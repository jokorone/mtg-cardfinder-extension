import {Prettify, createAPIMethod} from '../util';

export type ScryfallResponse = Array<{
  name: string;
  directLink: string;
  relatedUrls: Array<string>;
  imageUrls: Record<string, string>;
  prices: Record<string, string>;
}>

export const queryScryfallSearch = createAPIMethod<
  {name: string},
  | ScryfallResponse
  | {status: number; error: string}
>({
  buildUrl: (opts) => {
    const url = new URL('https://api.scryfall.com/cards/search');
    url.searchParams.append('q', opts.name);
    return url;
  },
  handleResponse: async (response, opts) => {
    const result = await response.json();

    if (result.status === 404) {
      return {
        status: result.status,
        error: result!.details,
      };
    }

    const data = new Array();

    if (result.data.length > 1) {
      // example: search for 'sol ring', get [Solemn Offering, Sol Ring]
      const findByLength = result.data.filter(
        (card: {name: string}) => card.name.length === opts.name.length
      );

      if (findByLength.length === 1) {
        // found Sol Ring
        data.push(...findByLength);
      } else {
        // example: search for 'doubling' get [Doubling-Chant,-Cube,-Season]
        data.push(...result.data);
      }
    } else {
      data.push(result.data[0]);
    }

    return data.map((card) => ({
      name: card.name,
      directLink: card.uri,
      relatedUrls: card.related_uris,
      imageUrls: card.image_uris,
      prices: card.prices,
    }));
  },
});
