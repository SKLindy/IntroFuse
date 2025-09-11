'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Zap } from 'lucide-react'
import { ContentType } from '@/types/database'
import { toast } from 'sonner'

interface ScriptGeneratorProps {
  disabled: boolean
  onGenerate: (scripts: { short: string; long: string }) => void
  contentSource: string
  contentType: ContentType | null
  artist: string
  songTitle: string
  selectedStyle: string
}

export function ScriptGenerator({ 
  disabled, 
  onGenerate, 
  contentSource, 
  contentType, 
  artist, 
  songTitle, 
  selectedStyle 
}: ScriptGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (disabled) return

    setIsGenerating(true)
    
    try {
      // TODO: Implement actual script generation with Claude API
      const response = await fetch('/api/generate-scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentSource,
          contentType,
          artist,
          songTitle,
          selectedStyle,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate scripts')
      }

      const data = await response.json()
      
      onGenerate({
        short: data.shortScript,
        long: data.longScript,
      })
      
      toast.success('Scripts generated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate scripts')
      console.error('Script generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      onClick={handleGenerate}
      disabled={disabled || isGenerating}
      size="lg"
      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 px-8 py-3 text-lg font-semibold shadow-lg"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Generating Scripts...
        </>
      ) : (
        <>
          <Zap className="w-5 h-5 mr-2" />
          Generate Scripts
        </>
      )}
    </Button>
  )
}