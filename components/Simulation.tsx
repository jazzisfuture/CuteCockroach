import React, { useRef, useEffect, useState } from 'react';
import { SimulationConfig, Roach } from '../types';

interface SimulationProps {
  config: SimulationConfig;
}

export const Simulation: React.FC<SimulationProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roachesRef = useRef<Roach[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>(0);
  
  // Initialize or update roach count
  useEffect(() => {
    const currentCount = roachesRef.current.length;
    
    if (currentCount < config.count) {
      // Add more
      const toAdd = config.count - currentCount;
      for (let i = 0; i < toAdd; i++) {
        roachesRef.current.push(createRoach(window.innerWidth, window.innerHeight, config));
      }
    } else if (currentCount > config.count) {
      // Remove excess
      roachesRef.current = roachesRef.current.slice(0, config.count);
    }
  }, [config.count]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  };

  // Main Loop
  useEffect(() => {
    let time = 0;
    
    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency on bg
      if (!ctx) return;

      time += 0.1;

      // Clear background
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const roaches = roachesRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const mouse = mouseRef.current;

      // Spatial partitioning optimization (Grid) could go here for 1000+ units, 
      // but for <1000, O(N^2) with close neighbor check is okay-ish on modern JS engines 
      // providing we keep the neighbor radius small or optimize loops.
      // We'll stick to a simple loop for code clarity and assume reasonable counts (<1500).

      for (let i = 0; i < roaches.length; i++) {
        const roach = roaches[i];

        // --- Physics & Behaviors ---

        let sepX = 0, sepY = 0;
        let alignX = 0, alignY = 0;
        let cohX = 0, cohY = 0;
        let neighborCount = 0;

        // Optimization: Only check a subset or use a visual radius
        const visionRadius = 100; 
        const visionRadiusSq = visionRadius * visionRadius;

        // Simple Boids (Check against everyone else - optimized by distance check)
        // Note: For massive scale, QuadTree is needed.
        for (let j = 0; j < roaches.length; j++) {
            if (i === j) continue;
            
            const other = roaches[j];
            const dx = other.x - roach.x;
            const dy = other.y - roach.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < visionRadiusSq) {
                const dist = Math.sqrt(distSq);
                
                // Separation
                if (dist < 40) { // Personal bubble
                    sepX += (roach.x - other.x) / dist;
                    sepY += (roach.y - other.y) / dist;
                }

                // Alignment & Cohesion
                alignX += other.vx;
                alignY += other.vy;
                cohX += other.x;
                cohY += other.y;
                neighborCount++;
            }
        }

        if (neighborCount > 0) {
            alignX /= neighborCount;
            alignY /= neighborCount;
            cohX = (cohX / neighborCount) - roach.x;
            cohY = (cohY / neighborCount) - roach.y;
        }

        // Mouse Interaction
        let mouseForceX = 0;
        let mouseForceY = 0;
        
        if (config.interactionType !== 'none') {
            const mDx = mouse.x - roach.x;
            const mDy = mouse.y - roach.y;
            const mDist = Math.sqrt(mDx * mDx + mDy * mDy);
            
            if (mDist < 400) { // Interaction radius
                const strength = (400 - mDist) / 400; // Stronger when closer
                if (config.interactionType === 'attract') {
                    mouseForceX = (mDx / mDist) * strength * 2.0;
                    mouseForceY = (mDy / mDist) * strength * 2.0;
                } else {
                    mouseForceX = -(mDx / mDist) * strength * 5.0; // Repel stronger
                    mouseForceY = -(mDy / mDist) * strength * 5.0;
                }
            }
        }

        // Apply Forces
        roach.vx += (sepX * config.separation) + (alignX * config.alignment) + (cohX * config.cohesion) + mouseForceX;
        roach.vy += (sepY * config.separation) + (alignY * config.alignment) + (cohY * config.cohesion) + mouseForceY;

        // Speed Limit
        const speed = Math.sqrt(roach.vx * roach.vx + roach.vy * roach.vy);
        const maxSpeed = config.speed * roach.speedMultiplier;
        if (speed > maxSpeed) {
            roach.vx = (roach.vx / speed) * maxSpeed;
            roach.vy = (roach.vy / speed) * maxSpeed;
        } else if (speed < 1) {
             // Keep them moving a little bit
             roach.vx *= 1.1;
             roach.vy *= 1.1;
        }

        // Update Position
        roach.x += roach.vx;
        roach.y += roach.vy;

        // Screen Wrap
        if (roach.x < -roach.size) roach.x = width + roach.size;
        if (roach.x > width + roach.size) roach.x = -roach.size;
        if (roach.y < -roach.size) roach.y = height + roach.size;
        if (roach.y > height + roach.size) roach.y = -roach.size;

        // Update Rotation (smooth turn)
        const targetAngle = Math.atan2(roach.vy, roach.vx);
        // Simple lerp for rotation smoothing could go here, but direct assignment is snappy for bugs
        roach.angle = targetAngle + (Math.PI / 2); // Adjust because drawing is vertical

        // --- Drawing ---
        drawRoach(ctx, roach, time);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [config]); // Re-bind effect when config changes significantly, though useRefs handle values

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      className="absolute top-0 left-0 w-full h-full cursor-crosshair block"
    />
  );
};

// --- Helpers ---

const createRoach = (w: number, h: number, config: SimulationConfig): Roach => {
  const size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
  const colors = ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#654321'];
  return {
    id: Math.random(),
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 5,
    vy: (Math.random() - 0.5) * 5,
    size: size,
    angle: 0,
    wiggleOffset: Math.random() * 100,
    speedMultiplier: 0.8 + Math.random() * 0.4, // Some are faster
    color: colors[Math.floor(Math.random() * colors.length)]
  };
};

const drawRoach = (ctx: CanvasRenderingContext2D, roach: Roach, time: number) => {
    ctx.save();
    ctx.translate(roach.x, roach.y);
    ctx.rotate(roach.angle);

    const s = roach.size / 20; // scale factor based on reference size 20

    // Legs (Animated)
    ctx.lineWidth = 1.5 * s;
    ctx.strokeStyle = '#3e2723';
    ctx.lineCap = 'round';
    
    const wiggle = Math.sin(time + roach.wiggleOffset) * 0.2;
    const legSpeed = 15;
    const walk = Math.sin(time * legSpeed + roach.wiggleOffset);

    // Draw 3 pairs of legs
    for(let i = 0; i < 3; i++) {
        const yOffset = -5 * s + (i * 8 * s);
        const legLength = 12 * s;
        const legAngle = (0.5 + wiggle * (i % 2 === 0 ? 1 : -1)) + (walk * 0.2 * (i%2===0?1:-1));

        ctx.beginPath();
        // Left Leg
        ctx.moveTo(-4 * s, yOffset);
        ctx.lineTo(-4 * s - Math.cos(legAngle) * legLength, yOffset + Math.sin(legAngle) * legLength);
        ctx.stroke();

        ctx.beginPath();
        // Right Leg
        ctx.moveTo(4 * s, yOffset);
        ctx.lineTo(4 * s + Math.cos(legAngle) * legLength, yOffset + Math.sin(legAngle) * legLength);
        ctx.stroke();
    }

    // Antennae (Wiggly)
    ctx.beginPath();
    const antLen = 25 * s;
    const antWiggleL = Math.sin(time * 0.5 + roach.wiggleOffset) * 0.5;
    const antWiggleR = Math.cos(time * 0.5 + roach.wiggleOffset) * 0.5;

    // Left Antenna
    ctx.moveTo(-2 * s, -12 * s);
    ctx.quadraticCurveTo(-10 * s + (antWiggleL * 10), -20 * s, -5 * s + (antWiggleL * 20), -12 * s - antLen);
    
    // Right Antenna
    ctx.moveTo(2 * s, -12 * s);
    ctx.quadraticCurveTo(10 * s + (antWiggleR * 10), -20 * s, 5 * s + (antWiggleR * 20), -12 * s - antLen);
    ctx.stroke();


    // Body (Oval)
    ctx.fillStyle = roach.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7 * s, 14 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // Shell detail (shine)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.ellipse(-2*s, -3*s, 3 * s, 8 * s, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#3e2723'; // Darker head
    ctx.beginPath();
    ctx.ellipse(0, -12 * s, 5 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (Cute factor!)
    ctx.fillStyle = 'white';
    const eyeSize = 2.5 * s;
    const eyeY = -13 * s;
    const eyeX = 2.5 * s;

    // Left Eye
    ctx.beginPath();
    ctx.arc(-eyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Right Eye
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = 'black';
    const pupilSize = 1 * s;
    
    // Look at mouse (simplified: just look forward slightly crossed)
    ctx.beginPath();
    ctx.arc(-eyeX + 0.5*s, eyeY, pupilSize, 0, Math.PI * 2);
    ctx.arc(eyeX - 0.5*s, eyeY, pupilSize, 0, Math.PI * 2);
    ctx.fill();

    // --- Santa Hat (New) ---
    const hatSway = Math.sin(time * 2 + roach.wiggleOffset) * 2 * s;
    const tipX = hatSway;
    const tipY = -28 * s;

    // Cone
    ctx.fillStyle = '#D32F2F'; // Santa Red
    ctx.beginPath();
    ctx.moveTo(-4.5 * s, -15 * s);
    ctx.quadraticCurveTo(-2 * s, -22 * s, tipX, tipY);
    ctx.quadraticCurveTo(2 * s, -22 * s, 4.5 * s, -15 * s);
    ctx.fill();

    // Brim (White fluffy part)
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(0, -15 * s, 5.5 * s, 2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pom-pom
    ctx.beginPath();
    ctx.arc(tipX, tipY, 2.2 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
};