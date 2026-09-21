"use client";

import type { ReactNode } from "react";

import { DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type DropdownToggleItemProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Icon and label, exactly as a plain menu item takes them. */
  children: ReactNode;
  className?: string;
};

/**
 * The one on/off row inside a dropdown menu: an icon, a label and a switch at
 * the inline end. Anything in the app that hides and shows something from a
 * menu uses this, so the affordance reads the same everywhere.
 *
 * It keeps `menuitemcheckbox` semantics from the underlying checkbox item — the
 * switch only replaces the tick visually, so screen readers still announce the
 * state and the whole row stays the hit target.
 */
export function DropdownToggleItem({
  checked,
  onCheckedChange,
  disabled,
  children,
  className,
}: DropdownToggleItemProps) {
  return (
    <DropdownMenuCheckboxItem
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      // A toggle is a setting, not a command: the menu stays open so several
      // can be flipped in one visit.
      onSelect={(event) => event.preventDefault()}
      className={cn(
        "gap-2 px-2 py-1.5 pe-2",
        "[&>[data-slot=dropdown-menu-checkbox-item-indicator]]:hidden",
        className,
      )}
    >
      {children}
      <Switch
        size="sm"
        checked={checked}
        // Decorative: the menu item above already carries the role, the state
        // and the click. A nested button here would be a second tab stop and a
        // second announcement of the same thing.
        aria-hidden
        tabIndex={-1}
        className="pointer-events-none ms-auto after:hidden"
      />
    </DropdownMenuCheckboxItem>
  );
}
