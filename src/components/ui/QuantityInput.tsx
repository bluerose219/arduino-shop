"use client";

type Props = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export default function QuantityInput({ value, max, onChange, disabled }: Props) {
  const set = (v: number) => onChange(Math.max(1, Math.min(max, v)));
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-300 bg-white">
      <button
        type="button"
        className="h-9 w-9 text-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        onClick={() => set(value - 1)}
        disabled={disabled || value <= 1}
        aria-label="수량 감소"
      >
        −
      </button>
      <input
        type="number"
        className="h-9 w-12 border-x border-gray-300 text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        value={value}
        min={1}
        max={max}
        disabled={disabled}
        onChange={(e) => set(Number(e.target.value) || 1)}
        aria-label="수량"
      />
      <button
        type="button"
        className="h-9 w-9 text-lg text-gray-600 hover:bg-gray-100 disabled:opacity-40"
        onClick={() => set(value + 1)}
        disabled={disabled || value >= max}
        aria-label="수량 증가"
      >
        +
      </button>
    </div>
  );
}
