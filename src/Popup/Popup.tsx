import * as React from 'react';
import browser from 'webextension-polyfill';
import type {Tabs} from 'webextension-polyfill';

import './styles.scss';
import { useStore } from 'lib/storage';
import { CardModel, ScryfallResponse } from 'lib/api/queryScryfallSearch';
import type { CardCollection } from 'lib/collection'


function openWebPage(url: string): Promise<Tabs.Tab> {
  return browser.tabs.create({url});
}

const TextInput: React.FC<{
  callback: (value: string) => void
}> = ({ callback }) => {
  const [fresh, setFresh] = React.useState('')

  return (<>
    <input type="text" name="add-collection"
      onChange={e => {
        setFresh(e.target.value)
      }} value={fresh}
    />
    <button disabled={!fresh.length}
      onClick={() => {
        callback(fresh)
        setFresh('')
      }
    }>Add collection</button>
  </>)
}


export const CollectionManager: React.FC<{}> = () => {
  const [collections, setCollections] = React.useState<Array<CardCollection>>([])

  const { model, ...store } = useStore<CardCollection>('collections');

  React.useEffect(() => {
    const init = async () => {
      await store.init()
      setCollections(Array.from(model.values()))
    }

    init()
  }, [model])

  const addCollection = async (name: string) => {
    await store.set(name, { name, entries: [] })
    setCollections(Array.from(model.values()))
  }



  return (
    <div className="collection-manager" style={{ margin: '0 1rem' }}>
      <div className="collection-controls">
        <TextInput callback={addCollection}/>
        <button onClick={() => store.clear()}>Clear collections DB</button>
      </div>
      <div className="collection-list">
        {
          collections.map(collection => (
            <div className="collection" key={collection.name}>
              <h2>{collection.name}</h2>
            </div>)
          )
        }
      </div>
    </div>
  )
}


const Popup: React.FC = () => {
  const [result, setResult] = React.useState({})
  const {model, ...store} = useStore<CardModel[]>('cards')


  React.useEffect(() => {
    const init = async () => {
      await store.init()
      setResult(Array.from(model.values()))
    }

    init()
  }, [model])

  return (
    <section id="popup">
      <h2>MtG Cardfinder</h2>
      <div className="controls">
        <button onClick={() => store.clear()}>Clear cards DB</button>
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
      <CollectionManager></CollectionManager>
      <div className="results_list">
        {
          JSON.stringify(result,null,4)
        }
      </div>

    </section>
  );
};

export default Popup;
