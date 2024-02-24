import { useEffect, useState } from "react";

type WindowSize = [number, number];

export default function useWindowSize() {
  const [size, setSize] = useState<WindowSize>([0, 0]);

  useEffect(() => {
    const handleResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
