import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { uploadStorageFile } from '@/firebase/services'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void
  onError?: (error: any) => void
  storagePath: string | ((file: File) => string)
  maxSizeMB?: number
  maxWidthOrHeight?: number
  buttonContent: React.ReactNode
  buttonClassName?: string
  buttonVariant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'secondary'
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  id?: string
}

export function ImageUploader({
  onUploadSuccess,
  onError,
  storagePath,
  maxSizeMB = 1,
  maxWidthOrHeight = 1920,
  buttonContent,
  buttonClassName,
  buttonVariant = 'default',
  buttonSize = 'default',
  disabled = false,
  id,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    toast({
      title: 'Processando imagem...',
      description: 'Aguarde enquanto a imagem é otimizada.',
    })

    try {
      const options = {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker: true,
      }
      
      const compressedFile = await imageCompression(file, options)
      
      const path = typeof storagePath === 'function' ? storagePath(compressedFile) : storagePath
      const url = await uploadStorageFile(path, compressedFile as File)
      
      toast({
        title: 'Upload concluído! ✨',
        description: 'Imagem otimizada com sucesso.',
      })
      
      onUploadSuccess(url)
    } catch (error) {
      console.error('Upload Error:', error)
      toast({
        title: 'Erro no upload ❌',
        description: 'Não foi possível processar a imagem.',
        variant: 'destructive',
      })
      if (onError) onError(error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <input
        type="file"
        id={id}
        className="hidden"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />
      <Button
        variant={buttonVariant}
        size={buttonSize}
        className={cn(buttonClassName)}
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        type="button"
      >
        {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {buttonContent}
      </Button>
    </>
  )
}
