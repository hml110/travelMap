import moment from "moment";
import routes from "pages-generated";

export const PageTagList: Set<string> = reactive(new Set());

/**
 * @description 获取地图标点
 * 定义了一个名为 CreateMapMarkerData 的函数，用于获取地图标点的数据。主要功能包括：
 *
 * 遍历 routes 数组中的每个路由对象。
 * 判断路由对象是否包含名字（name），并且名字包含字符串 "travel"，如果是，则表示这是与旅行相关的路由。
 * 提取路由的元信息（meta）中的前置信息（frontmatter），并将它们合并到一个新的标点对象中，同时添加路由路径（route）到标点对象中。
 * 将标点对象添加到 markerList 数组中。
 * 最后，对 markerList 数组进行按日期排序，并返回排序后的结果。
 * @returns 地图标点
 */
export function CreateMapMarkerData(): MarkerItem[] {
  const markerList: MarkerItem[] = [];
  routes.forEach((route) => {
    if (route.name?.toString().includes("travel")) {
      const frontmatter = route.meta?.frontmatter as Any;
      markerList.push({
        ...frontmatter,
        route: route.path,
      });
    }
  });
  return markerList.sort(
    (a, b) => moment(a.date).valueOf() - moment(b.date).valueOf()
  );
}

// 定义了一个名为 FilterRoute 的数组，其中包含了需要过滤的路由路径。
const FilterRoute = ["/", "/travel", "/blog"];

/**
 * 定义了一个名为 CreateArticleData 的函数，用于根据条件获取文章数据。主要功能包括：
 *
 * 创建一个空对象 data，用于存储按年份分组的文章数据。
 * 清空 PageTagList 集合，准备存储页面的标签信息。
 * 遍历 routes 数组中的每个路由对象。
 * 对每个路由对象提取元信息中的信息，如果信息有效并且路由路径不在 FilterRoute 中，则进行处理。
 * 如果指定了 type 参数，并且路由路径以 type 开头，则进行进一步的处理。
 * 如果指定了 tag 参数，并且信息中包含标签信息，且标签信息包含在 tag 中，则继续处理下一个路由。
 * 创建一个文章对象 item，包含标题、日期、路由路径和标签信息。
 * 根据文章的日期提取年份，将文章对象按年份分组存储到 data 对象中。
 * 最后，对 data 对象按年份降序排序，然后对每个年份的文章列表按日期降序排序，最终返回排序后的文章数据。
 * @param tag
 * @param type
 * @constructor
 */
export function CreateArticleData({ tag, type }: Any): ArticleItem[] {
  let data: Record<string, RouteMetaFrontmatter[]> = {};

  PageTagList.clear();

  for (const route of routes) {
    const info: RouteMetaFrontmatter = route?.meta?.frontmatter as Any;
    if (!info || !info.title || FilterRoute.includes(route.path)) continue;

    if (type && route.path.startsWith("/" + type)) {
      // 缓存 tag
      if (type) info?.tags?.forEach((tag) => PageTagList.add(tag));
      // 有tag筛选tag
      if (tag && info?.tags?.includes(tag)) continue;

      const item = {
        title: info?.title || "",
        date: info?.date || "",
        route: route?.path || "",
        tags: (info?.tags as [])?.filter((tag) => tag != "blog") || [],
      };

      const year = moment(item.date).get("year");

      if (data[year]) {
        data[year].push(item);
      } else {
        data[year] = [item];
      }
    }
  }

  return !!data
    ? Object.keys(data)
        .sort((a, b) => Number(b) - Number(a))
        .map((key) => ({
          year: key,
          list: data[Number(key)].sort(
            (a, b) => moment(b.date).valueOf() - moment(a.date).valueOf()
          ),
        }))
    : [];
}
