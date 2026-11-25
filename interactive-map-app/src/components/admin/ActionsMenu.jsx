// src/components/admin/ActionMenu.jsx
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Actions from "./Actions";

function ActionMenu({ onSave, onDelete, onEdit, island }) {
  const [isOpen, setIsOpen] = useState(false);                        // This determines wheter or not the menu is open
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });        // This stores the coordinates of where the Menu is supposed to appear

  // These are references used to determine if the user clicked outside of the menu to help close it
  const buttonRef = useRef(null);                                     
  const dropdownRef = useRef(null);

  // This toggles the menu on and off while setting the position of the menu to be right next to the ... button
  // Arielle: This will affect the styling, mainly positioning
  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();         // This gets the exact pixel size box of the "..." button

      setMenuPos({
        top: rect.top,                                                // Aligns the top edge of the menu with the top edge of the "..." button
        left: rect.right,                                         // Places the left edge of the menu 8px to the right of the "..." button
      });
    }
    setIsOpen((prev) => !prev);                                       // Toggle the menu on
  };


  useEffect(() => {
    if (!isOpen) return;

    // This handles 
    function handleClickOutside(event) {
      const clickedButton = buttonRef.current?.contains(event.target);
      const clickedMenu = dropdownRef.current?.contains(event.target);

      if (!clickedButton && !clickedMenu) {
        setIsOpen(false);
      }
    }

    function handleScroll() {
      setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const handleActionAndClose = (callback) => (data) => {
    setIsOpen(false);
    if (callback) callback(data);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleMenu}
        aria-label="Open island actions"
        className="px-2 py-1 rounded hover:bg-black/10 font-bold tracking-widest cursor-pointer"
      >
        ...
      </button>

      {isOpen &&
        createPortal(
          <div ref={dropdownRef}
            style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
            className="fixed z-50 w-32 bg-[#F7F5EE] border border-stone-200 rounded-xl shadow-lg p-2.5"
          >
            <Actions
              island={island}
              onSave={handleActionAndClose(onSave)}
              onEdit={handleActionAndClose(onEdit)}
              onDelete={handleActionAndClose(onDelete)}
            />
          </div>,
          document.body
        )}
    </>
  );
}

export default ActionMenu;