import { resize } from "./helpers/ResizeWindow"
import { CellShader } from "./shaders"

export class App {
    private constructor() { }

    private static canvas: HTMLCanvasElement
    private static device: GPUDevice
    private static context: GPUCanvasContext
    private static vertexBufferLayout: GPUVertexBufferLayout
    private static renderPipeLine: GPURenderPipeline
    private static vertexArray: Float32Array
    private static vertexBuffer: GPUBuffer
    private static gridArray: Float32Array
    private static gridBuffer: GPUBuffer
    private static bindGroup: GPUBindGroup
    private static readonly GRID_WIDTH = 1
    private static GRID_COLS: number
    private static GRID_ROWS: number


    public static async init() {
        this.setupScreenResizing()
        const { canvasFormat } = await this.setupGPUDeviceAndCanvasContext()
        this.setupBuffers()
        this.setRenderPipeline(canvasFormat)
        this.setBindGroup()
        requestAnimationFrame(this.renderLoop.bind(this))
    }

    private static setupScreenResizing() {
        this.canvas = document.getElementById("webgpu-canvas") as HTMLCanvasElement
        window.addEventListener("resize", (ev) => resize(this.canvas, ev))
        resize(this.canvas)

        this.GRID_COLS = Math.floor(this.canvas.width / this.GRID_WIDTH)
        this.GRID_ROWS = Math.floor(this.canvas.height / this.GRID_WIDTH)
    }

    private static async setupGPUDeviceAndCanvasContext() {
        if (!navigator.gpu) {
            throw new Error("WebGPU is not supported on browser")
        }

        const adapter = await navigator.gpu.requestAdapter()
        if (!adapter) {
            throw new Error("No adpter is available at the moment")
        }

        const device = await adapter.requestDevice()
        if (!device) {
            throw new Error("Could not fetch GPU device")
        }
        this.device = device

        const context = this.canvas.getContext("webgpu")
        if (!context) {
            throw new Error("Failed to get canvas context")
        }
        this.context = context

        const canvasFormat = navigator.gpu.getPreferredCanvasFormat()
        context.configure({
            device: device,
            format: canvasFormat
        })

        return { canvasFormat }
    }

    private static setupBuffers() {
        this.setupVertexBuffer()
        this.setupGridBuffer()
    }

    private static setupVertexBuffer() {
        this.vertexArray = new Float32Array([
            -1, -1, -1, 1, 1, 1,
            -1, -1, 1, -1, 1, 1
        ])

        // this.vertexArray = new Float32Array([
        //     -0.8, -0.8, -0.8, 0.8, 0.8, 0.8,
        //     -0.8, -0.8, 0.8, -0.8, 0.8, 0.8
        // ])

        this.vertexBuffer = this.device.createBuffer({
            label: "Vertex Buffer",
            size: this.vertexArray.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })

        this.device.queue.writeBuffer(this.vertexBuffer, 0, this.vertexArray)

        this.vertexBufferLayout = {
            arrayStride: 8,
            attributes: [{
                format: "float32x2",
                offset: 0,
                shaderLocation: 0
            }]
        }
    }

    private static setupGridBuffer() {
        this.gridArray = new Float32Array([this.GRID_COLS, this.GRID_ROWS])

        this.gridBuffer = this.device.createBuffer({
            label: "Grid Buffer",
            size: this.gridArray.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })

        this.device.queue.writeBuffer(this.gridBuffer, 0, this.gridArray)


    }

    private static setRenderPipeline(canvasFormat: GPUTextureFormat) {
        const cellShaderModule = this.device.createShaderModule({
            label: "Cell shader",
            code: CellShader
        })

        this.renderPipeLine = this.device.createRenderPipeline({
            label: "Cell pipeline",
            layout: "auto",
            vertex: {
                module: cellShaderModule,
                entryPoint: "vertexMain",
                buffers: [this.vertexBufferLayout]
            },
            fragment: {
                module: cellShaderModule,
                entryPoint: "fragmentMain",
                targets: [{ format: canvasFormat }]
            }
        })
    }

    private static setBindGroup() {
        this.bindGroup = this.device.createBindGroup({
            label: "Cell renderer bind group",
            layout: this.renderPipeLine.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: { buffer: this.gridBuffer }
            }]
        })
    }

    private static renderLoop() {

        const encoder = this.device.createCommandEncoder()

        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                loadOp: "clear",
                clearValue: [1, 1, 1, 1],
                storeOp: "store"
            }]
        })

        pass.setPipeline(this.renderPipeLine)
        pass.setVertexBuffer(0, this.vertexBuffer)
        pass.setBindGroup(0, this.bindGroup)
        pass.draw(this.vertexArray.length / 2, this.GRID_COLS * this.GRID_ROWS)

        pass.end()
        this.device.queue.submit([encoder.finish()])
        requestAnimationFrame(this.renderLoop.bind(this))
    }
}