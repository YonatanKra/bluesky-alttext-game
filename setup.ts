import { vi } from 'vitest';

(SVGElement.prototype as any).getBBox = vi.fn().mockReturnValue({ height: 100, width: 100 });