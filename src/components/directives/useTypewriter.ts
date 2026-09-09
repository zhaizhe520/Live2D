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