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
      console.log('鼠标移入了！传入的值是：', binding.value)
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