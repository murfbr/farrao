import React, { useRef, useEffect } from 'react'
import { Bold, Italic, Underline, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function RichTextEditor({
  value,
  onChange,
  readOnly,
}: {
  value: string
  onChange: (v: string) => void
  readOnly?: boolean
}) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || ''
      }
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const format = (command: string) => {
    document.execCommand(command, false)
    handleInput()
    editorRef.current?.focus()
  }

  return (
    <div className="border rounded-xl border-amber-200 bg-white/50 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all">
      {readOnly ? null : (
        <div className="flex gap-1 border-b border-amber-200 bg-orange-50/50 p-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-foreground/70 hover:text-primary hover:bg-orange-100"
            onClick={() => format('bold')}
            type="button"
            title="Negrito"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-foreground/70 hover:text-primary hover:bg-orange-100"
            onClick={() => format('italic')}
            type="button"
            title="Itálico"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-foreground/70 hover:text-primary hover:bg-orange-100"
            onClick={() => format('underline')}
            type="button"
            title="Sublinhado"
          >
            <Underline className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-amber-200 mx-1 self-center opacity-50" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-foreground/70 hover:text-primary hover:bg-orange-100"
            onClick={() => format('insertUnorderedList')}
            type="button"
            title="Lista em Tópicos"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      )}
      <div
        ref={editorRef}
        className={cn(
          "p-3 min-h-[100px] max-h-[250px] overflow-y-auto outline-none text-sm text-foreground/80 transition-colors [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          readOnly ? "bg-slate-50 opacity-80 cursor-not-allowed" : "bg-white/50 focus:bg-white"
        )}
        contentEditable={!readOnly}
        onInput={handleInput}
        onBlur={handleInput}
      />
    </div>
  )
}
