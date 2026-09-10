// vPetMotion.ts
export const vPetMotion = {
  mounted(el: HTMLElement, binding: any) {
    let timer: number | null = null

    el.addEventListener('mouseenter', () => {
      timer = window.setTimeout(() => {

        const model = (window as any).live2dModel

        if (!model || !binding.value) return

        // 如果传的是数组 ['xxx', 1]
        if (Array.isArray(binding.value)) {
          const [group, index] = binding.value
          model.motion(group, index)
        } else {
          // 如果传的是普通字符串 'xxx'
          model.motion(binding.value)
        }
      }, 300)
    })

    el.addEventListener('mouseleave', () => {
      if (timer) clearTimeout(timer)
    })
  }
}