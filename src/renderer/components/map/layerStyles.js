import { Fill, Stroke, Circle, Style } from 'ol/style'
import { createThemisStyle } from '../../../renderer/store/documents/feature'

const highlightStyle = (() => {
  const fill = new Fill({ color: 'rgba(255,50,50,0.4)' })
  const stroke = new Stroke({ color: 'black', width: 1, lineDash: [10, 5] })
  return [
    new Style({
      image: new Circle({ fill, stroke, radius: 50 }),
      fill,
      stroke
    })
  ]
})()

// Funkcja stylująca dla warstw wektorowych
const createFeatureStyle = (feature, resolution) => {
  // Sprawdzamy, czy to obiekt THEMIS_1
  const properties = feature.getProperties()
  if (properties && properties.h === 'THEMIS_1') {
    // Używamy specjalnego stylu dla THEMIS_1
    return createThemisStyle(feature, resolution)
  }
  
  // Dla innych obiektów używamy domyślnego stylu
  return null // null oznacza użycie domyślnego stylu symboli
}

export default (services, sources) => {
  return {
    highlightStyle,
    createFeatureStyle
  }
}