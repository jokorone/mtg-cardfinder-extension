// import browser from 'webextension-polyfill'
import {queryScryfallSearch} from 'lib/api/queryScryfallSearch';
console.log('background script');


// function openPopup() {
//   if (!true) {
//   // if (typeof chrome !== 'undefined' && chrome.runtime) {
//     // see README Pitfalls
//     // chrome.action.openPopup();
//     // chrome.browserAction.openPopup();
//   } else if (typeof browser !== 'undefined' && browser.runtime) {
//     console.log('browser', browser);

//     browser.browserAction.openPopup();
//   } else {
//     // Unsupported browser
//     // eslint-disable-next-line no-alert
//     alert('Unsupported browser.');
//   }
// }

// browser.runtime.onInstalled.addListener((): void => {
//   console.log('🦄', 'extension installed');

//   browser.contextMenus.create(
//     {
//       id: 'log-selection',
//       title: 'Lookup MtG Card Name',
//       contexts: ['selection'],
//     },
//     () => {
//       console.log('context menu callback');
//     }
//   );

//   browser.contextMenus.onClicked.addListener(async (info, tab) => {
//     switch (info.menuItemId) {
//       case 'log-selection':
//         // await browser.browserAction.openPopup();
//         openPopup();

//         const result = await queryScryfallSearch({
//           name: info.selectionText!.trim(),
//         });

//         if ('error' in result) {
//           console.error(result);
//         } else {
//           console.log(...result);
//           if (tab && tab.id) {
//             // console.log('sending msg');
//             // browser.tabs.executeScript(tab.id, {
//             //   file: 'js/contentScript.bundle.js',
//             // });
//             // browser.tabs.sendMessage(tab.id, 'found-cards');
//           }
//         }

//         break;
//       default:
//         break;
//     }
//   });
// });
