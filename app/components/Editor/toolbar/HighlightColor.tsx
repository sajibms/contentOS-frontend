import { HexColorPicker } from 'react-colorful'
import { useState } from 'react'
import { type YooEditor, UI } from '@yoopta/editor'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'

const { Portal } = UI

const COLOR_PRESETS = {
  text: [
    { name: 'Default', value: '#030303' },
    { name: 'Gray', value: '#767572' },
    { name: 'Brown', value: '#956C57' },
    { name: 'Orange', value: '#C87630' },
    { name: 'Yellow', value: '#C09144' },
    { name: 'Green', value: '#548064' },
    { name: 'Blue', value: '#477CA4' },
    { name: 'Purple', value: '#A38BBD' },
    { name: 'Pink', value: '#B15587' },
    { name: 'Red', value: '#C3554D' },
    { name: 'OliveGreen', value: '#929544' },
    { name: 'CobaltBlue', value: '#275BAA' },
  ],
  background: [
    { name: 'Default', value: '#FFF' },
    { name: 'Gray', value: '#F1F1EF' },
    { name: 'Brown', value: '#F3EEEE' },
    { name: 'Orange', value: '#F8ECDF' },
    { name: 'Yellow', value: '#FAF3DD' },
    { name: 'Green', value: '#EEF3ED' },
    { name: 'Blue', value: '#E9F3F7' },
    { name: 'Purple', value: '#F6F3F8' },
    { name: 'Pink', value: '#F6F3F8' },
    { name: 'Red', value: '#F9F2F5' },
    { name: 'RoseMist', value: '#FAECEC' },
    { name: 'PowderBlue', value: '#EAF1FA' },
  ],
}

type Props = {
  editor: YooEditor
  highlightColors: React.CSSProperties
  onClose: () => void
  refs: { setFloating: (el: any) => void }
  floatingStyles: React.CSSProperties
}

const COLOR_PICKER_STYLES = {
  width: '100%',
  height: 170,
}

const HighlightColor = ({ editor, refs, floatingStyles, highlightColors = {} }: Props) => {
  const [tab, setTab] = useState<'text' | 'background'>('text')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [localColor, setLocalColor] = useState<string | null>(null)

  const debouncedUpdateColor = useDebouncedCallback(
    (type: 'color' | 'backgroundColor', color: string) => {
      const value = editor.formats.highlight.getValue()
      if (value?.[type] === color) {
        editor.formats.highlight.update({ ...highlightColors, [type]: undefined })
      } else {
        editor.formats.highlight.update({ ...highlightColors, [type]: color })
      }

      setLocalColor(null)
    },
    500,
  )

  const handleColorChange = (
    type: 'color' | 'backgroundColor',
    color: string,
    shouldDebounce?: boolean,
  ) => {
    if (shouldDebounce) {
      setLocalColor(color)
      debouncedUpdateColor(type, color)
    } else {
      const value = editor.formats.highlight.getValue()
      if (value?.[type] === color) {
        editor.formats.highlight.update({ ...highlightColors, [type]: undefined })
      } else {
        editor.formats.highlight.update({ ...highlightColors, [type]: color })
      }
    }
  }

  const getItemStyles = (type: 'color' | 'backgroundColor', color: string) => {
    const currentColor = localColor || highlightColors?.[type]
    const isActive = currentColor === color
    return {
      backgroundColor: color,
      border: isActive ? '2px solid #3b82f6' : '1px solid #e3e3e3',
      position: 'relative' as const,
    }
  }
  return (
    <Portal id="yoo-highlight-color-portal">
      <button
        type="button"
        style={floatingStyles}
        ref={refs.setFloating}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="z-50 w-[168px] top-0 left-0"
      >
        <div className="bg-[#FFFFFF] p-1 rounded-[7px] shadow-toolbarShadow border border-solid border-[#e5e7eb]">
          {/* Tabs */}
          <div className="p-[2px] bg-[#EFEFF1] rounded-[6px] mb-[10px] flex gap-1 relative overflow-hidden">
            {/* Animated background that moves with the selected tab */}
            <div
              className={`absolute rounded-[4px] bg-[#FFF] shadow-[0px_1.5px_3px_0px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-in-out top-[2px] bottom-[2px] w-1/2
          ${tab === 'text' ? 'translate-x-0' : 'translate-x-[calc(100%-4px)]'}`}
            />

            {/* Text Tab Button */}
            <button
              className="px-3 py-1 text-xs rounded-[4px] relative z-10 flex-1 text-[#666C79]"
              onClick={() => setTab('text')}
            >
              Text
            </button>

            {/* Background Tab Button */}
            <button
              className="px-3 py-1 text-xs rounded-[4px] relative z-10 flex-1 text-[#666C79]"
              onClick={() => setTab('background')}
            >
              BG
            </button>
          </div>

          {/* Presets Grid */}
          <div className="grid justify-items-center grid-cols-6 gap-1 mb-3">
            {COLOR_PRESETS[tab].map(({ name, value }) => (
              <button
                key={name}
                title={name}
                type="button"
                className="w-6 h-6 rounded transition-all hover:scale-110"
                style={getItemStyles(tab === 'text' ? 'color' : 'backgroundColor', value)}
                onClick={() =>
                  handleColorChange(tab === 'text' ? 'color' : 'backgroundColor', value)
                }
              />
            ))}
          </div>

          {/* Custom Color Section */}
          <div className="border-t w-full">
            <button
              className="text-xs text-[#666C79] flex items-center justify-between w-full"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              Color Picker
              {showColorPicker ? (
                <ChevronUpIcon width={12} color="#8C919A" />
              ) : (
                <ChevronDownIcon width={12} color="#8C919A" />
              )}
            </button>

            {showColorPicker && (
              <div className="mt-2">
                <HexColorPicker
                  color={
                    localColor ||
                    highlightColors[tab === 'text' ? 'color' : 'backgroundColor'] ||
                    '#000000'
                  }
                  onChange={color =>
                    handleColorChange(tab === 'text' ? 'color' : 'backgroundColor', color, true)
                  }
                  style={COLOR_PICKER_STYLES}
                />
              </div>
            )}
          </div>
        </div>
      </button>
    </Portal>
  )
}

export { HighlightColor }
