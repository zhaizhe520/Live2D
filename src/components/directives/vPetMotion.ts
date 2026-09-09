// v-pet-motion 指令定义
export const vPetMotion = {
  mounted(el: HTMLElement, binding: any) {
    let timer: number | null = null

    el.addEventListener('mouseenter', () => {
      timer = window.setTimeout(() => {
        const model = (window as any).live2dModel
        // 判断 window 上是否有实例
        if (model && binding.value) {
          // 直接调用 SDK 的 motion 方法
          model.motion(binding.value) 
        }
      }, 300)
    })

    el.addEventListener('mouseleave', () => {
      if (timer) clearTimeout(timer)
    })
  }
}