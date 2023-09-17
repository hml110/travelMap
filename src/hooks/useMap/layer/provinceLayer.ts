import { ALL_EXTENT } from "~/data/province";
import { Vector, SourceVector, GeoJSON, Map } from "~/ol-imports";
import { CreateLayerStyle } from "../style";
import { CreateAddLayerCache, LayerIndex } from ".";

export function SetupProvinceLayer(map: Map) {
  // 遍历所有省份
  for (const key in ALL_EXTENT) {
    // 创建一个矢量图层并指定数据源
    const layer = new Vector({
      source: new SourceVector({
        url: `/geojson/china/${key}.json`,
        format: new GeoJSON(),
      }),
      renderBuffer: 100, // 渲染缓冲区大小
    });

    // 缓存图层
    CreateAddLayerCache(LayerIndex.Second, key, layer);

    // 设置图层样式
    layer.setStyle(CreateLayerStyle);

    // 检查地图中是否已经包含该图层，如果没有，则添加图层到地图中
    if (!map.getLayers().getArray().includes(layer)) {
      map.addLayer(layer);
    }
  }
}


/**
 * 这个函数的主要功能是：
 *
 * 使用一个 for...in 循环遍历 ALL_EXTENT 对象中的省份信息，假设 ALL_EXTENT 包含了所有省份的相关数据。
 *
 * 对于每个省份，创建一个矢量图层（layer），并为该图层指定数据源，数据源使用了指定的 GeoJSON 文件路径（/geojson/china/${key}.json）作为数据来源，其中 ${key} 是当前省份的标识符。
 *
 * 设置图层的渲染缓冲区大小（renderBuffer），这是一个用于优化地图渲染性能的参数。
 *
 * 使用 CreateAddLayerCache 函数将每个图层添加到图层缓存中，将图层与一个索引（LayerIndex.Second）和省份的标识符关联起来。
 *
 * 为每个图层设置样式，样式通过 layer.setStyle(CreateLayerStyle) 来定义。
 *
 * 最后，检查地图中是否已经包含了当前图层，如果没有，则将该图层添加到地图中。
 *
 * 这个函数的作用是在地图上显示中国各个省份的地理数据，并为每个省份创建一个独立的图层。这些图层可以用于显示省份边界、填充颜色、添加交互效果等，以实现丰富的地图可视化。
 */
