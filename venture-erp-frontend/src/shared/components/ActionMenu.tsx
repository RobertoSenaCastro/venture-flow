import { useState } from "react";

import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";

import "./ActionMenu.css";

export interface ActionMenuItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  ariaLabel: string;
}

function ActionMenu({ items, ariaLabel }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-end",
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, {
    escapeKey: true,
    outsidePress: true,
  });
  const role = useRole(context, { role: "menu" });

  const { getReferenceProps, getFloatingProps } =
    useInteractions([click, dismiss, role]);

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        className="action-menu-trigger"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        {...getReferenceProps()}
      >
        <span aria-hidden="true">⋮</span>
      </button>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="action-menu-panel"
            {...getFloatingProps()}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={
                  item.variant === "danger"
                    ? "action-menu-item action-menu-item-danger"
                    : "action-menu-item"
                }
                disabled={item.disabled}
                onClick={() => {
                  setIsOpen(false);
                  item.onClick();
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

export default ActionMenu;
