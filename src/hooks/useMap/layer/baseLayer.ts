import { Map, GeoJSON, Vector, SourceVector, Group } from "~/ol-imports";
import { CreateLayerStyle } from "../style";
import { CreateAddLayerCache, LayerIndex } from ".";

export function SetupBaseLayer(map: Map) {
  // 创建三个矢量图层（亚洲、中国、日本）并加载地理数据
  const asiaLayer = CreateLayer("/geojson/asia.json");
  const chinaLayer = CreateLayer("/geojson/china.json");
  const japanLayer = CreateLayer("/geojson/japan.json");

  // 将图层添加到图层缓存中，每个图层都有一个索引（LayerIndex）和一个名称
  CreateAddLayerCache(LayerIndex.Zero, "asia", asiaLayer);
  CreateAddLayerCache(LayerIndex.First, "china", chinaLayer);
  CreateAddLayerCache(LayerIndex.Second, "japan", japanLayer);

  // 创建一个图层组（Layer Group），将三个图层添加到组中
  const layerGroup = new Group({
    layers: [asiaLayer, chinaLayer, japanLayer],
  });

  // 将图层组添加到地图对象中
  map.addLayer(layerGroup);
}

/**
 * 辅助函数 CreateLayer 的作用是创建一个矢量图层，
 * 该图层使用指定的地理数据文件（url 参数）作为数据源，以及一个样式（通过 layer.setStyle(CreateLayerStyle) 进行设置）。
 * @param url
 * @constructor
 */
function CreateLayer(url: string) {
  const layer = new Vector({
    source: new SourceVector({
      url,
      format: new GeoJSON(),
    }),
  });

  layer.setStyle(CreateLayerStyle);

  return layer;
}
