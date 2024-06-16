import * as React from 'react';
import { useStore } from 'lib/storage'

import './styles.scss';
import { CardModel, ScryfallResponse } from 'lib/api/queryScryfallSearch';

import Outlet from './../ContentScript/Outlet';

const AnimatedCards: React.FC = () => {
  const [cards, setCards] = React.useState([])
  const {model, ...store} = useStore<CardModel>('cards')

  React.useEffect(() => {
    const getResults = async () => {
      await store.init()


      setCards(Object.values(model))
    }

    getResults()
  }, [])

  return <Outlet response={cards}></Outlet>
}

const Options: React.FC = () => {
  return (
    <div>
      <form>
        <p>
          <label htmlFor="username">Your Name</label>
          <br />
          <input
            type="text"
            id="username"
            name="username"
            spellCheck="false"
            autoComplete="off"
            required
          />
        </p>
        <p>
          <label htmlFor="logging">
            <input type="checkbox" name="logging" /> Show the features enabled
            on each page in the console
          </label>
        </p>

        <div className="names-list">

        </div>
      </form>

      <AnimatedCards/>
    </div>
  );
};

export default Options;
