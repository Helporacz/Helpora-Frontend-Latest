import { memo, useEffect, useRef, useState } from "react";

const LazyBackgroundImage = memo(function LazyBackgroundImage({
  src,
  className = "",
  style = {},
  rootMargin = "350px",
  threshold = 0.01,
  children,
  ...props
}) {
  const elementRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return undefined;

    if (!("IntersectionObserver" in window)) {
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  const finalStyle =
    isInView && src
      ? { ...style, backgroundImage: `url(${src})` }
      : { ...style, backgroundImage: "none" };

  return (
    <div ref={elementRef} className={className} style={finalStyle} {...props}>
      {children}
    </div>
  );
});

export default LazyBackgroundImage;
