<details>
<summary>安装准备</summary>

框架： Vue 3 (Composition API)

渲染引擎： PixiJS v7+ (强大的 WebGL 渲染库) (版本冲突可能会出现`read(0)`索引0的问题) 具体

核心插件： pixi-live2d-display (连接 PixiJS 与 Live2D 的桥梁)

闭源核心:  Cubism SDK for Web
</details>

<details>
<summary>模型拿取</summary>

如果模型被编译过后 比如在steam 的Live2DViewerEX 里面拿到编译过的LPK文件模型

要 提取出标准的 .moc3 和 .json 资源

反编译开源官网 `https://github.com/ihopenot/LpkUnpacker` 

拿到的模型文件 放到 public/下 防止被 vite编译 导致失效

建议目录结构
```
public/
└── live2d/
|    └── 模型名字/             
|        ├── xxx.model3.json #这个是模型本体
|        ├── xxx.moc3
|        ├── xxx.png
|      
├── src/
│   └── components/
│       └── Live2D.vue      # 你的live2d组件
└── index.html 
```
</details>


<details>
<summary>项目构建</summary>

共需: 三额外依赖包 和一个 核心 和 Live2D模型
# 项目安装
`npm create vite@latest` 项目名字 //轻量

`npm create vue@latest` 项目名字  //完整

# 依赖库下载安装

```
npm install
npm install pixi.js@7 [npm install pixi.js@6.5.10]
//这个可能与pixi-live2d-display库不兼容 具体版本需要查看具体文档  
npm install pixi-live2d-display
npm install live2dcubismcore
```
# 核心下载安装

核心官网 : `https://www.live2d.com/zh-CHS/sdk/download/web/` 这个核心是闭源的

[非:Cubism SDK for Web]

版本尽可能 : ·`Cubism 5.3`或`Cubism 5.2` 太高版本可能会出现read(0)问题与pixi-live2d-display库不兼容

选: Cubism Core for Web  复制离线版本(有在线版本)JS文件 放到public/下  一定要放到public/下，否则会被vite编译 导致失效

```
public/
└── live2d/
```

在`index.html`文件里面 要让main.js 加载之前,需要确保 Live2D 的底层核心库已经加载

所以[在public/下]离线版的相对路径:`<script src="/live2dcubismcore.min.js"></script>`  放到 `<script type="module" src="/src/main.js"></script>`上面  `<head>` 里面即可

# 验证 安装

PixiJS和  pixi-live2d-display 连通性 会不会库不兼容

```
import * as PIXI from 'pixi.js';
///cubism4 是什么玩意
import { Live2DModel } from 'pixi-live2d-display/cubism4';  //第4代 其他几代底层渲染逻辑和数据结构相差很大
console.log('Pixi版本:', PIXI.VERSION);
console.log('Live2D模型类:', Live2DModel);
```
# 渲染到画布Canvs上 

```
<template>
  <div ref="wrap" style="width:1000px;height:1000px;"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as PIXI from 'pixi.js'
// 重点！！先挂载全局PIXI，再导入cubism4
window.PIXI = PIXI
import { Live2DModel } from 'pixi-live2d-display/cubism4'

const wrap = ref(null)

let app = null
//挂载 做异步等请求
onMounted(async () => {
  // ✅不要把div当view！不写view，pixi自动生成canvas 异步创建app应用
  app = new PIXI.Application({
    width: 1000,
    height: 1000,
    backgroundAlpha: 1
  })
  // 将pixi自动创建的canvas DOM挂载到div里面
  wrap.value.appendChild(app.view)
  // xxx.model3.json 同步等待加载
  const model = await Live2DModel.from('/live2d/xxx/xxx.model3.json')
  app.stage.addChild(model)
  // --------【在这里调，反复修改数字看效果】--------
  model.anchor.set(0, 0) // ✅定位基准切换到模型中心

  model.scale.set(0.2)   // 整体大小 0.2倍
  // model.scale.x = 0.22 // 如果你想单独横向加宽，打开这个
  // model.scale.y = 0.20 // 单独纵向拉高

  model.x = 400;   // 左右：画布宽800，400就是水平居中；加大往右，减小往左
  model.y = 300;   // 上下：画布高600，300就是垂直居中；加大往下，减小往上
  // ------------------------------------------------
})

//销毁 ?可选链操作符 防止没有挂载上就效果 导致线程阻塞BUG
onUnmounted(()=>{
  app?.destroy(true)
})
</script>
```
</details>

<details>
<summary>生产环境的小建议</summary>

加载 Live2D 属于异步网络请求 

如果用户的网速较慢或资源文件较大，网页会有一段时间的“空白等待期”。

在实际项目中，通常建议在异步加载前后加上 Loading 加载动画  `异步async false  await true `

</details>

<details>
<summary>字符串绑定DOM元素实现打字效果</summary>




</details>




![效果预览图](./docs/images/Live2D.png)