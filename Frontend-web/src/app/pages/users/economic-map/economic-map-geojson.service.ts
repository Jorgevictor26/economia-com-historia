import { Injectable } from '@angular/core';
import { LoadedMapLayer, MapLevel } from './economic-map.models';

@Injectable({ providedIn: 'root' })
export class EconomicMapGeojsonService {
  private readonly cache = new Map<string, Promise<LoadedMapLayer>>();

  loadLayer(level: MapLevel, parentId: string): Promise<LoadedMapLayer> {
    const key = `${level}:${parentId}`;
    const cached = this.cache.get(key);

    if (cached) {
      return cached;
    }

    const request = fetch(this.layerUrl(level, parentId))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`GeoJSON indisponível: ${key}`);
        }

        return response.json() as Promise<GeoJSON.FeatureCollection>;
      })
      .then((data) => ({ level, parentId, data }));

    this.cache.set(key, request);
    return request;
  }

  clear(): void {
    this.cache.clear();
  }

  private layerUrl(level: MapLevel, parentId: string): string {
    if (level === 'province') {
      return '/data/economic-map/provinces.geojson';
    }

    return `/data/economic-map/${parentId}-${level}.geojson`;
  }
}

