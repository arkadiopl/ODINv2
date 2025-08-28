import * as R from 'ramda'
import Signal from '@syncpoint/signal'
import { Style } from 'ol/style'
import Icon from 'ol/style/Icon'
import themisUrl from '../../assets/themis.svg'

// Funkcja do tworzenia stylu ikony SVG z zachowaniem rzeczywistych rozmiarów w metrach
const createThemisStyle = (feature, resolution) => {
  // Rzeczywista szerokość pojazdu w metrach (zgodnie z definicją w SVG)
  const vehicleWidth = 10
  
  // Obliczamy skalę na podstawie rozdzielczości mapy
  // Rozdzielczość to metry na piksel, więc dzielimy rozmiar w metrach przez rozdzielczość
  // 100 to szerokość viewBox w SVG
  const scale = vehicleWidth / (resolution * 100)
  
  // Pobieramy kierunek pojazdu z właściwości (jeśli istnieje)
  const rotation = feature.get('rotation') || 0
  
  return new Style({
    image: new Icon({
      src: themisUrl,
      scale: scale,
      rotateWithView: true,
      rotation: rotation * Math.PI / 180,
      // Punkt zakotwiczenia ikony (środek)
      anchor: [0.5, 0.5],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction'
    })
  })
}

/**
 * Styl dla obiektów THEMIS_1
 */
export default $ => {
  // Sprawdzamy, czy to obiekt THEMIS_1
  $.isThemis = $.properties.map(properties => properties.h === 'THEMIS_1')
  
  // Tworzymy styl dla THEMIS_1
  $.themisStyle = Signal.link(
    (isThemis, resolution) => {
      if (!isThemis) return []
      return [feature => createThemisStyle(feature, resolution)]
    },
    [$.isThemis, $.resolution]
  )
  
  // Łączymy styl THEMIS_1 z innymi stylami
  $.styles = Signal.link(
    (...styles) => styles.reduce(R.concat),
    [
      $.themisStyle,
      $.shape,
      $.selection
    ]
  )
  
  return $.styles
    .ap($.styleRegistry)
    .ap($.styleFactory)
}
