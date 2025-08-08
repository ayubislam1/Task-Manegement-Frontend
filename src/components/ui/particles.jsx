import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

export const Particles = ({ className = "", quantity = 50, stationary = false }) => {
  const particles = useRef([]);
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === canvas) {
          canvas.width = entry.contentRect.width;
          canvas.height = entry.contentRect.height;
          initParticles();
        }
      }
    });
    
    resizeObserver.observe(canvas);
    
    const initParticles = () => {
      particles.current = Array.from({ length: quantity }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        initialX: Math.random() * canvas.width,
        initialY: Math.random() * canvas.height,
      }));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.current.forEach((particle) => {
        if (!stationary) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          
          // Boundary check
          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        } else {
          // Gentle floating motion around initial position
          const time = Date.now() / 2000;
          particle.x = particle.initialX + Math.sin(time + particle.initialX) * 2;
          particle.y = particle.initialY + Math.cos(time + particle.initialY) * 2;
        }
        
        // Mouse interaction
        const dx = mouse.current.x - particle.x;
        const dy = mouse.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 100;
        
        if (distance < maxDistance) {
          const force = (1 - distance / maxDistance) * 0.1;
          particle.x -= dx * force;
          particle.y -= dy * force;
        }
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(139, 92, 246, 0.1)";
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    initParticles();
    animate();

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [quantity, stationary]);

  return (
    <motion.canvas
      ref={canvasRef}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
  );
};