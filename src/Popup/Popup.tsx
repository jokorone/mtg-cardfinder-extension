import * as React from 'react';
import browser from 'webextension-polyfill';
import type {Tabs} from 'webextension-polyfill';

import './styles.scss';

function openWebPage(url: string): Promise<Tabs.Tab> {
  return browser.tabs.create({url});
}

const Popup: React.FC = () => {
  console.log('render popup');
  const [result, setResult] = React.useState({})

  React.useEffect(() => {
    const getResults = async () => {
      const result = await browser.storage.session.get()
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
