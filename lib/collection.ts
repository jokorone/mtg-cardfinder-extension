import { ScryfallResponse } from './api/queryScryfallSearch'

export type Collection<T> = {
  name: string,
  entries: Array<T>
}

export type CardCollection = Collection<ScryfallResponse[0]>
