import React from 'react';
import browser, { storage } from 'webextension-polyfill';

type Stores = 'collections' | 'cards'
export const useStore = <T>(storeId: Stores) => {
  const db = browser.storage.sync
  const model= new Map<string, T>()

  const getStore = async () => (await db.get(storeId))[storeId]

  const init = async () => {
    let store = await getStore()
    if (!store) {
      await db.set({ [storeId]: {} })
      store = model
    }

    Object
      .entries<T>(store)
      .map(([name, collection]) => model.set(name, collection))
  }

  const setItem = async (key: string, value: T) => {
    if (model.has(key)) return

    const store = await getStore()

    await db.set({
      [storeId]: { ...store, [key]: value }
    })

    model.set(key, value)

  }

  return {
    model,
    init,
    set: setItem,
    clear: async (...storeIds: Stores[]) => {
      (storeIds.length ? storeIds : [storeId])
        .map(async id => await db.set({ [id]: {} }))
      model.clear()
    }
  } as const
}

// export const useStore = <T>(storeId: Parameters<typeof createStore>[0],
//   callback: ((model: T[]) => void)
// ) => {
//   const store = createStore<T>(storeId)

//   React.useEffect(() => {
//     const getResults = async () => {
//       await store.init()
//       callback(Object.values(store.model))
//     }

//     getResults()
//   }, [store.model])

//   return store
// }
