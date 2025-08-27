# Implementacja ikon SVG w ODIN v2 dla obiektów typu 'THEMIS_1'

Ten projekt zawiera modyfikacje do ODIN v2, które umożliwiają ładowanie ikon SVG dla obiektów z `properties.h === 'THEMIS_1'` z zachowaniem rzeczywistych rozmiarów w metrach oraz z uwzględnieniem kierunku pojazdu.

## Wprowadzone zmiany

### 1. Ikona SVG z wymiarami w metrach

Stworzyliśmy ikonę SVG z wymiarami w metrach:

```xml
<svg width="10m" height="5m" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
  <!-- zawartość ikony -->
</svg>
```

Zwróć uwagę na atrybuty `width="10m"` i `height="5m"`, które definiują rzeczywiste wymiary ikony w metrach.

### 2. Modyfikacja pliku feature.js

Dodaliśmy funkcję `createThemisStyle`, która tworzy styl dla obiektów THEMIS_1 z zachowaniem rzeczywistych rozmiarów:

```javascript
export const createThemisStyle = (feature, resolution) => {
  // Rzeczywista szerokość pojazdu w metrach (zgodnie z definicją w SVG)
  const vehicleWidth = 10
  
  // Obliczamy skalę na podstawie rozdzielczości mapy
  const scale = vehicleWidth / (resolution * 100)
  
  // Pobieramy kierunek pojazdu z właściwości (jeśli istnieje)
  const rotation = feature.get('rotation') || 0
  
  return new Style({
    image: new Icon({
      src: themisUrl,
      scale: scale,
      rotateWithView: true,
      rotation: rotation * Math.PI / 180,
      anchor: [0.5, 0.5],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction'
    })
  })
}
```

Dodaliśmy również flagę `isThemis` do zwracanego obiektu, aby wiedzieć, czy to obiekt THEMIS_1.

### 3. Modyfikacja pliku layerStyles.js

Dodaliśmy funkcję `createFeatureStyle`, która sprawdza, czy obiekt jest typu THEMIS_1 i stosuje odpowiedni styl:

```javascript
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
```

### 4. Modyfikacja pliku vectorLayers.js

Zmodyfikowaliśmy funkcję tworzącą warstwy wektorowe, aby używała naszej funkcji stylującej:

```javascript
const vectorLayer = source => new VectorLayer({
  source,
  declutter,
  selectable: true,
  style: styles.createFeatureStyle, // Używamy naszej funkcji stylującej
  updateWhileAnimating: true,
  updateWhileInteracting: true
})
```

### 5. Modyfikacja pliku Card.js

Zmodyfikowaliśmy sposób wyświetlania ikon w panelu bocznym, aby dla obiektów THEMIS_1 używać tagu `<img>` zamiast `dangerouslySetInnerHTML`:

```javascript
children.avatar = svg && (
  props.isThemis 
    ? <div className='avatar'>
        <img src={svg} alt="THEMIS_1" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    : <div className='avatar' dangerouslySetInnerHTML={{ __html: svg }}/>
)
```

## Jak to działa

1. Gdy obiekt ma właściwość `h === 'THEMIS_1'`, używamy specjalnej ikony SVG z pliku `assets/themis.svg`.
2. Ikona ta ma zdefiniowane rzeczywiste wymiary w metrach (`width="10m" height="5m"`).
3. Funkcja `createThemisStyle` oblicza odpowiednią skalę na podstawie rozdzielczości mapy, aby zachować rzeczywiste rozmiary ikony.
4. Kierunek pojazdu jest obsługiwany przez parametr `rotation` w stylu ikony.
5. W panelu bocznym ikona jest wyświetlana za pomocą tagu `<img>` zamiast `dangerouslySetInnerHTML`.

## Jak dostosować

1. Zmiana rozmiaru pojazdu:
   - Zmodyfikuj atrybuty `width` i `height` w pliku SVG
   - Zaktualizuj wartość `vehicleWidth` w funkcji `createThemisStyle`

2. Zmiana wyglądu pojazdu:
   - Możesz zmodyfikować zawartość pliku SVG, zachowując atrybuty `width`, `height` i `viewBox`

3. Dodanie większej liczby typów pojazdów:
   - Stwórz nowe pliki SVG dla różnych typów pojazdów
   - Rozszerz funkcję `createFeatureStyle`, aby obsługiwała różne typy pojazdów