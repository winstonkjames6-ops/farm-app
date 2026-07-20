'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { T } from '@/lib/theme'

const VIEWPORT_SIZE = 280
const OUTPUT_SIZE = 400
const MIN_ZOOM = 1
const MAX_ZOOM = 3

function clamp(value: number, max: number): number {
  return Math.min(max, Math.max(-max, value))
}

export function AvatarCropModal({
  file,
  onSave,
  onCancel,
}: {
  file: File
  onSave: (blob: Blob) => void
  onCancel: () => void
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [saving, setSaving] = useState(false)
  const [dragging, setDragging] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; startOffset: { x: number; y: number } } | null>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function handleImageLoad() {
    const img = imgRef.current
    if (!img) return
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  const coverScale = naturalSize ? VIEWPORT_SIZE / Math.min(naturalSize.w, naturalSize.h) : 1
  const scale = coverScale * zoom
  const renderedW = naturalSize ? naturalSize.w * scale : 0
  const renderedH = naturalSize ? naturalSize.h * scale : 0
  const maxOffsetX = Math.max(0, (renderedW - VIEWPORT_SIZE) / 2)
  const maxOffsetY = Math.max(0, (renderedH - VIEWPORT_SIZE) / 2)

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, startOffset: offset }
    setDragging(true)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setOffset({
      x: clamp(dragRef.current.startOffset.x + dx, maxOffsetX),
      y: clamp(dragRef.current.startOffset.y + dy, maxOffsetY),
    })
  }

  function handlePointerUp() {
    dragRef.current = null
    setDragging(false)
  }

  function handleZoomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nextZoom = Number(e.target.value)
    setZoom(nextZoom)
    if (!naturalSize) return
    const nextScale = coverScale * nextZoom
    const nextRenderedW = naturalSize.w * nextScale
    const nextRenderedH = naturalSize.h * nextScale
    const nextMaxX = Math.max(0, (nextRenderedW - VIEWPORT_SIZE) / 2)
    const nextMaxY = Math.max(0, (nextRenderedH - VIEWPORT_SIZE) / 2)
    setOffset((o) => ({ x: clamp(o.x, nextMaxX), y: clamp(o.y, nextMaxY) }))
  }

  function handleSave() {
    if (!imgRef.current || !naturalSize) return
    setSaving(true)

    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setSaving(false)
      return
    }

    const outputScale = OUTPUT_SIZE / VIEWPORT_SIZE
    const drawW = renderedW * outputScale
    const drawH = renderedH * outputScale
    const drawX = OUTPUT_SIZE / 2 - drawW / 2 + offset.x * outputScale
    const drawY = OUTPUT_SIZE / 2 - drawH / 2 + offset.y * outputScale

    ctx.drawImage(imgRef.current, drawX, drawY, drawW, drawH)

    canvas.toBlob((blob) => {
      setSaving(false)
      if (blob) onSave(blob)
    }, 'image/jpeg', 0.9)
  }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: '16px', padding: '24px',
        width: '360px', maxWidth: '100%',
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '18px',
          color: T.ink, marginBottom: '16px', textAlign: 'center',
        }}>
          Adjust photo
        </div>

        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            width: VIEWPORT_SIZE, height: VIEWPORT_SIZE, borderRadius: '50%',
            overflow: 'hidden', margin: '0 auto', position: 'relative',
            background: '#111827', cursor: dragging ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
        >
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={imageUrl}
              onLoad={handleImageLoad}
              alt=""
              draggable={false}
              style={{
                position: 'absolute', left: '50%', top: '50%',
                width: renderedW || undefined, height: renderedH || undefined,
                maxWidth: 'none',
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
                userSelect: 'none', pointerEvents: 'none',
              }}
            />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
          <span style={{ fontSize: '16px', color: T.ink3, lineHeight: 1 }}>−</span>
          <input
            type="range" min={MIN_ZOOM} max={MAX_ZOOM} step={0.01}
            value={zoom} onChange={handleZoomChange}
            style={{ flex: 1, accentColor: T.cyan }}
          />
          <span style={{ fontSize: '16px', color: T.ink3, lineHeight: 1 }}>+</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            onClick={onCancel}
            disabled={saving}
            style={{
              flex: 1, height: '44px', padding: '0 20px',
              background: 'transparent', color: T.ink2,
              border: '1px solid rgba(0,0,0,0.12)', borderRadius: '8px',
              fontSize: '14px', fontFamily: "'Hanken Grotesk', sans-serif",
              cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1,
            }}
          >Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !naturalSize}
            style={{
              flex: 1, height: '44px', padding: '0 20px',
              background: T.cyan, color: '#FFFFFF',
              border: 'none', borderRadius: '8px',
              fontSize: '14px', fontFamily: "'Hanken Grotesk', sans-serif",
              cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
            }}
          >{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
