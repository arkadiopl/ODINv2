import { Fill, Stroke, Circle, Style } from 'ol/style'
import { Vector as VectorLayer } from 'ol/layer'
import directThemisStyle from '../../ol/style/directThemisStyle'

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


const highlightLayer = (sources, styles) => {
  const { highlightSource } = sources
  return new VectorLayer({
    source: highlightSource,
    style: highlightStyle,
    updateWhileAnimating: true
  })
}


export default (sources, styles) => {
  const { deselectedSource, selectedSource, featureSource } = sources
  const declutter = false
  
  // Funkcja stylująca, która najpierw próbuje użyć stylu THEMIS, a jeśli nie zadziała, używa domyślnego stylu
  const combinedStyleFunction = (feature, resolution) => {
    // Najpierw próbujemy użyć bezpośredniego stylu THEMIS
    const themisStyle = directThemisStyle(feature, resolution)
    if (themisStyle) {
      return themisStyle
    }
    
    // Jeśli nie zadziała, używamy funkcji stylującej z layerStyles.js
    if (styles && styles.createFeatureStyle) {
      return styles.createFeatureStyle(feature, resolution)
    }
    
    // Jeśli nic nie zadziała, zwracamy null (użyj domyślnego stylu)
    return null
  }
  
  const vectorLayer = source => new VectorLayer({
    source,
    declutter,
    selectable: true, // non-standard: considered by select interaction
    style: combinedStyleFunction, // Używamy naszej funkcji stylującej
    updateWhileAnimating: true, // Dodajemy, aby ikony były aktualizowane podczas animacji
    updateWhileInteracting: true // Dodajemy, aby ikony były aktualizowane podczas interakcji
  })

  return {
    featureLayer: vectorLayer(deselectedSource),
    // featureLayer: vectorLayer(featureSource),
    highlightLayer: highlightLayer(sources, styles),
    selectedLayer: vectorLayer(selectedSource)
  }
}