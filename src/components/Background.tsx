import { onCleanup, onMount } from 'solid-js';
import './Background.css';

/** Canvas pixels per chunky on-screen pixel. */
const PIXEL_SIZE = 6;
const FRAME_MS = 1000 / 20;

const VERTEX_SHADER = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

/* Paint-like bands, twisted around the centre and cut into a few flat colours. */
const FRAGMENT_SHADER = `
precision mediump float;
uniform float time;
uniform vec2 resolution;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution) / min(resolution.x, resolution.y);
  float radius = length(uv);
  float angle = atan(uv.y, uv.x) + 1.8 * sin(time * 0.05) - radius * 2.4;
  vec2 p = vec2(cos(angle), sin(angle)) * radius * 3.2;

  for (int i = 0; i < 4; i++) {
    float offset = float(i) * 1.7;
    p += 0.55 * vec2(sin(p.y * 1.3 + time * 0.16 + offset), cos(p.x * 1.1 - time * 0.13 + offset));
  }

  float band = floor((0.5 + 0.5 * sin(p.x + p.y + length(p))) * 5.0) / 4.0;
  vec3 deep = vec3(0.055, 0.145, 0.150);
  vec3 felt = vec3(0.100, 0.290, 0.250);
  vec3 ember = vec3(0.420, 0.150, 0.175);
  vec3 color = mix(deep, felt, smoothstep(0.0, 0.5, band));
  color = mix(color, ember, step(0.99, band) * 0.75);
  gl_FragColor = vec4(color, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type) as WebGLShader;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

/** Starts the shader, returning a function that draws a frame, or null without WebGL. */
function createRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return null;

  const program = gl.createProgram() as WebGLProgram;
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const time = gl.getUniformLocation(program, 'time');
  const resolution = gl.getUniformLocation(program, 'resolution');

  return (seconds: number) => {
    const width = Math.ceil(window.innerWidth / PIXEL_SIZE);
    const height = Math.ceil(window.innerHeight / PIXEL_SIZE);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    gl.uniform1f(time, seconds);
    gl.uniform2f(resolution, width, height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
}

export function Background() {
  let canvas!: HTMLCanvasElement;

  onMount(() => {
    const draw = createRenderer(canvas);
    if (!draw) return;

    const redraw = () => draw(performance.now() / 1000);
    redraw();
    window.addEventListener('resize', redraw);
    onCleanup(() => window.removeEventListener('resize', redraw));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let lastDraw = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (now - lastDraw < FRAME_MS) return;
      lastDraw = now;
      draw(now / 1000);
    };
    frame = requestAnimationFrame(tick);
    onCleanup(() => cancelAnimationFrame(frame));
  });

  return (
    <div class="background" aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}
