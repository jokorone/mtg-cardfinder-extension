import * as React from 'react';

import { ScryfallResponse } from 'lib/api/queryScryfallSearch';

const addCardToCollection = (card: ScryfallResponse[0]) => {

}

const Card = (card: ScryfallResponse[0]) => {
  return <>
      <img
        src={card.imageUrls.png}
        alt={card.name}
        style={{
          width: '250px',
          height: 'auto',
          margin: 0,
          // border: true ? '1px solid white' : ''
        }}
      />
      <button
        onClick={() => addCardToCollection(card)}
        style={{
          marginLeft: '.5rem',
          marginTop: 'auto',
        }}>
          add {card.name} to collection
      </button>
</>
}

const Outlet = ({ response }: { response: ScryfallResponse }) => {
  console.log('render outlet');

  // const [mouseCoords, setMouseCoords] = React.useState({ x: 0, y: 0 })


  // React.useEffect(() => {
  //   document.body.onmousemove = (e => {
  //     setMouseCoords({ x: e.clientX, y: e.clientY })
  //     // console.log(mouseCoords);
  //   })

  //   return () => document.body.onmousemove = void 0
  // }, [])

  return <div className="outlet-wrapper" style={{
    position: 'absolute',
    zIndex: 999,
    border: '1px solid red',
  }}>
    {
      response.map((card, i) => {
        return <div className="card" key={i}
          style={{
            display: 'flex',
            flexDirection: 'row',
          }}>
          <Card {...card}></Card>
        </div>
      })
    }
  </div>
}

export default Outlet
