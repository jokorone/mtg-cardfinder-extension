import browser from 'webextension-polyfill';

export const useStorage = <T extends Record<string, any>>(identifier: keyof T) => {
  const db = browser.storage.sync

  const persist = async (value: T) => {
    await db.set({ [value[identifier]]: value })
    console.log('in db', await db.get(value[identifier]));
  }

  return [
    {
      getOne: async (id: string) => await db.get(id) as T,
      getAll: async () => await db.get() as { [key: string ]: T },
      clear: async () => await db.clear()
    },
    persist
  ] as const
}
