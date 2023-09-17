import {
  Feature,
  Vector,
  SourceVector,
  fromLonLat,
  Style,
  Icon,
  Point,
} from "~/ol-imports";
import { CreateMapMarkerData } from "~/utils";
import { START_POINT } from "../config";

/**
 * @abstract 创建标点图层
 * CreateMarkerLayer 函数用于创建标点图层，该图层是一个矢量图层（Vector Layer），用于显示多个标点要素。主要步骤如下：
 * 创建一个空的矢量图层容器 container，并将其作为图层容器初始化。
 * 调用 CreateMapMarkerData 函数获取标点数据列表 markerList。
 * 遍历标点数据列表，对每个标点数据调用 CreatePointFeature 函数创建标点要素，如果成功创建了标点要素，则将它添加到矢量图层容器的数据源中。
 * 调用 CreateLocationFeature 函数创建地图中心点的定位要素，并将其添加到矢量图层容器的数据源中。
 * 返回创建好的标点图层容器 container。
 */
export function CreateMarkerLayer() {
  const container = new Vector({
    source: new SourceVector(),
  });

  const markerList = CreateMapMarkerData();
  markerList.forEach((item) => {
    const pointFeature = CreatePointFeature(item);
    if (pointFeature) container.getSource()?.addFeature(pointFeature);
  });

  const location = CreateLocationFeature();
  container.getSource()?.addFeature(location);

  return container;
}

/**
 * @abstract 创建点要素
 * CreatePointFeature 函数用于创建单个标点要素，接受一个 item 参数，其中包含了标点的相关信息。主要步骤如下：
 *
 * 检查 item 中是否包含有效的坐标信息（item.coords），如果没有有效坐标，则返回 null。
 *
 * 使用传入的坐标信息创建一个点要素（Point Feature），点要素的几何属性被设置为给定的坐标。
 *
 * 为点要素创建一个图标样式（Icon Style），这个样式通常包含了图标的外观，例如图标的图片、颜色、缩放比例、锚点位置等。
 *
 * 将图标样式应用到点要素上。
 *
 * 将包含了坐标和样式的点要素返回。
 */
export function CreatePointFeature(item: MarkerItem) {
  if (!item?.coords) return;

  // 创建一个点要素
  const pointFeature = new Feature({
    geometry: new Point(fromLonLat(item.coords)), // 设置点的坐标
    info: item,
  });

  // 创建一个图标样式
  const iconStyle = new Style({
    image: new Icon({
      src: "/images/icons/marker.svg",
      color: "red",
      scale: 1,
      anchor: [0.15, 0.9], // 图标的锚点位置，[0.5, 1] 表示图标底部中心
    }),
  });
  pointFeature.setStyle(iconStyle);

  return pointFeature;
}

/***
 * CreateLocationFeature 函数用于创建地图中心点的定位要素，主要步骤如下：
 *
 * 使用预定义的地图中心点坐标（START_POINT）创建一个点要素。
 *
 * 为点要素创建一个图标样式，通常这个样式用于表示地图中心点的位置。
 *
 * 将图标样式应用到点要素上。
 *
 * 将包含了地图中心点坐标和样式的定位要素返回。
 * @constructor
 */
function CreateLocationFeature() {
  const feature = new Feature({
    geometry: new Point(fromLonLat(START_POINT)),
  });

  const iconStyle = new Style({
    image: new Icon({
      src: "/images/icons/location.svg",
      scale: 1,
      anchor: [0.5, 1],
    }),
  });
  feature.setStyle(iconStyle);

  return feature;
}
