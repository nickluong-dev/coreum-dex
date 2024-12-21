import React, { useState, useEffect } from "react";
import "./Dropdown.scss";

interface DropdownProps<T> {
  label?: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getLabel?: (item: T) => string;
  variant?: "default" | "outlined" | "active" | "network";
  image?: string;
}

const Dropdown = <T,>({
  label,
  items,
  getLabel,
  renderItem,
  variant = "default",
  image,
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(label);

  useEffect(() => {
    if (!label && items.length > 0) {
      setSelectedLabel(items[0] as unknown as string);
    }
  }, [label, items]);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  const handleItemClick = (item: T) => {
    setSelectedLabel(getLabel ? getLabel(item) : (item as unknown as string));
    closeDropdown();
  };

  return (
    <div className={`dropdown dropdown-${variant}`}>
      <button className="dropdown-label" onClick={toggleDropdown}>
        {image && (
          <img src={image} alt={label} className="dropdown-selected-image" />
        )}
        <div className="dropdown-label-selected">{selectedLabel}</div>
        <img
          className={`dropdown-arrow ${isOpen ? "rotate" : ""}`}
          src="/trade/images/arrow.svg"
          alt="arr"
        />
      </button>

      <div className={`dropdown-list ${variant} ${isOpen ? "open" : ""}`}>
        <ul className="dropdown-list-content">
          {items.map((item, index) => (
            <li
              key={index}
              className="dropdown-item"
              onClick={() => handleItemClick(item)}
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              {renderItem(item, index)}
              {selectedLabel === item && (
                <img
                  style={{ width: "20px", height: "20px" }}
                  src="/trade/images/check.svg"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default Dropdown;
