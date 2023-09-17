<script setup lang="ts">
const route = useRoute();
const imageModel = ref<HTMLImageElement>();

// 监听点击事件，当点击页面上的元素时触发。
useEventListener("click", async (e) => {
  const path = Array.from(e.composedPath());
  const first = path[0];
  if (!(first instanceof HTMLElement)) return;
  if (first.tagName !== "IMG") return;
  if (
    path.some(
      (el) => el instanceof HTMLElement && ["A", "BUTTON"].includes(el.tagName)
    )
  )
    return;
  if (
    !path.some(
      (el) => el instanceof HTMLElement && el.classList.contains("prose")
    )
  )
    return;

  // Do not open image when they are moving. Mainly for mobile to avoid conflict with hovering behavior.
  const pos = first.getBoundingClientRect();
  await new Promise((resolve) => setTimeout(resolve, 50));
  const newPos = first.getBoundingClientRect();
  if (pos.left !== newPos.left || pos.top !== newPos.top) return;

  imageModel.value = first as HTMLImageElement;
});

//监听键盘按键事件，当按下 Escape 键时触发。用于关闭显示的图片。
onKeyStroke("Escape", (e) => {
  if (imageModel.value) {
    imageModel.value = undefined;
    e.preventDefault();
  }
});
</script>

<template>
<!--  渲染一个自定义的 <nav-bar> 组件，可能是顶部导航栏。-->
  <nav-bar />
  <main class="w-full relative of-x-hidden">
<!--    渲染一个自定义的 <Header> 组件，可能是页面的头部。-->
    <Header />
<!--     这是 Vue Router 的核心部分，用于渲染当前路由匹配到的组件。这个组件会根据当前路由动态地显示不同的内容。-->
    <router-view />
    <Footer v-if="route.path != '/travel'" />
  </main>
<!--  这是 Vue 3 内置的过渡动画组件，用于在元素进入和离开 DOM 时应用过渡效果。-->
  <Transition name="fade">
    <div
      v-if="imageModel"
      class="fixed top-0 left-0 right-0 bottom-0 z-500 backdrop-blur-7"
      @click="imageModel = undefined"
    >
      <div class="absolute top-0 left-0 right-0 bottom-0 bg-black:30 z--1" />
      <img
        :src="imageModel.src"
        :alt="imageModel.alt"
        class="w-full h-full object-contain"
      />
    </div>
  </Transition>
</template>
