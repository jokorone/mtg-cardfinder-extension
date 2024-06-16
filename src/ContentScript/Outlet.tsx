import * as React from 'react'
import { ScryfallResponse } from 'lib/api/queryScryfallSearch'
import { useStore } from 'lib/storage'

// CUSTOM HOOKS
const useMousePositionOnce = () => {
  const [mousePosition, setMousePosition] = React.useState<{x:number,y:number}>({ x: null, y: null })

  React.useEffect(() => {
    const allHoveredElements = document.querySelectorAll(':hover')
     // Get the most specific hovered element
    const hoveredElement = allHoveredElements[allHoveredElements.length - 1]

    if (!hoveredElement) return

    const rect = hoveredElement.getBoundingClientRect()

    setMousePosition({
      x: (rect.x - (rect.x / 2)) + window.scrollX,
      y: (rect.y - (rect.y / 2)) + window.scrollY,
    })
  }, [])

  return mousePosition
}

const useDestroyOnClick = () => {
  const [destroy, setDestroy] = React.useState(false)

  React.useEffect(() => {
    const listener = () => {
      setDestroy(true)
    }

    window.addEventListener('click', listener, { once: true })

    return () => window.removeEventListener('click', listener)
  })

  return destroy
}

// COMPONENTS
const Card: React.FC<
  ScryfallResponse[0]
  & {
    i: number,
    onClick: React.MouseEventHandler<HTMLButtonElement>,
    styles?: React.CSSProperties
  }> = (card) => {
  const [hovered, setHovered] = React.useState(false)

  const style: React.CSSProperties = {
    width: 'max(225px, 8.5rem)',
    height: 'auto',
    margin: 0,
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className='card-wrapper'
      style={{
        display: 'flex',
        position: 'absolute',
        zIndex: hovered ? 999 : 899 + card.i, // maximum handsize is 101 I guess, nice
        ...card.styles,
        // transform: `${hovered ? 'rotate(0deg)' : ''}`
      }}
    >
      {
        'imageUrls' in card &&
          <img style={style} src={card.imageUrls.normal} alt={card.name}></img>
      }
      {
        'faces' in card &&
          <div className="mdfc">
            <img style={style} src={card.faces[0].imageUrls.normal} alt={card.faces[0].name}></img>
            <img style={style} src={card.faces[1].imageUrls.normal} alt={card.faces[1].name}></img>
          </div>
      }

      {
        // hovered &&
          <button
            onClick={card.onClick}
            style={{
              cursor: 'pointer',
              backgroundColor: 'darkgrey',
              borderRadius: '50%',
              width: '3rem',
              height: '3rem',
              top: '3rem',
              left: '90%',
              fontSize: '250%',
              color: 'white',
              position: 'absolute',
            }}>
              +
          </button>
      }
    </div>
  )
}

const withFannedCards = (options: {
    totalCount: number,
    center: [number, number],
    radius: number,
    angleRange: number,
}) => (props: { cards: ScryfallResponse }) => {
  const angleStep = options.angleRange / (options.totalCount - 1)

  const {model, ...store} = useStore<ScryfallResponse[0]>('cards')

  return (props.cards.map((card, i) => {
    const angle = -options.angleRange / 2 + i * angleStep
    const x = options.center[0] + options.radius * Math.cos(angle)
    const y = options.center[1] + options.radius * Math.sin(angle)
    const rotation = angle

    return <Card
      i={i}
      onClick={async () => await store.set(card.name, card)}
      styles={{
        position: 'absolute',
        left: x,
        top: y,
        // left: `${i * 20}px`,
        transform: `rotate(${rotation}deg)`,
      }}
      {...card}
    ></Card>
  }))
}

const Outlet: React.FC<{response: ScryfallResponse}> = ({ response }) => {
  const destroy = useDestroyOnClick()
  const mousePosition = useMousePositionOnce()

  if (destroy) {
    return <></>
  }

  const FannedCardsComponent = withFannedCards({
    totalCount: response.length,
    angleRange: 90,
    center: [window.innerWidth / 2, window.innerHeight - (window.innerWidth * 0.3)],//Object.values(mousePosition) as [number, number],
    radius: window.innerWidth * 0.4
  })

  return <div className="outlet-wrapper" style={{
    position: 'absolute',
    zIndex: 899,
    left: `${mousePosition.x}px`,
    top: `${mousePosition.y}px`,
    display: 'flex',
    flexWrap: 'wrap'
  }}>
    <FannedCardsComponent cards={response}></FannedCardsComponent>
  </div>
}

export default Outlet
