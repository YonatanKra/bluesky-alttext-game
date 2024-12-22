import { vi } from 'vitest';

// Mock getBBox for SVGElement
(SVGElement.prototype as any).getBBox = vi.fn().mockReturnValue({ height: 100, width: 100 });
(SVGElement.prototype as any).beginElement = vi.fn();