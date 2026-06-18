import React, { useState, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import RestartAltIcon from '@mui/icons-material/RestartAlt'

const GRID_COLS = 12
const GRID_ROWS = 8

const ITEMS = [
  { id: 'desk', label: '🖥️ Desk', color: '#6366f1', width: 2, height: 1 },
  { id: 'chair', label: '🪑 Chair', color: '#8b5cf6', width: 1, height: 1 },
  { id: 'whiteboard', label: '📋 Whiteboard', color: '#0ea5e9', width: 2, height: 1 },
  { id: 'computer', label: '💻 Computer', color: '#10b981', width: 1, height: 1 },
  { id: 'plant', label: '🌿 Plant', color: '#22c55e', width: 1, height: 1 },
  { id: 'couch', label: '🛋️ Couch', color: '#f59e0b', width: 3, height: 1 },
  { id: 'table', label: '🍽️ Table', color: '#ec4899', width: 2, height: 2 },
  { id: 'lamp', label: '💡 Lamp', color: '#facc15', width: 1, height: 1 },
]

interface PlacedItem {
  uid: string
  itemId: string
  col: number
  row: number
}

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.25s ease-out;
`

const Panel = styled.div`
  background: rgba(15, 23, 42, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.6);
  padding: 28px;
  width: 90vw;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    background: linear-gradient(135deg, #818cf8, #c084fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-family: 'Poppins', sans-serif;
  }

  .actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
`

const ToolboxSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  h4 {
    margin: 0;
    font-size: 0.85rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
`

const ToolboxGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const ToolItem = styled.div<{ color: string }>`
  padding: 8px 14px;
  border-radius: 10px;
  background: ${({ color }) => color}22;
  border: 1px solid ${({ color }) => color}55;
  color: ${({ color }) => color};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: grab;
  user-select: none;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ color }) => color}44;
    border-color: ${({ color }) => color}88;
    transform: translateY(-1px);
  }

  &:active { cursor: grabbing; transform: scale(0.96); }
`

const CanvasArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  h4 {
    margin: 0;
    font-size: 0.85rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
`

const GridCanvas = styled.div`
  display: grid;
  grid-template-columns: repeat(${GRID_COLS}, 1fr);
  grid-template-rows: repeat(${GRID_ROWS}, 44px);
  gap: 3px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  padding: 8px;
`

const GridCell = styled.div<{ occupied: boolean; highlight: boolean }>`
  border-radius: 6px;
  background: ${({ occupied, highlight }) =>
    highlight
      ? 'rgba(99, 102, 241, 0.25)'
      : occupied
      ? 'transparent'
      : 'rgba(255, 255, 255, 0.03)'};
  border: 1px dashed ${({ highlight }) =>
    highlight ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.06)'};
  transition: background 0.1s;
`

const PlacedItemBlock = styled.div<{ col: number; row: number; colSpan: number; color: string }>`
  grid-column: ${({ col }) => col + 1} / span ${({ colSpan }) => colSpan};
  grid-row: ${({ row }) => row + 1} / span 1;
  background: ${({ color }) => color}33;
  border: 1.5px solid ${({ color }) => color}77;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ color }) => color};
  cursor: pointer;
  user-select: none;
  transition: all 0.15s;
  position: relative;
  z-index: 2;

  &:hover {
    background: ${({ color }) => color}55;
    border-color: ${({ color }) => color};
  }
`

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' | 'ghost' }>`
  padding: 8px 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  background: ${({ variant }) =>
    variant === 'primary'
      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
      : variant === 'danger'
      ? 'rgba(239, 68, 68, 0.15)'
      : 'rgba(255,255,255,0.06)'};
  color: ${({ variant }) =>
    variant === 'primary' ? 'white' : variant === 'danger' ? '#ef4444' : '#cbd5e1'};
  border: 1px solid ${({ variant }) =>
    variant === 'primary'
      ? 'transparent'
      : variant === 'danger'
      ? 'rgba(239,68,68,0.3)'
      : 'rgba(255,255,255,0.1)'};

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    opacity: 0.9;
  }
`

const SaveBadge = styled.div`
  font-size: 0.75rem;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: ${fadeIn} 0.3s ease-out;
`

interface Props {
  onClose: () => void
}

export default function CustomLayoutEditor({ onClose }: Props) {
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>(() => {
    try {
      const saved = localStorage.getItem('metamesh_room_layout')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [dragItem, setDragItem] = useState<string | null>(null)
  const [highlightCell, setHighlightCell] = useState<{ col: number; row: number } | null>(null)
  const [saved, setSaved] = useState(false)

  const getItemDef = (id: string) => ITEMS.find((i) => i.id === id)

  const isCellOccupied = useCallback(
    (col: number, row: number) => {
      return placedItems.some((p) => {
        const def = getItemDef(p.itemId)
        if (!def) return false
        return row === p.row && col >= p.col && col < p.col + def.width
      })
    },
    [placedItems]
  )

  const handleDrop = (col: number, row: number) => {
    if (!dragItem) return
    const def = getItemDef(dragItem)
    if (!def) return

    // Bounds check
    if (col + def.width > GRID_COLS || row + def.height > GRID_ROWS) return

    // Overlap check
    for (let c = col; c < col + def.width; c++) {
      if (isCellOccupied(c, row)) return
    }

    setPlacedItems((prev) => [
      ...prev,
      { uid: `${dragItem}_${Date.now()}`, itemId: dragItem, col, row },
    ])
    setSaved(false)
    setDragItem(null)
    setHighlightCell(null)
  }

  const handleRemove = (uid: string) => {
    setPlacedItems((prev) => prev.filter((p) => p.uid !== uid))
    setSaved(false)
  }

  const handleSave = () => {
    localStorage.setItem('metamesh_room_layout', JSON.stringify(placedItems))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleReset = () => {
    setPlacedItems([])
    setSaved(false)
  }

  // Build a set of occupied cells for rendering
  const occupiedCells = new Set<string>()
  placedItems.forEach((p) => {
    const def = getItemDef(p.itemId)
    if (!def) return
    for (let c = p.col; c < p.col + def.width; c++) {
      occupiedCells.add(`${c}_${p.row}`)
    }
  })

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Panel>
        <Header>
          <h2>🏠 Arrange Your Room</h2>
          <div className="actions">
            {saved && (
              <SaveBadge>
                <SaveIcon style={{ fontSize: 14 }} /> Saved!
              </SaveBadge>
            )}
            <ActionButton variant="ghost" onClick={handleReset}>
              <RestartAltIcon style={{ fontSize: 16 }} /> Reset
            </ActionButton>
            <ActionButton variant="primary" onClick={handleSave}>
              <SaveIcon style={{ fontSize: 16 }} /> Save Layout
            </ActionButton>
            <Tooltip title="Close">
              <IconButton onClick={onClose} style={{ color: '#94a3b8' }} size="small">
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </div>
        </Header>

        <ToolboxSection>
          <h4>🧰 Drag Items onto the Grid</h4>
          <ToolboxGrid>
            {ITEMS.map((item) => (
              <ToolItem
                key={item.id}
                color={item.color}
                draggable
                onDragStart={() => setDragItem(item.id)}
                onDragEnd={() => setDragItem(null)}
              >
                {item.label}
              </ToolItem>
            ))}
          </ToolboxGrid>
        </ToolboxSection>

        <CanvasArea>
          <h4>📐 Room Canvas — Click placed items to remove them</h4>
          <div style={{ position: 'relative' }}>
            <GridCanvas
              onDragOver={(e) => e.preventDefault()}
            >
              {/* Empty cells */}
              {Array.from({ length: GRID_ROWS }).map((_, row) =>
                Array.from({ length: GRID_COLS }).map((_, col) => {
                  const key = `${col}_${row}`
                  const isOccupied = occupiedCells.has(key)
                  const isHighlight =
                    highlightCell?.col === col && highlightCell?.row === row
                  return (
                    <GridCell
                      key={key}
                      occupied={isOccupied}
                      highlight={isHighlight}
                      style={{ gridColumn: col + 1, gridRow: row + 1 }}
                      onDragEnter={() => setHighlightCell({ col, row })}
                      onDragLeave={() => setHighlightCell(null)}
                      onDrop={(e) => {
                        e.preventDefault()
                        handleDrop(col, row)
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    />
                  )
                })
              )}

              {/* Placed items rendered as grid items */}
              {placedItems.map((p) => {
                const def = getItemDef(p.itemId)
                if (!def) return null
                return (
                  <PlacedItemBlock
                    key={p.uid}
                    col={p.col}
                    row={p.row}
                    colSpan={def.width}
                    color={def.color}
                    title="Click to remove"
                    onClick={() => handleRemove(p.uid)}
                  >
                    {def.label}
                  </PlacedItemBlock>
                )
              })}
            </GridCanvas>
          </div>
        </CanvasArea>

        <div style={{ fontSize: '0.75rem', color: '#475569', textAlign: 'center' }}>
          Tip: Drag items from the toolbox onto the grid. Click placed items to remove them. Your layout is saved locally.
        </div>
      </Panel>
    </Overlay>
  )
}
