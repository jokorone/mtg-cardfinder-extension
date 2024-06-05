import * as React from 'react';
import browser from 'webextension-polyfill';
import type {Tabs} from 'webextension-polyfill';

import './styles.scss';

function openWebPage(url: string): Promise<Tabs.Tab> {
  return browser.tabs.create({url});
}

const Popup: React.FC = () => {
  const [result, setResult] = React.useState({})

  React.useEffect(() => {
    const getResults = async () => {
      console.log('looking into from local storage');

      const result = await browser.storage.sync.get('result')
      console.log('found: ', result);

      setResult(result)
    }

    getResults()

    return () => {}
  }, [])

  return (
    <section id="popup">
      <h2>MtG Cardfinder</h2>
      <button
        id="options__button"
        type="button"
        onClick={(): Promise<Tabs.Tab> => {
          return openWebPage('options.html');
        }}
      >
        Options Page
      </button>
      <div className="results_list">
        {
          JSON.stringify(result,null,4)
        }
      </div>
    </section>
  );
};

export default Popup;
