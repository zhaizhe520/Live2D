//导入结构类型
import type { ObjectDirective, DirectiveBinding } from 'vue'
//导入打字效果函数 实现函数组合
import { useTypewriter } from './useTypewriter'
//暴露 displayText 实现封装函数之间的相互调用
export const { displayText: dialogText, typeText } = useTypewriter(50)

const defaultText = '';
(window as any).setLive2dText = (text: string) => {
  typeText(text)
}
//自定义结构类型

interface PetNovelElement extends HTMLElement {
  _handleMouseEnter?: () => void //扩展类型：用来存移入类型
  _handleMouseLeave?: () => void //扩展类型：用来存移出类型
  _hoverTimer?: number | null // 扩展类型：用来存悬停定时器
}
//暴露出封装脚本
export const vPetNovel: ObjectDirective<PetNovelElement, string | number> = {
  mounted(el: PetNovelElement, binding: DirectiveBinding<string | number>) {
    el._handleMouseEnter = () => {
      // 1. 每次移入时，先清除上一次没完成的定时器
      if (el._hoverTimer) clearTimeout(el._hoverTimer)

      // 2. 开启延迟：鼠标停留满 x00ms 才会触发打字
      el._hoverTimer = window.setTimeout(() => {
        if (binding.value !== undefined && binding.value !== null) {
          typeText(String(binding.value))
        }
      }, 200) // 👈 300毫秒延迟，可以根据习惯调大或调小
    }
    el._handleMouseLeave = () => {
      // 3. 鼠标离开时，立刻取消未执行的延时打字
      if (el._hoverTimer) {
        clearTimeout(el._hoverTimer)
        el._hoverTimer = null
      }
      
      // 恢复默认文本
      typeText(defaultText)
    }

    el.addEventListener('mouseenter', el._handleMouseEnter)
    el.addEventListener('mouseleave', el._handleMouseLeave)
  },

  unmounted(el: PetNovelElement) {
    if (el._hoverTimer) clearTimeout(el._hoverTimer)
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
