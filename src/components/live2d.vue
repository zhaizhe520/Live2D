<script setup>
import { ref, onMounted, onUnmounted,} from 'vue'

// 引入封装好的 TS 文件
import { vPetNovel, dialogText } from './directives/vPetNovel'

import * as PIXI from 'pixi.js'
// 重点！！先挂载全局 PIXI，再导入 cubism4
window.PIXI = PIXI
import { Live2DModel } from 'pixi-live2d-display/cubism4'
//容器变量
const wrap = ref(null)
// app 舞台
let app = null

// 窗口大小改变时的适配函数
const handleResize = () => {
  if (!app ) return

  // 1. 获取当前屏幕的实时宽高
  const width = window.innerWidth
  const height = window.innerHeight

  // 2. 动态调整 Pixi 画布的像素大小（重画纸） 画纸不够大了 添加实时画纸
  app.renderer.resize(width, height)  
  // TODO: 优化实时监听
}
//DOM 挂载时
onMounted(async () => {
  // PIXI.VERSION 版本记录 不同版本 交互逻辑好底层结构发生了很大的变化
  console.log('当前使用的 PixiJS 版本:',PIXI.VERSION)
  const width = window.innerWidth
  const height = window.innerHeight
  // 创建APP canvas画布大小
  app = new PIXI.Application({
    width: width,
    height: height,
    backgroundAlpha: 0
  })
   
  //响应式渲染canvas到div dom元素里面
  wrap.value.appendChild(app.view)

  try {
    const model = await Live2DModel.from('/live2d/murasame/murasame.model3.json')
    app.stage.addChild(model)
    //默认 Hit Area（碰撞检测区域）与 Motion（动作）绑定逻辑 pixi-live2d-display/cubism4 

    //模型的视线聚焦函数清空 
    //model.focus = () => {}

    model.anchor.set(0.5, 0.5) // ✅ 拖拽建议将锚点设为中心点
    model.scale.set(0.17)
    //不能固定死
    model.x = width * 0.8
    model.y = height * 0.75

    // ==================== PixiJS v6.x 交互 ====================
    
    // 1. PixiJS v6 开启交互开关的标准写法
    model.interactive = true

    model.buttonMode = true // 在 v6 里开启鼠标悬浮手型光标
    // 状态控制变量
    let isDragging = false
    let dragOffsetX = 0
    let dragOffsetY = 0
    let longPressTimer = null
    let isLongPress = false

    // 指针按下（点击/拖拽开始）
    model.on('pointerdown', (event) => {
      isDragging = true
      isLongPress = false

      // ✅ PixiJS v6 核心点：从 event.data.global 获取坐标
      const { x, y } = event.data.global
      dragOffsetX = x - model.x
      dragOffsetY = y - model.y

      // 长按定时器（800ms 阈值）
      longPressTimer = setTimeout(() => {
        if (isDragging) {
          isLongPress = true
          console.log('长按')
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
        //谁live2d一起移动
        modelPos.value = { x: model.x, y: model.y }
      }
    })
    // 拖拽结束/抬起处理函数
    const onDragEnd = () => {
      if (!isDragging) return

      // 清除长按计时
      clearTimeout(longPressTimer)

      // 如果未触发长按，则判定为普通短按点击
      if (!isLongPress) {
        console.log('点击事件')
      }

      isDragging = false
      isLongPress = false
    }

    // 绑定抬起与移出区域事件，防止“漏抬”
    model.on('pointerup', onDragEnd)
    model.on('pointerupoutside', onDragEnd)

    // =============================================================

  } catch (error) {
    console.error('Live2D 模型加载失败:', error)
  }
  // 核心 2：监听浏览器 resize 事件 自动扩大
  window.addEventListener('resize', handleResize)
  
})
//DOM 销毁时
onUnmounted(() => {
  app?.destroy(true)
  window.removeEventListener('resize', handleResize)
})

  


//气泡坐标为模型中心
const modelPos = ref({ x: window.innerWidth * 0.8, y: window.innerHeight * 0.75 })
// 气泡默认坐标
</script>

<template>
  <!-- 父容器：跟随 Live2D 模型的物理坐标定位 -->
  <div 
    ref="wrap" 
    class="live2d-contain"
  >
    <!-- 动态气泡：气泡位置中心向上150计量单位 `modelPos.y-150`-->
    <div class="dialog" :style="{ left: `${modelPos.x+80}px`, top: `${modelPos.y-200}px` }">
      {{ dialogText }}
    </div>
  </div>

  <div class="dom" v-pet-novel="'Ciallo～(∠・ω< )⌒☆'">指我</div>
</template>

<style scoped>
/*清除内边距*/
body{
  margin:0;
  padding:0;
}
/*清除容器内边距*/
.live2d-contain{
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  overflow: hidden;
  z-index: 2;
}
/**背景框 气泡移动位置差距过大 */
.dialog {
  width: 200px;
  height: 80px;
   
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  padding: 10px 16px;
  background: rgba(203, 242, 158, 0.9);
  color: pink;
  border-radius: 8px;
  white-space: nowrap;
  z-index: -1;

  /* 这样气泡的右下角，就精准对齐在模型的 (x, y) 坐标了！ */
  transform: translate(-100%, -100%) translate(-10px, -10px);
}

.dom{
  width: auto;
  height: 30px;
  background-color: rgb(20, 124, 215);
  position: relative;
  z-index: 2;
  cursor: pointer;
}
</style>

