import { Map, View, fromLonLat, transformExtent } from "~/ol-imports";
import {
  SetupBaseLayer,
  SetupProvinceLayer,
  SetupEventListener,
} from "./layer";
import { SetupMarkerLayer } from "./marker";
import { MAP_DEFAULT_OPTIONS } from "./config";
import { EPSG4326 } from "./config";
import { SetupLayerStyle } from "./style";
import { setupWindowEventListener } from "~/utils/window";
import { SetupLineLayer } from "./animate";


//创建地图
function CreateMap() {
  //这一行从名为 MAP_DEFAULT_OPTIONS 的对象中提取了一些默认的地图选项，
  // 包括地图中心点坐标 center、初始缩放级别 zoom、最小缩放级别 minZoom、
  // 最大缩放级别 maxZoom 和地图范围 extent。这些选项将在后续的地图配置中使用。
  const { center, zoom, minZoom, maxZoom, extent } = MAP_DEFAULT_OPTIONS;
  //这一行创建了一个新的地图对象，并将其赋值给名为 map 的变量。
  // 在创建地图时，传递了一个包含各种配置选项的对象，包括 target（目标 DOM 元素的 ID）、layers（地图图层数组）和 controls（地图控制器数组）等。
  const map = new Map({
    target: "map",
    layers: [],
    controls: [],
  });
  //这一行设置地图的视图（View）。它创建了一个新的视图对象（View）并将其传递给 map.setView() 方法。在视图的配置中，包括：
  // center: fromLonLat(center),将地图的中心点坐标从经度和纬度坐标转换为 OpenLayers 的默认坐标系（通常是 Web Mercator 投影），这是因为 OpenLayers 默认使用 Web Mercator 投影来表示地图数据。
  // zoom：设置地图的初始缩放级别。
  // minZoom 和 maxZoom：分别设置地图的最小和最大缩放级别，限制用户可以缩放的范围。
  // constrainResolution: true：启用分辨率约束，确保地图以正确的分辨率渲染。
  // extent: transformExtent(extent, EPSG4326, map.getView().getProjection())：设置地图的范围（extent）
  // ，这里使用 transformExtent 函数将范围从经度和纬度坐标系（EPSG4326）转换为地图的当前投影坐标系。

  map.setView(
    new View({
      center: fromLonLat(center),
      zoom,
      minZoom,
      maxZoom,
      constrainResolution: true,
      extent: transformExtent(extent, EPSG4326, map.getView().getProjection()),
    })
  );
  return map;
}

export function SetupMap() {
  const map = ref<Map>();

  const { listen, watchWindowChange } = setupWindowEventListener();

  /**
   * 初始化地图
   * @constructor
   */
  function InitMap() {
    map.value = CreateMap();

    // layer
    SetupBaseLayer(map.value);
    SetupProvinceLayer(map.value);

    // marker
    const { preview } = SetupMarkerLayer(map.value, watchWindowChange);
    SetupLineLayer(map.value, preview);

    // map
    SetupEventListener(map.value);
    SetupLayerStyle();

    listen();
  }

  return { map, InitMap };
}
