"use client";

interface SelectOptionProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export default function SelectOption({
  label,
  selected,
  onSelect,
}: SelectOptionProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center justify-between px-6 py-5 rounded-full text-[15px] font-semibold cursor-pointer transition-all duration-200 ${
        selected
          ? "bg-secondary text-white"
          : "bg-white text-gray-400 border border-gray-200"
      }`}
    >
      <span>{label}</span>
      <div
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          selected ? "border-white bg-primary" : "border-gray-300 bg-white"
        }`}
      >
        {selected && <div className="w-3 h-3 rounded-full bg-white" />}
      </div>
    </button>
  );
}
