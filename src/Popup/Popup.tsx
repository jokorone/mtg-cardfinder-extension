import * as React from 'react';
import browser from 'webextension-polyfill';
import type {Tabs} from 'webextension-polyfill';

import './styles.scss';
import { useStorage } from 'lib/storage';
import { ScryfallResponse } from 'lib/api/queryScryfallSearch';

function openWebPage(url: string): Promise<Tabs.Tab> {
  return browser.tabs.create({url});
}

const Popup: React.FC = () => {
  const [result, setResult] = React.useState({})
  const [storage, ] = useStorage<ScryfallResponse[0]>('name')

  React.useEffect(() => {
    const getResults = async () => {
      const result = await storage.getAll()
      console.log('found: ', result);

      setResult(result)
    }

    getResults()

    return () => {}
  }, [])

  return (
    <section id="popup">
      <h2>MtG Cardfinder</h2>
      <div className="controls">
        <button onClick={() => storage.clear()}>Clear DB</button>
      </div>
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
