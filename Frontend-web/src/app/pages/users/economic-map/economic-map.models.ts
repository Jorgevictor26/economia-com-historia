export type MapLevel = 'country' | 'province' | 'municipality' | 'district';

export type MapLayerKey = 'history' | 'economy' | 'infrastructure' | 'resources' | 'tourism';

export type MapInfoTab = 'overview' | 'economy' | 'history' | 'gallery';

export interface MapLayerOption {
  key: MapLayerKey;
  label: string;
  icon: string;
}

export interface MapStat {
  label: string;
  value: string;
  icon: string;
}

export interface MapGalleryItem {
  title: string;
  imageUrl: string;
}

export interface MapRegionInfo {
  id: string;
  parentId?: string;
  level: MapLevel;
  typeLabel: string;
  name: string;
  capital?: string;
  area?: string;
  population?: string;
  imageUrl: string;
  summary: string;
  economy: string;
  history: string;
  stats: MapStat[];
  highlights: string[];
  gallery: MapGalleryItem[];
  childrenLabel?: string;
  nextLevel?: MapLevel;
}

export interface MapSearchResult {
  id: string;
  name: string;
  level: MapLevel;
  parentName?: string;
}

export interface MapBreadcrumbItem {
  id: string;
  label: string;
  level: MapLevel;
}

export interface LoadedMapLayer {
  level: MapLevel;
  parentId: string;
  data: GeoJSON.FeatureCollection;
}
