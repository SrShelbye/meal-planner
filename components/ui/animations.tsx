'use client';

import { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 1000, className = '' }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;
    const change = endValue - startValue;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(startValue + change * easeOutQuart);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [value, duration]);

  return (
    <span className={className}>
      {displayValue.toLocaleString()}
    </span>
  );
}

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export function FadeIn({ children, delay = 0, duration = 500, direction = 'up', className = '' }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up': return 'translateY(20px)';
        case 'down': return 'translateY(-20px)';
        case 'left': return 'translateX(20px)';
        case 'right': return 'translateX(-20px)';
        default: return 'translateY(20px)';
      }
    }
    return 'translate(0)';
  };

  return (
    <div
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
      }}
    >
      {children}
    </div>
  );
}

interface SlideInProps {
  children: React.ReactNode;
  isOpen: boolean;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

export function SlideIn({ children, isOpen, direction = 'right', className = '' }: SlideInProps) {
  const getTransform = () => {
    if (!isOpen) {
      switch (direction) {
        case 'left': return 'translateX(-100%)';
        case 'right': return 'translateX(100%)';
        case 'top': return 'translateY(-100%)';
        case 'bottom': return 'translateY(100%)';
        default: return 'translateX(100%)';
      }
    }
    return 'translate(0)';
  };

  return (
    <div
      className={className}
      style={{
        transform: getTransform(),
        transition: 'transform 300ms ease-out',
      }}
    >
      {children}
    </div>
  );
}

interface PulseProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'strong';
}

export function Pulse({ children, className = '', intensity = 'medium' }: PulseProps) {
  const [isPulsing, setIsPulsing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(false);
      setTimeout(() => setIsPulsing(true), 100);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const intensityClass = {
    light: 'animate-pulse',
    medium: 'animate-bounce',
    strong: 'animate-ping'
  }[intensity];

  return (
    <div className={`${isPulsing ? intensityClass : ''} ${className}`}>
      {children}
    </div>
  );
}

interface BounceProps {
  children: React.ReactNode;
  trigger?: boolean;
  className?: string;
}

export function Bounce({ children, trigger = true, className = '' }: BounceProps) {
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div
      className={`${isBouncing ? 'animate-bounce' : ''} ${className}`}
      style={{
        animation: isBouncing ? 'bounce 0.5s ease-out' : 'none',
      }}
    >
      {children}
    </div>
  );
}

interface ScaleOnHoverProps {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}

export function ScaleOnHover({ children, scale = 1.05, className = '' }: ScaleOnHoverProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={className}
      style={{
        transform: isHovered ? `scale(${scale})` : 'scale(1)',
        transition: 'transform 200ms ease-out',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
}

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className = '' }: LoadingDotsProps) {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev % 3) + 1);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={className}>
      {'.'.repeat(dots)}
    </span>
  );
}

interface ShimmerProps {
  children: React.ReactNode;
  className?: string;
}

export function Shimmer({ children, className = '' }: ShimmerProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      {children}
    </div>
  );
}
