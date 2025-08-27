import { Style } from 'ol/style'
import Icon from 'ol/style/Icon'
import themisUrl from '../../assets/themis.svg'

// Funkcja do tworzenia stylu ikony SVG z zachowaniem rzeczywistych rozmiarów w metrach
export default (feature, resolution) => {
  // Sprawdzamy, czy to obiekt THEMIS_1
  const properties = feature.getProperties()
  if (!properties || properties.h !== 'THEMIS_1') return null

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