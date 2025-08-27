import * as R from 'ramda'
import * as ID from '../../ids'
import * as MILSTD from '../../symbology/2525c'
import * as GENERIC from '../../symbology/generic'
import { svg } from '../../symbology/symbol'
import themisUrl from '../../assets/themis.svg'
import Icon from 'ol/style/Icon'
import { Style } from 'ol/style'
import * as Geometry from '../geometry'

const identityTag = R.cond([
  [R.equals('F'), R.always(['OWN'])],
  [R.equals('H'), R.always(['ENY'])],
  [R.equals('U'), R.always(['UKN'])],
  [R.T, R.always([])]
])

// Funkcja do tworzenia stylu ikony SVG z zachowaniem rzeczywistych rozmiarów w metrach
export const createThemisStyle = (feature, resolution) => {
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

export default async function (id) {
  const keys = [R.identity, ID.layerId, ID.hiddenId, ID.lockedId, ID.restrictedId, ID.tagsId]
  const [feature, layer, hidden, locked, restricted, tags] = await this.store.collect(id, keys)
  const links = await this.store.keys(ID.prefix('link')(id))

  const properties = feature.properties || {}
  const sidc = properties.sidc
  let descriptor
  if (properties.scope) {
    descriptor = GENERIC.descriptor(sidc)
  } else {
    descriptor = MILSTD.descriptor(sidc)
  }
  const dimensions = descriptor ? descriptor.dimensions : []
  const scope = descriptor && descriptor.scope ? [descriptor.scope] : []
  const hierarchy = descriptor ? descriptor.hierarchy : ['N/A']
  const geometryType = Geometry.type(descriptor)
  const identity = identityTag(MILSTD.identityCode(sidc))
  const description = feature.properties.description || (layer.name
    ? layer.name.toUpperCase() + ' ⏤ ' + hierarchy.join(' • ')
    : hierarchy.join(' • '))

  const geometryTag = geometryType === 'Polygon'
    ? `SYSTEM:${geometryType.toLowerCase()}`
    : `SYSTEM:${geometryType.toLowerCase()}:NONE`

  // Dla obiektów THEMIS_1 używamy specjalnej ikony SVG
  const isThemis = properties.h === 'THEMIS_1'

  return {
    id,
    title: feature.name || properties.t || null, // might be undefined
    description,
    svg: isThemis ? themisUrl : svg(sidc),
    properties,
    isThemis, // Dodajemy flagę, aby wiedzieć, czy to obiekt THEMIS_1
    tags: [
      'SCOPE:FEATURE',
      hidden ? 'SYSTEM:HIDDEN::mdiEyeOff' : 'SYSTEM:VISIBLE::mdiEyeOutline',
      restricted ? 'SYSTEM:RESTRICTED:NONE:mdiShieldLockOutline' : (locked ? 'SYSTEM:LOCKED::mdiLock' : 'SYSTEM:UNLOCKED::mdiLockOpenVariantOutline'),
      ...(links.length ? ['SYSTEM:LINK::mdiLinkVariant'] : []),
      geometryTag,
      ...dimensions.map(label => `SYSTEM:${label}:NONE`),
      ...scope.map(label => `SYSTEM:${label}:NONE`),
      ...identity.map(label => `SYSTEM:${label}:NONE`),
      ...(tags || []).map(label => `USER:${label}:NONE::${!restricted ?? false}`),
      restricted ? undefined : 'PLUS'
    ].filter(Boolean).join(' '),
    capabilities: restricted ? 'FOLLOW' : 'RENAME|DROP|FOLLOW'
  }
}