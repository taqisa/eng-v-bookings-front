import { useState, useEffect, useRef, useCallback } from "react";
import "./DurationWheelPicker.css";

const hours = Array.from({ length: 4 }, (_, i) => i + 1);
const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

interface WheelProps {
 data: number[];
 value: number;
 onChange: (value: number) => void;
 unit: string;
 loop?: boolean;
}

const Wheel = ({ data, value, onChange, unit, loop = false }: WheelProps) => {
 const wheelRef = useRef<HTMLDivElement>(null);
 const itemHeight = 40;
 const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
 const isDragging = useRef(false);
 const startY = useRef(0);
 const startScrollTop = useRef(0);
 const velocityRef = useRef(0);
 const lastY = useRef(0);
 const lastTime = useRef(0);
 const animationFrame = useRef<number | null>(null);
 const paddingItems = loop ? Math.floor(data.length / 2) : 0;
 const displayData = loop
 ? [...data.slice(-paddingItems), ...data, ...data.slice(0, paddingItems)]
 : data;

 const scrollToIndex = useCallback(
 (index: number, behavior: ScrollBehavior = "smooth") => {
 if (!wheelRef.current) return;
 wheelRef.current.scrollTo({
 top: (loop ? index + paddingItems : index) * itemHeight,
 behavior,
 });
 },
 [loop, paddingItems]
 );

 const snapToClosestItem = useCallback(() => {
 if (!wheelRef.current) return;
 const scrollTop = wheelRef.current.scrollTop;
 let finalIndex = Math.round(scrollTop / itemHeight);
 if (loop) {
 finalIndex = (finalIndex - paddingItems + data.length) % data.length;
 } else {
 finalIndex = Math.max(0, Math.min(data.length - 1, finalIndex));
 }
 scrollToIndex(finalIndex);
 if (data[finalIndex] !== value) onChange(data[finalIndex]);
 }, [data, value, onChange, loop, paddingItems, scrollToIndex]);

 const inertialScroll = useCallback(() => {
 if (!wheelRef.current || !isDragging.current || Math.abs(velocityRef.current) < 0.1) {
 if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
 snapToClosestItem();
 return;
 }
 wheelRef.current.scrollTop += velocityRef.current;
 velocityRef.current *= 0.95;
 animationFrame.current = requestAnimationFrame(inertialScroll);
 }, [snapToClosestItem]);

 const handleScroll = () => {
 if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
 scrollTimeout.current = setTimeout(snapToClosestItem, 150);
 };

 const handleWheel = (e: WheelEvent) => e.preventDefault();

 const handleMouseDown = (e: MouseEvent) => {
 e.preventDefault();
 isDragging.current = true;
 startY.current = e.clientY;
 startScrollTop.current = wheelRef.current?.scrollTop || 0;
 lastY.current = e.clientY;
 lastTime.current = performance.now();
 velocityRef.current = 0;
 if (wheelRef.current) {
 wheelRef.current.style.cursor = "grabbing";
 wheelRef.current.style.scrollBehavior = "auto";
 }
 window.addEventListener("mousemove", handleMouseMove);
 window.addEventListener("mouseup", handleMouseUp);
 };

 const handleMouseMove = useCallback((e: MouseEvent) => {
 if (!isDragging.current || !wheelRef.current) return;
 const now = performance.now();
 const deltaTime = now - lastTime.current;
 const deltaY = e.clientY - lastY.current;
 if (deltaTime > 0) velocityRef.current = (deltaY / deltaTime) * 1000;
 wheelRef.current.scrollTop = startScrollTop.current - (e.clientY - startY.current);
 lastY.current = e.clientY;
 lastTime.current = now;
 }, []);

 const handleMouseUp = useCallback(
 (e: MouseEvent) => {
 isDragging.current = false;
 if (wheelRef.current) {
 wheelRef.current.style.cursor = "grab";
 wheelRef.current.style.scrollBehavior = "smooth";
 }
 window.removeEventListener("mousemove", handleMouseMove);
 window.removeEventListener("mouseup", handleMouseUp);
 const deltaY = e.clientY - startY.current;
 if (Math.abs(deltaY) < 5) {
 const clickedItem = (e.target as Element).closest(".wheel-item") as HTMLElement | null;
 if (clickedItem?.dataset.index) {
 const idx = parseInt(clickedItem.dataset.index, 10);
 onChange(data[loop ? (idx - paddingItems + data.length) % data.length : idx]);
 }
 } else {
 animationFrame.current = requestAnimationFrame(inertialScroll);
 }
 },
 [handleMouseMove, onChange, data, loop, paddingItems, inertialScroll]
 );

 const handleTouchStart = (e: TouchEvent) => {
 isDragging.current = true;
 startY.current = e.touches[0].clientY;
 startScrollTop.current = wheelRef.current?.scrollTop || 0;
 lastY.current = e.touches[0].clientY;
 lastTime.current = performance.now();
 velocityRef.current = 0;
 if (wheelRef.current) wheelRef.current.style.scrollBehavior = "auto";
 e.preventDefault();
 };

 const handleTouchMove = useCallback((e: TouchEvent) => {
 if (!isDragging.current || !wheelRef.current) return;
 const now = performance.now();
 const deltaTime = now - lastTime.current;
 const deltaY = e.touches[0].clientY - lastY.current;
 if (deltaTime > 0) velocityRef.current = (deltaY / deltaTime) * 1000;
 wheelRef.current.scrollTop = startScrollTop.current - (e.touches[0].clientY - startY.current);
 lastY.current = e.touches[0].clientY;
 lastTime.current = now;
 e.preventDefault();
 }, []);

 const handleTouchEnd = useCallback(
 (e: TouchEvent) => {
 isDragging.current = false;
 if (wheelRef.current) wheelRef.current.style.scrollBehavior = "smooth";
 const deltaY = e.changedTouches[0].clientY - startY.current;
 if (Math.abs(deltaY) < 5) {
 const touch = e.changedTouches[0];
 const clickedItem = document.elementFromPoint(touch.clientX, touch.clientY)?.closest(".wheel-item") as HTMLElement | null;
 if (clickedItem?.dataset.index) {
 const idx = parseInt(clickedItem.dataset.index, 10);
 onChange(data[loop ? (idx - paddingItems + data.length) % data.length : idx]);
 }
 } else {
 animationFrame.current = requestAnimationFrame(inertialScroll);
 }
 e.preventDefault();
 },
 [onChange, data, loop, paddingItems, inertialScroll]
 );

 useEffect(() => {
 const wheel = wheelRef.current;
 if (wheel) {
 wheel.addEventListener("touchstart", handleTouchStart, { passive: false });
 wheel.addEventListener("touchmove", handleTouchMove, { passive: false });
 wheel.addEventListener("touchend", handleTouchEnd);
 wheel.addEventListener("wheel", handleWheel, { passive: false });
 }
 return () => {
 if (wheel) {
 wheel.removeEventListener("touchstart", handleTouchStart);
 wheel.removeEventListener("touchmove", handleTouchMove);
 wheel.removeEventListener("touchend", handleTouchEnd);
 wheel.removeEventListener("wheel", handleWheel);
 }
 window.removeEventListener("mousemove", handleMouseMove);
 window.removeEventListener("mouseup", handleMouseUp);
 if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
 };
 }, [handleTouchMove, handleTouchEnd, handleMouseMove, handleMouseUp]);

 useEffect(() => {
 const idx = data.indexOf(value);
 if (idx !== -1 && !isDragging.current) scrollToIndex(idx);
 }, [value, data, scrollToIndex]);

 return (
 <div className="wheel-container">
 <div
 className="wheel-list"
 ref={wheelRef}
 onScroll={handleScroll}
 onMouseDown={handleMouseDown}
 style={{ cursor: "grab" }}
 >
 <div className="wheel-item-padding" />
 {displayData.map((item, idx) => (
 <div
 key={idx}
 data-index={idx}
 className={`wheel-item ${item === value ? "selected" : ""}`}
 >
 {item}
 </div>
 ))}
 <div className="wheel-item-padding" />
 </div>
 <div className="wheel-label">{unit}</div>
 </div>
 );
};

interface DurationWheelPickerProps {
 value: number;
 onChange: (value: number) => void;
 displayMode?: "inline" | "modal";
}

export default function DurationWheelPicker({
 value,
 onChange,
 displayMode = "inline",
}: DurationWheelPickerProps) {
 const [openPicker, setOpenPicker] = useState(displayMode === "inline");
 const inputRef = useRef<HTMLInputElement>(null);
 const pickerRef = useRef<HTMLDivElement>(null);
 const [selectedHour, setSelectedHour] = useState(Math.floor(value / 60) || 1);
 const [selectedMinute, setSelectedMinute] = useState(value % 60);

 useEffect(() => {
 const totalMinutes = selectedHour * 60 + selectedMinute;
 if (totalMinutes !== value) onChange(totalMinutes);
 }, [selectedHour, selectedMinute, onChange, value]);

 useEffect(() => {
 setSelectedHour(Math.floor(value / 60) || 1);
 setSelectedMinute(value % 60);
 }, [value]);

 useEffect(() => {
 const handleClickOutside = (e: MouseEvent) => {
 if (
 displayMode !== "inline" &&
 pickerRef.current &&
 !pickerRef.current.contains(e.target as Node) &&
 inputRef.current &&
 !inputRef.current.contains(e.target as Node)
 ) {
 setOpenPicker(false);
 }
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, [displayMode]);

 return displayMode === "inline" ? (
 <div className="duration-wheel-picker" ref={pickerRef}>
 <div className="highlight" />
 <Wheel data={hours} value={selectedHour} onChange={setSelectedHour} unit="ساعة" loop={true} />
 <Wheel data={minutes} value={selectedMinute} onChange={setSelectedMinute} unit="دقيقة" loop={true} />
 </div>
 ) : (
 <div className="picker-container">
 <input
 ref={inputRef}
 type="text"
 value={`${selectedHour} ساعة و ${selectedMinute} دقيقة`}
 onClick={() => setOpenPicker(true)}
 readOnly
 className="picker-input"
 />
 {openPicker && (
 <div className="picker-modal" ref={pickerRef}>
 <div className="duration-wheel-picker">
 <div className="highlight" />
 <Wheel data={hours} value={selectedHour} onChange={setSelectedHour} unit="ساعة" loop={true} />
 <Wheel data={minutes} value={selectedMinute} onChange={setSelectedMinute} unit="دقيقة" loop={true} />
 </div>
 <button className="picker-close-button" onClick={() => setOpenPicker(false)}>
 تم
 </button>
 </div>
 )}
 </div>
 );
}