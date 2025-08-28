import * as R from 'ramda'
import * as ID from '../../ids'
import * as MILSTD from '../../symbology/2525c'
import * as GENERIC from '../../symbology/generic'
import * as Geometry from '../geometry'

const identity = R.cond([
  [R.equals('F'), R.always(['OWN'])],
  [R.equals('H'), R.always(['ENY'])],
  [R.equals('U'), R.always(['UKN'])],
  [R.T, R.always([])]
])

/**
 *
 */
export default async function (id) {
  const keys = [R.identity, ID.layerId, ID.hiddenId, ID.lockedId, ID.tagsId]
  const [feature, layer, hidden, locked, tags] = await this.store.collect(id, keys)
  if (!feature) return

  const links = await this.store.keys(ID.prefix('link')(id))
  const properties = feature.properties || {}
  let descriptor
  if (properties.scope) {
    descriptor = GENERIC.descriptor(properties.sidc)
  } else {
    descriptor = MILSTD.descriptor(properties.sidc)
  }

  const hierarchy = descriptor ? descriptor.hierarchy : []
  const dimensions = descriptor ? descriptor.dimensions : []
  const scope = descriptor && descriptor.scope ? [descriptor.scope] : []

  const { t, t1 } = properties
  const names = [feature.name, t, t1, layer && layer.name].filter(Boolean).join(' ')
  const geometryType = Geometry.type(descriptor)

  return {
    id,
    scope: ID.FEATURE,
    properties,
    tags: [
      hidden ? 'hidden' : 'visible',
      locked ? 'locked' : 'unlocked',
      ...(links.length ? ['link'] : []),
      geometryType.toLowerCase(),
      ...(tags || []),
      ...dimensions,
      ...scope,
      ...identity(MILSTD.identityCode(properties.sidc))
    ],
    text: `${names} ${hierarchy.join(' ')}`.trim()
  }
}
