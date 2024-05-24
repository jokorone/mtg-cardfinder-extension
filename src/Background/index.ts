import browser from 'webextension-polyfill'
import {queryScryfallSearch} from 'lib/api/queryScryfallSearch'

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
          console.log('found:');
          console.log(...result);
          if (!tab && tab.id) return
          if ('openPopup' in browser.action) browser.action.openPopup()

          // works only in chrome canary
          const db = browser.storage.session

          const prev = await db.get()

          browser.storage.local.set({
            result: {
            ...prev,
            ...result
            }
          })

          // browser.scripting.executeScript({
          //   target: {tabId: tab.id},
          //   files: ['js/contentScript.bundle.js'],
          // })
        }

        break;
      default:
        break;
    }
  });
});
