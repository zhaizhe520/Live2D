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

onMounted(async () => {
  // ✅不要把div当view！不写view，pixi自动生成canvas
  app = new PIXI.Application({
    width: 1000,
    height: 1000,
    backgroundAlpha: 0
  })
  // 将pixi自动创建的canvas DOM挂载到div里面
  wrap.value.appendChild(app.view)

  const model = await Live2DModel.from('/live2d/murasame/murasame.model3.json')
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

onUnmounted(()=>{
  app?.destroy(true)
})
</script>
