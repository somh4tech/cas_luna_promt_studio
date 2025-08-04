
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ResizableTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number
  maxRows?: number
}

const ResizableTextarea = React.forwardRef<HTMLTextAreaElement, ResizableTextareaProps>(
  ({ className, minRows = 3, maxRows = 20, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    
    React.useImperativeHandle(ref, () => textareaRef.current!, [])
    
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current
      if (!textarea) return
      
      // Reset height to auto to get the actual scroll height
      textarea.style.height = 'auto'
      
      // Calculate the number of rows based on line height
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
      const minHeight = lineHeight * minRows
      const maxHeight = lineHeight * maxRows
      
      // Set height based on scroll height, constrained by min/max
      const scrollHeight = textarea.scrollHeight
      
      if (scrollHeight <= maxHeight) {
        // Content fits within maxRows, expand textarea
        textarea.style.height = `${Math.max(scrollHeight, minHeight)}px`
        textarea.style.overflowY = 'hidden'
      } else {
        // Content exceeds maxRows, set to maxHeight and enable scrolling
        textarea.style.height = `${maxHeight}px`
        textarea.style.overflowY = 'auto'
      }
    }, [minRows, maxRows])
    
    React.useEffect(() => {
      adjustHeight()
    }, [props.value, adjustHeight])
    
    return (
      <textarea
        ref={textareaRef}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className
        )}
        onChange={(e) => {
          props.onChange?.(e)
          // Use setTimeout to ensure the value is updated before adjusting height
          setTimeout(adjustHeight, 0)
        }}
        {...props}
      />
    )
  }
)
ResizableTextarea.displayName = "ResizableTextarea"

export { ResizableTextarea }
