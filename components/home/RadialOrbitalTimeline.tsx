'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Types
export type TimelineItem = {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: 'completed' | 'in-progress' | 'pending';
  energy: number; // 0-100
};

type Props = {
  timelineData: TimelineItem[];
  onFirstInteraction?: () => void;
};

// Utility to detect mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

// Utility to detect reduced motion preference
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
};

// Responsive orbit radius hook
const useOrbitRadius = () => {
  const [radius, setRadius] = useState(240);
  
  useEffect(() => {
    const updateRadius = () => {
      const width = window.innerWidth;
      if (width < 480) setRadius(135);
      else if (width < 640) setRadius(155);
      else if (width < 768) setRadius(175);
      else if (width < 1024) setRadius(195);
      else setRadius(240);
    };
    
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);
  
  return radius;
};

export const RadialOrbitalTimeline: React.FC<Props> = ({
  timelineData,
  onFirstInteraction,
}) => {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();
  const orbitRadius = useOrbitRadius();
  
  const lastTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const animationRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animation loop
  useEffect(() => {
    if (prefersReducedMotion || !autoRotate) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const speed = isMobile ? 0.012 : 0.020; // degrees per ms
    const targetFrameInterval = isMobile ? 1000 / 30 : 1000 / 60; // 30fps mobile, 60fps desktop

    const animate = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }
      
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      if (isMobile) {
        accumulatedTimeRef.current += deltaTime;
        if (accumulatedTimeRef.current >= targetFrameInterval) {
          setRotationAngle(prev => (prev + speed * accumulatedTimeRef.current) % 360);
          accumulatedTimeRef.current = 0;
        }
      } else {
        setRotationAngle(prev => (prev + speed * deltaTime) % 360);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoRotate, isMobile, prefersReducedMotion]);

  // Handle node click
  const handleNodeClick = useCallback((item: TimelineItem, index: number) => {
    if (!hasInteracted) {
      setHasInteracted(true);
      onFirstInteraction?.();
    }

    if (activeNodeId === item.id) {
      // Clicking same node - deselect
      setActiveNodeId(null);
      if (!prefersReducedMotion) {
        setAutoRotate(true);
      }
    } else {
      // Select new node
      setActiveNodeId(item.id);
      setAutoRotate(false);
      
      // Rotate to bring node to top (270 degrees = top position)
      const targetAngle = (index / timelineData.length) * 360;
      setRotationAngle(270 - targetAngle);
    }
  }, [activeNodeId, hasInteracted, onFirstInteraction, prefersReducedMotion, timelineData.length]);

  // Handle background click
  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('orbital-bg')) {
      setActiveNodeId(null);
      if (!prefersReducedMotion) {
        setAutoRotate(true);
      }
    }
  }, [prefersReducedMotion]);

  // Calculate node position
  const getNodePosition = (index: number) => {
    const angle = ((index / timelineData.length) * 360 + rotationAngle) % 360;
    const angleRadians = (angle * Math.PI) / 180;
    
    const x = orbitRadius * Math.cos(angleRadians);
    const y = orbitRadius * Math.sin(angleRadians);
    
    const zIndex = Math.round(100 + 50 * Math.cos(angleRadians));
    const rawOpacity = 0.5 + 0.5 * ((1 + Math.sin(angleRadians)) / 2);
    const opacity = Math.min(1, Math.max(0.5, rawOpacity));
    
    return { x, y, zIndex, opacity, angleRadians };
  };

  // Get status badge style
  const getStatusBadge = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return { label: 'ACTIVE', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'in-progress':
        return { label: 'IN PROGRESS', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'pending':
        return { label: 'PENDING', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    }
  };

  // Container size based on orbit radius
  const containerSize = orbitRadius * 2 + 60;

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center justify-center orbital-bg cursor-pointer"
      style={{ 
        minHeight: containerSize + 40,
        width: '100%',
      }}
      onClick={handleBackgroundClick}
    >
      {/* Orbital rings */}
      <div 
        className="absolute rounded-full border border-charcoal/10"
        style={{ 
          width: orbitRadius * 2,
          height: orbitRadius * 2,
        }}
      />
      <div 
        className="absolute rounded-full border border-charcoal/5"
        style={{ 
          width: orbitRadius * 2.3,
          height: orbitRadius * 2.3,
        }}
      />

      {/* Center hub */}
      <div className="absolute flex items-center justify-center">
        {/* Outer glow ring */}
        <div 
          className="absolute rounded-full"
          style={{
            width: 80,
            height: 80,
            background: 'radial-gradient(circle, rgba(255, 107, 74, 0.15) 0%, rgba(255, 107, 74, 0) 70%)',
          }}
        />
        
        {/* Ping rings - desktop only with motion */}
        {!isMobile && !prefersReducedMotion && (
          <>
            <div 
              className="absolute rounded-full border-2 border-coral/70 animate-ping"
              style={{ width: 48, height: 48 }}
            />
            <div 
              className="absolute rounded-full border border-coral/50 animate-ping"
              style={{ 
                width: 56, 
                height: 56,
                animationDelay: '0.5s',
              }}
            />
          </>
        )}
        
        {/* Center dot with gradient ring */}
        <div 
          className={`relative rounded-full flex items-center justify-center ${!prefersReducedMotion && !isMobile ? 'animate-pulse' : ''}`}
          style={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #FF6B4A 0%, #FF8A6D 100%)',
            boxShadow: '0 0 20px rgba(255, 107, 74, 0.4)',
          }}
        >
          <div 
            className="rounded-full bg-white"
            style={{ width: 16, height: 16 }}
          />
        </div>
      </div>

      {/* Orbital nodes */}
      {timelineData.map((item, index) => {
        const { x, y, zIndex, opacity, angleRadians } = getNodePosition(index);
        const Icon = item.icon;
        const isActive = activeNodeId === item.id;
        const isRelated = activeNodeId !== null && item.relatedIds.includes(activeNodeId);
        const statusBadge = getStatusBadge(item.status);
        
        // Scale based on state
        const scale = isActive 
          ? (isMobile ? 1.25 : 1.5) 
          : 1;
        
        // Calculate final opacity and zIndex
        const finalOpacity = isActive ? 1 : opacity;
        const finalZIndex = isActive ? 200 : zIndex;

        return (
          <div
            key={item.id}
            className="absolute"
            style={{
              transform: `translate3d(${x}px, ${y}px, 0)`,
              zIndex: finalZIndex,
              transition: 'transform 0.3s ease-out',
            }}
          >
            {/* Energy glow aura - desktop only */}
            {!isMobile && (
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: item.energy * 0.5 + 40,
                  height: item.energy * 0.5 + 40,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle, rgba(255, 107, 74, 0.3) 0%, rgba(255, 107, 74, 0) 70%)',
                  opacity: isActive || isRelated ? 1 : 0.5,
                }}
              />
            )}
            
            {/* Node button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNodeClick(item, index);
              }}
              className={`
                relative flex items-center justify-center
                w-10 h-10 md:w-12 md:h-12 rounded-full
                bg-white border-2 border-charcoal/10
                shadow-md transition-all duration-300
                hover:scale-110
                ${isActive ? 'border-coral shadow-lg' : ''}
                ${isRelated && !prefersReducedMotion ? 'animate-pulse' : ''}
              `}
              style={{
                opacity: finalOpacity,
                transform: `scale(${scale}) translate(-50%, -50%)`,
                transformOrigin: 'center center',
              }}
            >
              <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? 'text-coral' : 'text-charcoal'}`} />
            </button>

            {/* Node label */}
            <div
              className="absolute whitespace-nowrap text-xs md:text-sm font-medium text-gray-600 text-center pointer-events-none"
              style={{
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: 8,
                opacity: finalOpacity,
              }}
            >
              {item.title}
            </div>

            {/* Expanded card */}
            {isActive && (
              <div
                className="absolute"
                style={{
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: 40,
                  zIndex: 300,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Connector line */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-coral to-transparent"
                  style={{
                    top: -32,
                    height: 32,
                  }}
                />
                
                {/* Card */}
                <div 
                  className="bg-white rounded-xl shadow-strong border border-charcoal/10 p-4 w-64 md:w-72"
                  style={{
                    animation: 'fadeInUp 0.3s ease-out',
                  }}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${statusBadge.className}`}>
                      {statusBadge.label}
                    </span>
                    <span className="text-[10px] font-mono text-charcoal/50">{item.date}</span>
                  </div>

                  {/* Title & content */}
                  <h4 className="text-sm font-bold text-charcoal mb-2">{item.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">{item.content}</p>

                  {/* Confidence level */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-charcoal/60 uppercase tracking-wide">Confidence Level</span>
                      <span className="text-xs font-bold text-coral">{item.energy}%</span>
                    </div>
                    <div className="h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{
                          width: `${item.energy}%`,
                          background: 'linear-gradient(90deg, #FF6B4A 0%, #FF8A6D 100%)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Connected agents */}
                  {item.relatedIds.length > 0 && (
                    <div>
                      <span className="text-[10px] font-medium text-charcoal/60 uppercase tracking-wide mb-2 block">
                        Connected Agents
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {item.relatedIds.map((relatedId) => {
                          const relatedItem = timelineData.find(t => t.id === relatedId);
                          const relatedIndex = timelineData.findIndex(t => t.id === relatedId);
                          if (!relatedItem) return null;
                          
                          return (
                            <button
                              key={relatedId}
                              onClick={() => handleNodeClick(relatedItem, relatedIndex)}
                              className="text-[10px] px-2 py-1 rounded-full bg-coral/10 text-coral hover:bg-coral/20 transition-colors"
                            >
                              {relatedItem.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Keyframe styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

