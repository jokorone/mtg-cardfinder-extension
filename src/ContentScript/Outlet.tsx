import * as React from 'react'
import { ScryfallResponse } from 'lib/api/queryScryfallSearch'
import { useStorage } from 'lib/storage'

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
const Card: React.FC<ScryfallResponse[0]> = ({...card}) => {
  const [hovered, setHovered] = React.useState(false)
  const [, persist] = useStorage<ScryfallResponse[0]>('name')

  const style = {
    width: 'max(200px, 8rem)',
    height: 'auto',
    margin: 0
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      { 'imageUrls' in card &&
        <img style={style} src={card.imageUrls.normal} alt={card.name}></img>
      }
      { 'faces' in card &&
        <div className="mdfc">
          <img style={style} src={card.faces[0].imageUrls.normal} alt={card.faces[0].name}></img>
          <img style={style} src={card.faces[1].imageUrls.normal} alt={card.faces[1].name}></img>
        </div>
      }

      {hovered &&
        <button
          onClick={async () => await persist(card)}
          style={{
            marginLeft: '.5rem',
            backgroundColor: 'white',
          }}>
            Add {card.name} to collection
        </button>
      }
  </div>)
}

const OutletContainer: React.FC<{children: React.ReactNode}> = ({children}) => {
  const mousePosition = useMousePositionOnce()

  return <div className="outlet-wrapper" style={{
    position: 'absolute',
    zIndex: 999,
    left: `${mousePosition.x ?? 0}px`,
    top: `${mousePosition.y ?? 0}px`,
  }}>
    {children}
  </div>
}

const Outlet: React.FC<{response: ScryfallResponse}> = ({ response }) => {
  const destroy = useDestroyOnClick()

  if (destroy) {
    return <></>
  }

  if (response.length > 10) {
    return <OutletContainer>
      <h2 style={{
        margin: '.5rem',
        background: 'white',
      }}></h2>
      Found too many cards
    </OutletContainer>
  }

  return <OutletContainer>
    {
      response.map((card, i) => {
        return <div className="card" key={i}
          style={{
            display: 'flex',
            flexDirection: 'row',
            margin: '.5rem',
          }}>
          <Card {...card}></Card>
        </div>
      })
    }

  </OutletContainer>
}

export default Outlet
