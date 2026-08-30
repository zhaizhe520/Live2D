<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as PIXI from 'pixi.js'
// 重点！！先挂载全局 PIXI，再导入 cubism4
window.PIXI = PIXI
import { Live2DModel } from 'pixi-live2d-display/cubism4'

const wrap = ref(null)
let app = null

onMounted(async () => {
  // PIXI.VERSION 版本记录 不同版本 交互逻辑好底层结构发生了很大的变化
  console.log('当前使用的 PixiJS 版本:',)
  // 创建APP canvas画布大小
  app = new PIXI.Application({
    width: 1000,
    height: 600,
    backgroundAlpha: 1
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
    model.scale.set(0.15)
    model.x = 200
    model.y = 300

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
})

onUnmounted(() => {
  app?.destroy(true)
})
</script>

<template>
  <div ref="wrap" style="width:100%;height:100vh;position:relative;"></div>
</template>

<style scoped>
/*清除内边距*/
body{
  margin:0;
  padding:0;
}

</style>