"use client"
import React, { useRef, useState, useEffect } from 'react';
import { useWebSocket } from '@/components/WebSocketContext';

const GridGame: React.FC = () => {
    const { sendPaintLetterEvent, isConnected, mapData } = useWebSocket();

    const initialGrid = Array(100)
        .fill(null)
        .map(() => Array(100).fill(' '));

    const [grid, setGrid] = useState<string[][]>(initialGrid);
    const [scale, setScale] = useState(1); // Для масштабирования
    const gridRef = useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = useState(false); // Флаг для перетаскивания

    const startDragPosition = useRef({ x: 0, y: 0 });
    const startTranslate = useRef({ x: 0, y: 0 });
    const currentTranslate = useRef({ x: 0, y: 0 }); // Сохраняем текущее смещение

    // Функция для обновления символа
    const handleCellClick = (rowIndex: number, colIndex: number) => {
        const newGrid = [...grid];
        newGrid[rowIndex][colIndex] = 'X';
        if (isConnected) {
            sendPaintLetterEvent(colIndex, rowIndex)
            setGrid(newGrid);
        }
    };

    // Функция для обработки масштабирования в точке курсора
    const handleWheel = (e: React.WheelEvent) => {
        //e.preventDefault();
        const zoomSpeed = 0.001;
        const newScale = Math.max(0.1, scale - e.deltaY * zoomSpeed);

        // Позиция курсора относительно контейнера
        const rect = gridRef.current?.getBoundingClientRect();
        const mouseX = e.clientX - (rect?.left || 0);
        const mouseY = e.clientY - (rect?.top || 0);

        // Коэффициент изменения масштаба
        const scaleRatio = newScale / scale;

        // Корректируем позицию, чтобы масштабирование происходило относительно точки курсора
        currentTranslate.current = {
            x: currentTranslate.current.x - mouseX * (scaleRatio - 1),
            y: currentTranslate.current.y - mouseY * (scaleRatio - 1),
        };

        // Обновляем масштаб и применяем трансформации
        setScale(newScale);
        applyTransforms();
    };

    // Функция для применения transform
    const applyTransforms = () => {
        if (gridRef.current) {
            gridRef.current.style.transform = `translate(${currentTranslate.current.x}px, ${currentTranslate.current.y}px) scale(${scale})`;
        }
    };

    // Начало перемещения поля
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);

        // Захватываем начальную позицию мыши
        startDragPosition.current = {
            x: e.clientX,
            y: e.clientY,
        };

        // Сохраняем текущее смещение
        startTranslate.current = {
            x: currentTranslate.current.x,
            y: currentTranslate.current.y,
        };
    };

    // Обработка перемещения поля
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;

        // Рассчитываем смещение
        const dx = e.clientX - startDragPosition.current.x;
        const dy = e.clientY - startDragPosition.current.y;

        // Применяем точное смещение
        currentTranslate.current = {
            x: startTranslate.current.x + dx,
            y: startTranslate.current.y + dy,
        };

        // Применяем новые трансформации
        applyTransforms();
    };

    // Завершение перемещения
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (gridRef.current) {
            gridRef.current.style.willChange = 'transform'; // Подсказка браузеру для оптимизации
        }
        if (isConnected && mapData) {
            mapData.payload.forEach((pair) => {
                const newGrid = [...grid];
                newGrid[pair.y][pair.x] = 'X';
                setGrid(newGrid);
            });
        }
    }, [isConnected, mapData]);

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                backgroundColor: 'black', // Черный фон
                display: 'flex',
                justifyContent: 'center', // Центрируем по горизонтали
                alignItems: 'center', // Центрируем по вертикали
                position: 'relative',
            }}
            onWheel={handleWheel}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp} // Чтобы завершить перетаскивание, если мышь вышла за пределы окна
        >
            <div
                ref={gridRef}
                onMouseDown={handleMouseDown}
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(100, 20px)`,
                    gridGap: '2px',
                    transform: `translate(${currentTranslate.current.x}px, ${currentTranslate.current.y}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    cursor: isDragging ? 'grabbing' : 'grab', // Изменяем курсор в зависимости от состояния
                    backgroundColor: 'white', // Белое полотно
                    //padding: '10px', // Дополнительное пространство вокруг полотна
                }}
            >
                {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                            style={{
                                width: '20px',
                                height: '20px',
                                //border: '1px solid black',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            {cell}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GridGame;
