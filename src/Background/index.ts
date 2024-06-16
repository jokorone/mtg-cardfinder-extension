import browser from 'webextension-polyfill'
import {queryScryfallSearch} from 'lib/api/queryScryfallSearch'
import { useStore } from 'lib/storage';
import type { CardCollection } from 'lib/collection';

const { model, ...store } = useStore<CardCollection>('collections');

browser.runtime.onInstalled.addListener(async () => {
  console.log('🦄', 'extension installed');

  await store.init()

  console.log('init menus', model);

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

  browser.contextMenus.create({
    id: "separator-1",
    type: "separator",
    contexts: ["all"],
  })

  for (let name of model.keys()) {
    browser.contextMenus.create({
      id: `collection-menu::${name}`,
      contexts: ['selection'],
      title: `Add to ${name}`,
    })
  }

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
    console.log(info);

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
        }
        break;
      default:
        const [,targetCollection] = info.menuItemId.toString().split('::')
        console.log('targeting:', targetCollection);


        break;
    }
  });
});
