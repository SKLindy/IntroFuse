'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { WritingStyle } from '@/types/database'

const PRESET_STYLES: WritingStyle[] = ['Conversational', 'Humorous', 'Thoughtful']

const STYLE_DESCRIPTIONS = {
  Conversational: 'Natural and approachable, like talking to a friend',
  Humorous: 'Witty and entertaining with clever observations and light humor',
  Thoughtful: 'Reflective and insightful, connecting deeper themes and meanings'
}

interface StyleSelectorProps {
  selectedStyle: string
  onStyleChange: (style: string) => void
}

export function StyleSelector({ selectedStyle, onStyleChange }: StyleSelectorProps) {
  return (
    <div className="space-y-3">
      {/* Preset Styles - Inline Layout */}
      <div className="flex gap-2">
        {PRESET_STYLES.map((style) => (
          <Button
            key={style}
            variant={selectedStyle === style ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStyleChange(style)}
            className="flex-1"
          >
            {style}
          </Button>
        ))}
      </div>

      {/* Style Description */}
      {selectedStyle && STYLE_DESCRIPTIONS[selectedStyle as WritingStyle] && (
        <div className="text-xs text-muted-foreground text-center">
          {STYLE_DESCRIPTIONS[selectedStyle as WritingStyle]}
        </div>
      )}
    </div>
  )
}