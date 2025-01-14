import React, { useState, useEffect, useRef } from "react";
import "./Dropdown.scss";

interface DropdownProps<T> {
  value: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getvalue?: (item: T) => string;
  variant?: DropdownVariantType;
  image?: string;
  label?: string;
}

export const DropdownVariant = {
  DEFAULT: "default",
  OUTLINED: "outlined",
  // ACTIVE: "active",
  NETWORK: "network",
};

export type DropdownVariantType =
  (typeof DropdownVariant)[keyof typeof DropdownVariant];

const Dropdown = <T,>({
  value,
  items,
  getvalue,
  renderItem,
  variant = "default",
  image,
  label,
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedvalue, setSelectedvalue] = useState<string | undefined>(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value && items.length > 0) {
      setSelectedvalue(items[0] as unknown as string);
    }
  }, [value, items]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  const handleItemClick = (item: T) => {
    setSelectedvalue(getvalue ? getvalue(item) : (item as unknown as string));
    closeDropdown();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      closeDropdown();
    }
  };

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      {label && <div className="dropdown-label">{label}</div>}
      <div className={`dropdown dropdown-${variant}`}>
        <button
          className={`dropdown-value ${isOpen ? "active" : ""}`}
          onClick={toggleDropdown}
        >
          <div className="dropdown-value-left">
            {image && (
              <img
                src={image}
                alt={value}
                className="dropdown-selected-image"
              />
            )}
            <div className="dropdown-value-selected">{selectedvalue}</div>
          </div>

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
                {getvalue
                  ? getvalue(item) === selectedvalue
                  : (item as unknown as string) === selectedvalue && (
                      <img
                        style={{ width: "20px", height: "20px" }}
                        src="/trade/images/check.svg"
                        alt="selected"
                      />
                    )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
export default Dropdown;
