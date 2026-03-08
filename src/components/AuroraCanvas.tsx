'use client';
import { useEffect, useRef } from 'react';

interface AuroraCanvasProps {
    /** opacity of the canvas, default 0.75 */
    opacity?: number;
    /** set to true inside the (taller) splash hero; false for the terminal (100vh only) */
    tallMode?: boolean;
}

export default function AuroraCanvas({ opacity = 0.75, tallMode = false }: AuroraCanvasProps) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const c = ref.current;
        if (!c) return;
        const ctx = c.getContext('2d');
        if (!ctx) return;

        let id: number;
        let t = 0;

        const resize = () => {
            c.width = window.innerWidth;
            c.height = tallMode ? window.innerHeight * 3.5 : window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const orbs = [
            { x: 0.18, y: 0.12, r: 0.45, c1: '#7C3AED55', c2: '#4F46E522' },
            { x: 0.78, y: 0.08, r: 0.38, c1: '#FF8C0050', c2: '#FF2D5522' },
            { x: 0.5, y: 0.48, r: 0.5, c1: '#036980', c2: '#06B6D430' },
            { x: 0.08, y: 0.72, r: 0.32, c1: '#05966940', c2: '#10B98120' },
            { x: 0.88, y: 0.62, r: 0.42, c1: '#BE185D40', c2: '#7C3AED22' },
        ];

        const draw = () => {
            t += 0.003;
            ctx.clearRect(0, 0, c.width, c.height);
            orbs.forEach((o, i) => {
                const ox = (o.x + Math.sin(t * 0.7 + i * 1.3) * 0.1) * c.width;
                const oy = (o.y + Math.cos(t * 0.5 + i * 0.9) * 0.07) * c.height;
                const gr = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r * c.width);
                gr.addColorStop(0, o.c1);
                gr.addColorStop(0.5, o.c2);
                gr.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(ox, oy, o.r * c.width, 0, Math.PI * 2);
                ctx.fillStyle = gr;
                ctx.fill();
            });
            id = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(id);
            window.removeEventListener('resize', resize);
        };
    }, [tallMode]);

    return (
        <canvas
            ref={ref}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                opacity,
            }}
        />
    );
}
