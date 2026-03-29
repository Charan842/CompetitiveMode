import { useEffect, useState } from 'react';

const PageTransition = ({ children }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        show ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-4 blur-[6px]'
      }`}
    >
      {children}
    </div>
  );
};

export default PageTransition;
