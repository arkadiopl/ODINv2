import { Style } from 'ol/style'
import Icon from 'ol/style/Icon'
import themisUrl from '../../assets/themis.svg'

/**
 * Bezpośredni styl dla obiektów THEMIS_1, który nie korzysta z systemu sygnałów
 * Może być używany jako fallback lub do debugowania
 */
export default function(feature, resolution) {
  // Sprawdzamy, czy to obiekt THEMIS_1
  const properties = feature.getProperties()
  if (!properties) return null
  
  let isThemis = false
  
  // Sprawdzamy bezpośrednio w properties
  if (properties.h === 'THEMIS_1') isThemis = true
  
  // Sprawdzamy w properties.properties (zagnieżdżone)
  if (properties.properties && properties.properties.h === 'THEMIS_1') isThemis = true
  
  if (!isThemis) return null
  
  // Rzeczywista szerokość pojazdu w metrach (zgodnie z definicją w SVG)
  const vehicleWidth = 10
  
  // Obliczamy skalę na podstawie rozdzielczości mapy
  // Rozdzielczość to metry na piksel, więc dzielimy rozmiar w metrach przez rozdzielczość
  // 100 to szerokość viewBox w SVG
  const scale = vehicleWidth / (resolution * 100)
  
  // Pobieramy kierunek pojazdu z właściwości (jeśli istnieje)
  const rotation = feature.get('rotation') || 0
  
  console.log('Direct THEMIS style with scale:', scale, 'resolution:', resolution)
  
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