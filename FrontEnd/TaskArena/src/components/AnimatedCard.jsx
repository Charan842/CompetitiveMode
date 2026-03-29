import { useEffect, useRef, useState } from 'react';

const AnimatedCard = ({ children, delay = 0, className = '' }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-6 scale-[0.97] blur-[6px]'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;
