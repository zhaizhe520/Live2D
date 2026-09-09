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

试着打印一下
```
import * as PIXI from 'pixi.js';
///cubism4 第4代核心
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

//wrap 变量 响应式 塞入 div 容器
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
<summary>窗口自适应与自动监听缩放画布</summary>

live2d的布局位置最怕写死固定

//handleResize() 自定义函数 实现resize监听事件
```
// 窗口大小改变时的适配函数
const handleResize = () => {
  if (!app) return

  // 1. 获取当前屏幕的实时宽高
  const width = window.innerWidth
  const height = window.innerHeight

  // 核心:动态调整 Pixi 画布的像素大小（重画纸）
  app.renderer.resize(width, height)
}
```

//挂载时两量监听浏览器窗口
```
onMounted(async()=>{
  const width = window.innerWidth
  const height = window.innerHeight
})
```

```
// 应用挂载时候 是实时宽高
 app = new PIXI.Application({
    width: width,
    height: height
  })
```
// 不能固定死 try model舞台设置  同步刷新时候 固定位置 不至于乱跑
```
    model.x = width * 0.8
    model.y = height * 0.75
```
最后 核心 监听浏览器 resize 事件 `window.addEventListener('resize', handleResize)`

最后的最后 unMounted 销毁一下 防止内存溢出

*存在问题*

每次缩小浏览器视窗 canvas画布 不会随着改变(或许改变了,不对啊，改变了为什么live2d还能再外面,没碰撞边界的问题？ ) 导致 live2d模型可能在已缩放的视窗外面 必须刷新才能解决 难道每次移动之后都要实现浏览器的刷新吗？

放大没有问题因为 `app.renderer.resize(width, height)` 监听事件会扩大画布的大小，可以自行移动到合适的位置 是不是没有碰撞边界的问题 希望这个需求可以解决




</details>


<details>
<summary>拖拽移动event.data.global</summary>

专有的事件数据对象

`v5 / v6 (当前使用的版本)	event.data.global.x / event.data.global.y` 

`v7/v8  pointerdown、pointermove、pointerup 等`

大致源码的实现效果,具体的请看开发环境和PixiJS版本

```
  
  try{
    //导入模型
    const model = await Live2DModel.from("")
    //舞台
    app.stage.addChild(model)

    // ==================== PixiJS v6.x 交互 ====================
    
    // 1. PixiJS v6 开启交互开关的标准写法
    model.interactive = true //开启交互
    model.buttonMode = true // 在 v6 里开启鼠标悬浮手型光标

    // 状态控制变量
    //是否正在拖拽
    let isDragging = false
    //拖拽坐标偏移量
    let dragOffsetX = 0
    let dragOffsetY = 0
    //长按定时器
    let longPressTimer = null
    是否触发了长按
    let isLongPress = false
    
    //model.on('事件名', (event) => { ... }) 事件监听语法

    // 指针按下（点击/拖拽开始）
    model.on('pointerdown', (event) => {
      isDragging = true
      isLongPress = false

      // ✅ PixiJS v6 核心点：从 event.data.global 获取坐标
      const { x, y } = event.data.global

      //偏差量（Offset） 防止拖动过程中 模型瞬移 没有拖拽过程
      dragOffsetX = x - model.x
      dragOffsetY = y - model.y

      // 长按定时器（800ms 阈值） 
      longPressTimer = setTimeout(() => {
        if (isDragging) {
          isLongPress = true
          console.log('触发长按！')
          // model.motion('TapBody') // 如果模型支持，可触发动作
        }
      }, 800)
    })

    // 指针移动（拖拽中）
    model.on('pointermove', (event) => {
      if (isDragging) {
        // ✅ PixiJS v6 核心点：从 event.data.global 获取坐标
        const { x, y } = event.data.global
        model.x = x - dragOffsetX
        model.y = y - dragOffsetY
      }
    })

    // 拖拽结束/抬起处理函数 
    const onDragEnd = () => {
      if (!isDragging) return

      // 清除长按计时 防止内存溢出
      clearTimeout(longPressTimer)

      // 如果未触发长按，则判定为普通短按点击
      if (!isLongPress) {
        console.log('普通点击！')
      }

      isDragging = false
      isLongPress = false
    }

    // 绑定抬起与移出区域事件，防止“漏抬”
    model.on('pointerup', onDragEnd)
    model.on('pointerupoutside', onDragEnd)

    // =============================================================
  }catch(error){
    console.error("模型移动加载失败",error)
  }

```
</details>


<details>
<summary>边缘碰撞检测（Boundary Limit）</summary>


</details>


<details>
<summary>气泡</summary>

*先让气泡“死死粘着”模型*

```
//先把画布坐标传给 Vue，让气泡固定模型中心 || 动态赋予ref() 可随着 live2d一起移动
const modelPos =ref({x: window.innerWidth * 0.8,y: window.innerHeight * 0.75})
```
```
//气泡容器 中心向上 150 计量单位 具体位置参考具体模型
<div class="dialog" :style="{ left: `${modelPos.x}px`, top: `${modelPos.y-150}px` }" ></div>
```

*一起移动*

 `pixijs`监听事件里 `pointermove` 赋值 `modelPos.value`

`modelPos.value = { x: model.x, y: model.y }`即可

</details>

<details>
<summary>字符串绑定DOM元素实现打字效果</summary>
指令封装 解耦 每个dom绑定事件 很麻烦

极致的解耦:单文件封装 ts文件封装

封装指令的本质就是vue导出一个对象，挂上函数，vue内部在对应的生命周期自动调用这些函数，传入` el、binding、vnode、prevVNode` 参数。

```
//引入2种数据类型
import type { ObjectDirective, DirectiveBinding } from 'vue'
import { ref } from 'vue'

// 1. 全局响应式气泡文本，供 Live2D 组件读取
export const dialogText = ref<string>('')

const defaultText = ''

// 2. 扩展 HTMLElement 接口，防止 TS 在 DOM 上挂载函数时报错
interface PetNovelElement extends HTMLElement {
  _handleMouseEnter?: () => void
  _handleMouseLeave?: () => void
}

// 3. 封装 TS 指令对象
export const vPetNovel: ObjectDirective<PetNovelElement, string | number> = {
  mounted(el: PetNovelElement, binding: DirectiveBinding<string | number>) {
    el._handleMouseEnter = () => {
      console.log('鼠标移入了！传入的值是：', binding.value,'类型为:' ,typeof('binding.value'))
      if (binding.value !== undefined && binding.value !== null) {
        dialogText.value = String(binding.value)
      }
    }

    el._handleMouseLeave = () => {
      dialogText.value = defaultText
    }

    el.addEventListener('mouseenter', el._handleMouseEnter)
    el.addEventListener('mouseleave', el._handleMouseLeave)
  },

  unmounted(el: PetNovelElement) {
    if (el._handleMouseEnter) {
      el.removeEventListener('mouseenter', el._handleMouseEnter)
      delete el._handleMouseEnter
    }
    if (el._handleMouseLeave) {
      el.removeEventListener('mouseleave', el._handleMouseLeave)
      delete el._handleMouseLeave
    }
  }
}
```

</details>

<details>
<summary>封装TS实现打字效果</summary>

跨函数之间的通信 组合式函数 与封装指令文件结合

```
import { ref } from 'vue'

export function useTypewriter(defaultSpeed = 50) {
  // 1. 用于渲染的响应式文本
  const displayText = ref<string>('')
  // 2. 内部定时器句柄
  let timer: number | null = null

  const typeText = (text: string, speed = defaultSpeed) => {
    // 每次开始新打字前，先清空上一次的定时器
    if (timer) clearInterval(timer)

    displayText.value = ''
    
    let index = 0

    timer = window.setInterval(() => {
      if (index < text.length) {
        displayText.value += text.charAt(index)
        index++
      } else {
        if (timer) clearInterval(timer)
        timer = null
      }
    }, speed)
  }

  return {
    displayText,
    typeText
  }
}
```

*防抖节流打字*

setTimeout(()=>{函数,200})


</details>


<details>
<summary>DOM元素绑定对应表情</summary>


</details>



<details>
<summary>接入LLM/agent</summary>


<details>
<summary>结合 TTS(语音合成)</summary>


</details>

<details>
<summary>流式传输(SSE / Stream Output)对应嘴型</summary>


</details>
<details>
<summary>Agent Function Calling(工具调用)</summary>


</details>
<details>
<summary>加载角色对应Skills</summary>


</details>

</details>








![效果预览图](./docs/images/Live2D.png) ![气泡预览图](./docs/images/Live2dDOM.png)

*参考仓库*

`https://github.com/guansss/pixi-live2d-display`

*免责声明*

示例的 Live2D 模型 Shizuku (Cubism 2.1) 和 Haru (Cubism 4) 遵守 Live2D 的 Free Material License

*官方网站*

`http://www.pixijs.com/`