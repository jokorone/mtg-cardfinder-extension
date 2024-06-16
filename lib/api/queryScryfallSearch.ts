import {Prettify, createAPIMethod} from '../util';

type SingleSource = {
  name: string,
  imageUrls: Record<string, string>;
}
type ImageSource = Prettify<SingleSource> | {
  faces: [Prettify<SingleSource>, Prettify<SingleSource>]
}

export type CardModel = {
  name: string;
  directLink: string;
  relatedUrls: Array<string>;
  prices: Record<string, string>;
} & ImageSource

export type ScryfallResponse = Array<CardModel>


export const queryScryfallSearch = createAPIMethod<
  { name: string },
  | ScryfallResponse
  | { status: number; error: string }
>({
  buildUrl: (opts) => {
    const url = new URL('https://api.scryfall.com/cards/search');
    url.searchParams.append('q', opts.name);
    return url;
  },
  handleResponse: async (response, opts) => {
    if (!('json' in response)) {
      console.error('something went wrong!!', response)
    }

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

    return data.map((card) => {
      const imageSource = 'image_uris' in card
        ? { imageUrls: card.image_uris }
        : { faces: card.card_faces.map(
            ({name, image_uris}) => ({ name, imageUrls: image_uris })
          )
        }

      return {
        name: card.name,
        directLink: card.uri,
        relatedUrls: card.related_uris,
        prices: card.prices,
        ...imageSource,
      }
    });
  },
});
