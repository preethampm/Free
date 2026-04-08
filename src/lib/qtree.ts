export interface Point {
  x: number;
  y: number;
  id: number;
}

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface QuadTreeNode {
  boundary: AABB;
  points: Point[];
  children: QuadTreeNode[] | null;
  depth: number;
}

const MAX_POINTS = 4;
const MAX_DEPTH = 8;

export function createAABB(x: number, y: number, width: number, height: number): AABB {
  return { x, y, width, height };
}

export function createPoint(x: number, y: number, id: number): Point {
  return { x, y, id };
}

function containsPoint(boundary: AABB, point: Point): boolean {
  return (
    point.x >= boundary.x - boundary.width / 2 &&
    point.x <= boundary.x + boundary.width / 2 &&
    point.y >= boundary.y - boundary.height / 2 &&
    point.y <= boundary.y + boundary.height / 2
  );
}

function intersects(a: AABB, b: AABB): boolean {
  return !(
    a.x + a.width / 2 < b.x - b.width / 2 ||
    a.x - a.width / 2 > b.x + b.width / 2 ||
    a.y + a.height / 2 < b.y - b.height / 2 ||
    a.y - a.height / 2 > b.y + b.height / 2
  );
}

export class QuadTree {
  private root: QuadTreeNode;

  constructor(boundary: AABB) {
    this.root = {
      boundary,
      points: [],
      children: null,
      depth: 0,
    };
  }

  insert(point: Point): boolean {
    return this.insertIntoNode(this.root, point);
  }

  private insertIntoNode(node: QuadTreeNode, point: Point): boolean {
    if (!containsPoint(node.boundary, point)) {
      return false;
    }

    if (node.children === null) {
      if (node.points.length < MAX_POINTS || node.depth >= MAX_DEPTH) {
        node.points.push(point);
        return true;
      }
      this.subdivide(node);
    }

    for (const child of node.children!) {
      if (this.insertIntoNode(child, point)) {
        return true;
      }
    }

    return false;
  }

  private subdivide(node: QuadTreeNode): void {
    const { x, y, width, height } = node.boundary;
    const halfW = width / 2;
    const halfH = height / 2;
    const nextDepth = node.depth + 1;

    node.children = [
      { boundary: createAABB(x - halfW / 2, y - halfH / 2, halfW, halfH), points: [], children: null, depth: nextDepth },
      { boundary: createAABB(x + halfW / 2, y - halfH / 2, halfW, halfH), points: [], children: null, depth: nextDepth },
      { boundary: createAABB(x - halfW / 2, y + halfH / 2, halfW, halfH), points: [], children: null, depth: nextDepth },
      { boundary: createAABB(x + halfW / 2, y + halfH / 2, halfW, halfH), points: [], children: null, depth: nextDepth },
    ];

    for (const p of node.points) {
      for (const child of node.children) {
        if (this.insertIntoNode(child, p)) {
          break;
        }
      }
    }
    node.points = [];
  }

  query(range: AABB): Point[] {
    const found: Point[] = [];
    this.queryNode(this.root, range, found);
    return found;
  }

  private queryNode(node: QuadTreeNode, range: AABB, found: Point[]): void {
    if (!intersects(node.boundary, range)) {
      return;
    }

    for (const p of node.points) {
      if (containsPoint(range, p)) {
        found.push(p);
      }
    }

    if (node.children) {
      for (const child of node.children) {
        this.queryNode(child, range, found);
      }
    }
  }

  getAllBoundaries(): { boundary: AABB; depth: number }[] {
    const boundaries: { boundary: AABB; depth: number }[] = [];
    this.collectBoundaries(this.root, boundaries);
    return boundaries;
  }

  private collectBoundaries(node: QuadTreeNode, boundaries: { boundary: AABB; depth: number }[]): void {
    if (node.children) {
      boundaries.push({ boundary: node.boundary, depth: node.depth });
      for (const child of node.children) {
        this.collectBoundaries(child, boundaries);
      }
    }
  }

  getAllPoints(): Point[] {
    const points: Point[] = [];
    this.collectPoints(this.root, points);
    return points;
  }

  private collectPoints(node: QuadTreeNode, points: Point[]): void {
    points.push(...node.points);
    if (node.children) {
      for (const child of node.children) {
        this.collectPoints(child, points);
      }
    }
  }

  clear(): void {
    this.root = {
      boundary: this.root.boundary,
      points: [],
      children: null,
      depth: 0,
    };
  }
}
