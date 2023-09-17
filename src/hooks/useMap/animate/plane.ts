/**
 * 这段代码是用于在地图上添加飞机标记并进行飞行动画的功能。下面是它的主要功能和解释：
 *
 * 导入了一些 ol（OpenLayers）库中的模块和自定义的一些函数和常量。
 *
 * 定义了一个常量 Duration，表示飞行动画的持续时间，单位是毫秒（2500毫秒，即2.5秒）。
 *
 * 创建了一个名为 AnimateStatusMap 的 WeakMap，用于存储每个飞机标记的动画状态。这个 WeakMap 会将每个标记的唯一标识（key）与动画状态关联起来。
 *
 * 定义了一个名为 AddPlaneFeature 的函数，用于添加飞机标记并启动飞行动画。主要功能包括：
 *
 * 检查传入的事件对象 event 是否包含有效的坐标信息（event.coords），如果没有，则不执行后续操作。
 *
 * 从事件对象中获取唯一标识 key。
 *
 * 检查 AnimateStatusMap 中是否已经存在与 key 相关联的动画状态，如果已存在，则表示动画已经在运行中，不执行后续操作。
 *
 * 将传入的坐标信息 event.coords 从 EPSG3857 坐标系转换为 EPSG4326 坐标系，并计算飞机图标的旋转角度（degrees），以确保飞机的方向与飞行方向一致。
 *
 * 创建一个新的飞机标记 feature，设置其几何属性为一个空点要素（Point）。然后创建飞机标记的样式 style，包括图标（Icon）的路径、缩放比例以及旋转角度。
 *
 * 将飞机标记添加到指定的数据源 source 中。
 *
 * 将与 key 相关联的动画状态设置为 true，表示动画已启动。
 *
 * 获取线要素 lineFeature 中的坐标信息，并调用 PlayAnimate 函数来执行飞行动画。动画完成后，调用回调函数 callback 来移除飞机标记并将动画状态重置为 false。
 *
 * 定义了一个名为 PlayAnimate 的函数，用于执行飞行动画。主要功能包括：
 *
 * 计算动画开始的时间戳 startTime，并初始化一个变量 lastCoords 用于存储上一个坐标。
 *
 * 定义一个 animate 函数，用于执行动画逻辑。在 animate 函数中，计算当前时间与开始时间的时间差，然后根据时间差和动画持续时间计算出动画的进度 fraction，并根据进度选择合适的坐标。
 *
 * 更新飞机标记的位置，使其沿着路线飞行。同时，根据上一个坐标和当前坐标计算飞机的旋转角度，确保飞机的方向与飞行方向一致。
 *
 * 使用 requestAnimationFrame 来递归执行 animate 函数，实现动画效果。
 *
 * 当动画结束时，调用回调函数 callback 来执行清理工作。
 *
 * 这些函数共同实现了在地图上添加飞机标记，并通过动画效果使飞机沿着指定的路线飞行。这个功能通常用于展示飞行路径或航线等地理信息可视化效果。
 */


import {
  Feature,
  Style,
  Point,
  Icon,
  toRadians,
  transform,
  SourceVector,
  LineString,
} from "~/ol-imports";
import { EPSG3857, EPSG4326, START_POINT } from "../config";
import { InteractionEvent } from "../marker/interaction";
import { countDegrees } from "~/hooks/useMap/animate/handle";

export const Duration = 2500;
const AnimateStatusMap = new WeakMap();

export function AddPlaneFeature(
  event: InteractionEvent,
  source: SourceVector,
  lineFeature: Feature
) {
  if (!event?.coords) return;
  const key = event.info!;
  if (AnimateStatusMap.get(key)) return;

  const extent = transform(event?.coords, EPSG3857, EPSG4326);
  const degrees = countDegrees(START_POINT, extent);

  // 创建 icon
  const feature = new Feature({ geometry: new Point([]) });
  const style = new Style({
    image: new Icon({
      src: "/images/icons/plane.svg",
      scale: 1,
      rotation: toRadians(45 + 360 - degrees),
    }),
  });
  feature.setStyle(style);
  source.addFeature(feature);

  AnimateStatusMap.set(key, true);

  // 开启动画
  const line = lineFeature?.getGeometry();
  if (line instanceof LineString) {
    PlayAnimate(feature, line.getCoordinates(), () => {
      source.removeFeature(feature);
      AnimateStatusMap.set(key, false);
    });
  }
}

function PlayAnimate(
  feature: Feature,
  coordsList: number[][],
  callback: Function
) {
  let startTime = new Date().getTime();

  let lastCoords: number[];

  function animate() {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - startTime;
    const fraction = elapsedTime / Duration;
    const index = Math.round(coordsList.length * fraction);

    if (index < coordsList.length) {
      const geometry = feature.getGeometry();
      if (geometry instanceof Point) {
        geometry?.setCoordinates(coordsList[index]);
      }

      // 转向
      if (lastCoords) {
        const degrees = countDegrees(lastCoords, coordsList[index]);
        if (degrees > 0) {
          const radian = toRadians(45 + 360 - degrees);
          const image = (feature.getStyle() as Style)?.getImage();
          if (image) image.setRotation(radian);
        }
      }

      lastCoords = coordsList[index];

      requestAnimationFrame(animate);
    } else {
      callback();
    }
  }

  animate();
}
