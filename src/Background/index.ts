import browser from 'webextension-polyfill'
import {queryScryfallSearch} from 'lib/api/queryScryfallSearch'


const registerContentScript = async () => {
  let [tab] = await browser.tabs.query({ active: true, currentWindow: true })

  browser.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["js/contentScript.bundle.js"],
  })
}

const db = browser.storage.sync

browser.runtime.onInstalled.addListener((): void => {
  console.log('🦄', 'extension installed');

  browser.contextMenus.create(
    {
      id: 'log-selection',
      title: 'Lookup MtG Card Name',
      contexts: ['selection'],
    },
    () => {
      if (browser.runtime.lastError) {
        console.error(`ERROR while creating context menu item`)
        console.error(browser.runtime.lastError)
      }
    }
  );

  const executeContentSript = (tab: browser.Tabs.Tab) => {
    browser.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["js/contentScript.bundle.js"],
      // func: (res) => alert(JSON.stringify(Array.from(res))),
      // args: [result]
    })
  }

  browser.commands.onCommand.addListener(async command => {
    if (command !== "get-selected-text") return
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    executeContentSript(tab)
  })

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!info.selectionText) return;

    switch (info.menuItemId) {
      case 'log-selection':

        const result = await queryScryfallSearch({
          name: info.selectionText.trim(),
        });

        if ('error' in result) {
          console.error(result);
        } else {
          console.log('queried from scryfall:');
          console.log(...result);
          if (!tab && tab.id) return
          if ('openPopup' in browser.action) browser.action.openPopup()

          executeContentSript(tab)

          const model = new Map<string, typeof result[0]>()

          for (const item of result) {
            if (!model.has(item.name))
              model.set(item.name, item)
          }

          db.set({ result: Array.from(model.entries()) })

          console.log('executing in...', tab.id, tab.title);
        }

        break;
      default:
        break;
    }
  });
});
