import { useRef } from 'react'

interface Props {
  selectedIds: Set<string>
  onSelect: (ids: string[], isDelete?: boolean) => void
  isResultView: boolean
  resultString: string[]
  startingTimes: number[]
  timeInterval: number
  timeSize: number
}

export default function TimeSelectTable({
  selectedIds,
  onSelect,
  isResultView,
  resultString,
  timeInterval,
  timeSize,
  startingTimes = [],
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const cellsWrapperRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef<boolean>(false)
  const scrollPositionRef = useRef({
    left: 0,
    top: 0,
    x: 0,
    y: 0,
  })
  const isSelectingRef = useRef<boolean>(false)
  const selectStartCoors = useRef<{ row: number; col: number; isDelete: boolean }>()
  const prevCellRef = useRef<string>()

  const columnsCount = startingTimes.length
  const rowsCount = Math.floor(timeSize / timeInterval)
  const startingHours = new Date(startingTimes[0] ?? Date.now()).getHours()
  const startingMinutes = new Date(startingTimes[0] ?? Date.now()).getMinutes()
  const isOddLabelStart = startingMinutes ? 1 : 0

  const cellIds = new Array(rowsCount).fill(0).map(() => new Array(columnsCount))
  for (let col = 0; col < columnsCount; col++) {
    for (let row = 0; row < rowsCount; row++) {
      cellIds[row][col] = String((startingTimes[col]! + timeInterval * row) / 1000)
    }
  }

  function handleDragStartForScroll(e: any) {
    const target = wrapperRef.current
    if (!target) return
    isDraggingRef.current = true

    const clientX = e.clientX ?? e?.touches?.[0]?.clientX
    const clientY = e.clientY ?? e?.touches?.[0]?.clientY
    scrollPositionRef.current = {
      left: target.scrollLeft,
      top: target.scrollTop,
      // Mouse or touch position
      x: clientX,
      y: clientY,
    }
  }

  // TODO: RAF 사용
  function handleDragForScroll(e: any, isVerticalScroll = true) {
    if (!isDraggingRef.current) return
    const target = wrapperRef.current
    if (!target) return
    const clientX = e.clientX ?? e?.touches?.[0]?.clientX
    const clientY = e.clientY ?? e?.touches?.[0]?.clientY

    const dx = clientX - scrollPositionRef.current.x
    const dy = clientY - scrollPositionRef.current.y

    if (isVerticalScroll) {
      target.scrollTop = scrollPositionRef.current.top - dy
      return
    }
    const updatedScrollLeft = scrollPositionRef.current.left - dx

    if (updatedScrollLeft < 0) return
    target.scrollLeft = scrollPositionRef.current.left - dx
  }

  function handleDragEndForScroll() {
    isDraggingRef.current = false
  }

  function handleSelectStart(e: any) {
    if (isSelectingRef.current) return
    const { col, row } = e.target.dataset
    if (!col || !row) return
    isSelectingRef.current = true
    const cellId = cellIds[row][col]
    const isDelete = selectedIds.has(cellId)
    selectStartCoors.current = { col, row, isDelete }
    prevCellRef.current = cellId
    onSelect([cellIds[row][col]])
  }

  // TODO: RAF
  function handleWhileSelect(e: any) {
    if (!isSelectingRef.current) return
    const { col, row } = e.target.dataset
    if (!col || !row) return
    const cellId = cellIds[row][col]
    if (prevCellRef.current === cellId) return
    prevCellRef.current = cellId

    const smallerCol = Math.min(col, selectStartCoors.current?.col ?? col)
    const biggerCol = Math.max(col, selectStartCoors.current?.col ?? col)
    const smallerRow = Math.min(row, selectStartCoors.current?.row ?? row)
    const biggerRow = Math.max(row, selectStartCoors.current?.row ?? row)

    const selectedCellIds = []

    for (let col = smallerCol; col <= biggerCol; col++) {
      for (let row = smallerRow; row <= biggerRow; row++) {
        selectedCellIds.push(cellIds[row][col])
      }
    }

    onSelect(selectedCellIds, selectStartCoors.current?.isDelete ?? false)
  }

  // TODO: RAF
  function handleWhileSelectTouch(e: any) {
    if (!isSelectingRef.current) return
    const documentTouchMoveX = e.changedTouches[e.changedTouches.length - 1].clientX
    const documentTouchMoveY = e.changedTouches[e.changedTouches.length - 1].clientY
    const targetCell = document.elementFromPoint(documentTouchMoveX, documentTouchMoveY) as HTMLDivElement
    const dataset = targetCell?.dataset
    if (!dataset) return
    const { col, row, time } = dataset
    if (!col || !row || !time) return
    const cellId = time
    if (prevCellRef.current === cellId) return
    prevCellRef.current = cellId

    const smallerCol = Math.min(Number(col), selectStartCoors.current?.col ?? Number(col))
    const biggerCol = Math.max(Number(col), selectStartCoors.current?.col ?? Number(col))
    const smallerRow = Math.min(Number(row), selectStartCoors.current?.row ?? Number(row))
    const biggerRow = Math.max(Number(row), selectStartCoors.current?.row ?? Number(row))

    const selectedCellIds = []

    for (let col = smallerCol; col <= biggerCol; col++) {
      for (let row = smallerRow; row <= biggerRow; row++) {
        selectedCellIds.push(cellIds[row][col])
      }
    }

    onSelect(selectedCellIds, selectStartCoors.current?.isDelete ?? false)
  }

  function handleSelectEnd() {
    isSelectingRef.current = false
  }

  // 왜 별다른 Pointer Capturing 없이 이렇게 release 만 해도 잘 되는지 모르겠지만 일단 되니까 사용
  function handleSelectPointerLeave(e: any) {
    if (!isSelectingRef.current) return
    cellsWrapperRef.current?.releasePointerCapture(e.pointerId)
    isSelectingRef.current = false
  }

  function renderColors(col: number, row: number): string {
    const resultNumber = resultString?.[col]?.[row]
    if (!resultNumber || !Number(resultNumber)) return ''
    const colors = ['', '#a7f3d0', '#6ee7b7', '#059669']
    if (typeof Number(resultNumber) !== 'number') return ''
    //@ts-ignore
    return colors[resultNumber]
  }

  return (
    <div ref={wrapperRef} className="relative flex w-full max-h-full overflow-auto" style={{ touchAction: 'none' }}>
      <div className="w-16 flex-shrink-0 flex-grow-0 sticky left-0 z-10">
        <div
          onDrag={() => false}
          onPointerDown={handleDragStartForScroll}
          onPointerMove={handleDragForScroll}
          onPointerLeave={handleDragEndForScroll}
          onPointerCancel={handleDragEndForScroll}
          onPointerUp={handleDragEndForScroll}
          className=" bg-white "
        >
          <div className="h-6 flex-shrink-0 border-r first:border-t"></div>
          <div className="h-6 flex-shrink-0 border-r first:border-t"></div>

          {[...Array(rowsCount)].map((_e, i2) => (
            <div key={i2} className="h-7 flex-shrink-0 border-r first:border-t last:border-b relative select-none">
              {i2 % 2 === isOddLabelStart ? (
                <span className="absolute left-5 -top-3">
                  {`${startingHours + Math.ceil(i2 / 2)}`.padStart(2, '0')}시
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div ref={cellsWrapperRef} onPointerLeave={handleSelectPointerLeave} className="flex-grow flex">
        {startingTimes.map((startingTime, coloumnNumber) => (
          <div
            key={coloumnNumber}
            className="flex flex-col flex-shrink-0 flex-grow-0 w-1/4"
            style={{ width: columnsCount > 4 ? '24%' : '25%' }}
          >
            <div
              onPointerDown={handleDragStartForScroll}
              onPointerMove={e => handleDragForScroll(e, false)}
              onPointerLeave={handleDragEndForScroll}
              onPointerCancel={handleDragEndForScroll}
              onPointerUp={handleDragEndForScroll}
              className="bg-white sticky top-0"
            >
              <div className="flex-shrink-0 flex-grow-0 h-6 border-t border-r text-center select-none font-bold">
                {`${`${new Date(startingTime).getMonth() + 1}`.padStart(2, '0')}.${`${new Date(
                  startingTime,
                ).getDate()}`.padStart(2, '0')}`}
              </div>
              <div className="flex-shrink-0 flex-grow-0 h-6 border-b border-r text-center select-none text-sm">
                {'일월화수목금토'[new Date(startingTime).getDay()]}
              </div>
            </div>

            <div
              onPointerDown={isResultView ? undefined : handleSelectStart}
              onMouseMove={isResultView ? undefined : handleWhileSelect}
              onTouchMove={isResultView ? undefined : handleWhileSelectTouch}
              onPointerUp={isResultView ? undefined : handleSelectEnd}
            >
              {[...Array(rowsCount)].map((_e, rowNumber) => (
                <div
                  key={String((startingTime + rowNumber * timeInterval) / 1000)}
                  data-col={coloumnNumber}
                  data-row={rowNumber}
                  data-time={(startingTime + rowNumber * timeInterval) / 1000}
                  className="flex-shrink-0 flex-grow-0 h-7 border-b border-r odd:border-dashed last-of-type:border-solid"
                  style={{
                    borderRight: '1px solid black',
                    backgroundColor: isResultView
                      ? renderColors(coloumnNumber, rowNumber) || 'white'
                      : selectedIds.has(String((startingTime + rowNumber * timeInterval) / 1000))
                      ? 'green'
                      : 'white',
                  }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
