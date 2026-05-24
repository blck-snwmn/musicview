import { describe, expect, it } from "vitest";
import { visualizers } from ".";
import { DrawArea } from "./types";

type CanvasCall = {
  name: string;
  args: unknown[];
};

const createCanvasContext = () => {
  const calls: CanvasCall[] = [];

  const record =
    (name: string) =>
    (...args: unknown[]) => {
      calls.push({ name, args });
    };

  const context = {
    calls,
    set fillStyle(value: string) {
      calls.push({ name: "setFillStyle", args: [value] });
    },
    set lineWidth(value: number) {
      calls.push({ name: "setLineWidth", args: [value] });
    },
    set strokeStyle(value: string) {
      calls.push({ name: "setStrokeStyle", args: [value] });
    },
    arc: record("arc"),
    beginPath: record("beginPath"),
    closePath: record("closePath"),
    fill: record("fill"),
    fillRect: record("fillRect"),
    lineTo: record("lineTo"),
    moveTo: record("moveTo"),
    stroke: record("stroke"),
    strokeRect: record("strokeRect"),
  };

  return context as unknown as CanvasRenderingContext2D & { calls: CanvasCall[] };
};

const canvas = {
  width: 640,
  height: 320,
} as HTMLCanvasElement;

const drawArea: DrawArea = {
  x: 64,
  y: 32,
  width: 512,
  height: 256,
};

const frequencyData = Uint8Array.from({ length: 128 }, (_, index) => (index * 7) % 256);

describe("visualizers", () => {
  it("registers visualizers with stable, unique ids", () => {
    const ids = visualizers.map((visualizer) => visualizer.id);

    expect(ids).toEqual(["linear", "circular", "frequency", "symmetric", "layered"]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("draws each visualizer without invalid canvas coordinates", () => {
    for (const visualizer of visualizers) {
      const context = createCanvasContext();

      expect(() => visualizer.draw(context, frequencyData, canvas, drawArea)).not.toThrow();

      const numericArgs = context.calls.flatMap((call) =>
        call.args.filter((arg): arg is number => typeof arg === "number"),
      );
      expect(
        numericArgs.length,
        `${visualizer.id} should draw numeric coordinates`,
      ).toBeGreaterThan(0);
      expect(
        numericArgs.every(Number.isFinite),
        `${visualizer.id} should use finite coordinates`,
      ).toBe(true);
    }
  });
});
