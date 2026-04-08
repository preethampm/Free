'use client';

import { useEffect, useRef, useCallback } from 'react';
import { QuadTree, createAABB, createPoint, type Point, type AABB } from '@/src/lib/qtree';

const VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute float a_depth;
  uniform vec2 u_resolution;
  varying float v_depth;

  void main() {
    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    v_depth = a_depth;
    gl_PointSize = 6.0;
  }
`;

const FRAGMENT_SHADER_LINES = `
  precision mediump float;
  varying float v_depth;
  uniform vec2 u_resolution;

  void main() {
    float alpha = 0.15 + (v_depth * 0.08);
    gl_FragColor = vec4(0.114, 0.62, 0.459, alpha);
  }
`;

const FRAGMENT_SHADER_POINTS = `
  precision mediump float;
  uniform vec4 u_pointColor;

  void main() {
    gl_FragColor = u_pointColor;
  }
`;

interface QTreeVisualizerProps {
  width?: number;
  height?: number;
}

export function QTreeVisualizer({ width = 800, height = 600 }: QTreeVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qtRef = useRef<QuadTree | null>(null);
  const pointIdRef = useRef(0);
  const pointsRef = useRef<Point[]>([]);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const lineProgramRef = useRef<WebGLProgram | null>(null);
  const pointProgramRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number>(0);
  const velocitiesRef = useRef<{ x: number; y: number }[]>([]);

  const createShader = useCallback((gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }, []);

  const createProgram = useCallback((gl: WebGLRenderingContext, vsSource: string, fsSource: string) => {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;
    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }, [createShader]);

  const getBoundaryVertices = useCallback((boundary: AABB) => {
    const { x, y, width: w, height: h } = boundary;
    return [
      x - w / 2, y - h / 2,
      x + w / 2, y - h / 2,
      x + w / 2, y - h / 2,
      x + w / 2, y + h / 2,
      x + w / 2, y + h / 2,
      x - w / 2, y + h / 2,
      x - w / 2, y + h / 2,
      x - w / 2, y - h / 2,
    ];
  }, []);

  const render = useCallback(() => {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    if (!gl || !canvas || !qtRef.current) return;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.027, 0.051, 0.043, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const qt = qtRef.current;
    const boundaries = qt.getAllBoundaries();
    const points = qt.getAllPoints();

    if (lineProgramRef.current) {
      gl.useProgram(lineProgramRef.current);
      gl.enableVertexAttribArray(0);

      const allVertices: number[] = [];
      const allDepths: number[] = [];

      for (const { boundary, depth } of boundaries) {
        const verts = getBoundaryVertices(boundary);
        for (let i = 0; i < verts.length; i += 2) {
          allVertices.push(verts[i], verts[i + 1]);
          allDepths.push(depth);
        }
      }

      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allVertices), gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      const depthBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, depthBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allDepths), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0);

      gl.lineWidth(1);
      gl.drawArrays(gl.LINES, 0, allVertices.length / 2);

      gl.deleteBuffer(vertexBuffer);
      gl.deleteBuffer(depthBuffer);
    }

    if (pointProgramRef.current && points.length > 0) {
      gl.useProgram(pointProgramRef.current);
      gl.enableVertexAttribArray(0);

      const pointVertices: number[] = [];
      for (const p of points) {
        pointVertices.push(p.x, p.y);
      }

      const pointBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointVertices), gl.DYNAMIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.POINTS, 0, points.length);
      gl.deleteBuffer(pointBuffer);
    }

    animationRef.current = requestAnimationFrame(render);
  }, [getBoundaryVertices]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: true });
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    glRef.current = gl;

    const lineProgram = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER_LINES);
    const pointProgram = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER_POINTS);

    if (!lineProgram || !pointProgram) {
      console.error('Failed to create shader programs');
      return;
    }

    lineProgramRef.current = lineProgram;
    pointProgramRef.current = pointProgram;

    gl.useProgram(lineProgram);
    const resLoc = gl.getUniformLocation(lineProgram, 'u_resolution');
    gl.uniform2f(resLoc, canvas.width, canvas.height);

    gl.useProgram(pointProgram);
    const resLoc2 = gl.getUniformLocation(pointProgram, 'u_resolution');
    gl.uniform2f(resLoc2, canvas.width, canvas.height);
    const colorLoc = gl.getUniformLocation(pointProgram, 'u_pointColor');
    gl.uniform4f(colorLoc, 0.878, 0.961, 0.933, 1.0);
    gl.uniform2f(resLoc2, canvas.width, canvas.height);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    qtRef.current = new QuadTree(createAABB(canvas.width / 2, canvas.height / 2, canvas.width, canvas.height));

    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const id = pointIdRef.current++;
      qtRef.current.insert(createPoint(x, y, id));
      pointsRef.current.push(createPoint(x, y, id));
      velocitiesRef.current.push({
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
      });
    }

    animationRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [width, height, createProgram, render]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !qtRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = pointIdRef.current++;
    const point = createPoint(x, y, id);
    qtRef.current.insert(point);
    pointsRef.current.push(point);
    velocitiesRef.current.push({
      x: (Math.random() - 0.5) * 0.5,
      y: (Math.random() - 0.5) * 0.5,
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      className="cursor-crosshair rounded-2xl border border-[#1D9E75]/20"
    />
  );
}
