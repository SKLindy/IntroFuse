'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { WritingStyle } from '@/types/database'

const PRESET_STYLES: WritingStyle[] = ['Humorous', 'Casual', 'Thoughtful', 'Storytelling']

const STYLE_DESCRIPTIONS = {
  Humorous: 'Light-hearted and entertaining with wit and clever observations',
  Casual: 'Conversational and relatable, like talking to a friend',
  Thoughtful: 'Reflective and meaningful, connecting deeper themes',
  Storytelling: 'Narrative-driven with engaging anecdotes and context'
}

interface StyleSelectorProps {
  selectedStyle: string
  onStyleChange: (style: string) => void
}

export function StyleSelector({ selectedStyle, onStyleChange }: StyleSelectorProps) {
  const [showCustomStyles, setShowCustomStyles] = useState(false)

  return (
    <div className="space-y-4">
      {/* Preset Styles */}
      <div className="grid grid-cols-2 gap-2">
        {PRESET_STYLES.map((style) => (
          <Button
            key={style}
            variant={selectedStyle === style ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStyleChange(style)}
            className="justify-start h-auto p-3"
          >
            <div className="text-left">
              <div className="font-medium text-sm">{style}</div>
              <div className="text-xs text-muted-foreground mt-1 leading-tight">
                {STYLE_DESCRIPTIONS[style]}
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Custom Styles Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowCustomStyles(!showCustomStyles)}
        className="w-full justify-between"
      >
        Custom Styles
        {showCustomStyles ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {/* Custom Styles Section */}
      {showCustomStyles && (
        <div className="space-y-2 p-3 border rounded-md bg-muted/50">
          <div className="text-sm text-muted-foreground text-center">
            No custom styles created yet.
          </div>
          <Button size="sm" variant="outline" className="w-full">
            Create Custom Style
          </Button>
        </div>
      )}

      {/* Selected Style Display */}
      {selectedStyle && (
        <div className="text-center">
          <Badge variant="secondary" className="px-3 py-1">
            Selected: {selectedStyle}
          </Badge>
        </div>
      )}
    </div>
  )
}