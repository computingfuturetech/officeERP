import { useEffect } from "react";

const DisableNumInputScroll = () => {
  const handleWheel = (event) => {
    const { type } = event.target;
    if (type === "number") {
      event.preventDefault();
    }
  };

  const handleKeyDown = (event) => {
    const { type } = event.target;
    if (
      type === "number" &&
      (event.key === "ArrowUp" || event.key === "ArrowDown")
    ) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
};

export default DisableNumInputScroll;
