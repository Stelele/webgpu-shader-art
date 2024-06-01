import { resize2 } from "./helpers/ResizeWindow"
import { FirstArtFragmentShader, SmileyV1FragmentShader, SmileyV2FragmentShader, SmileyV3FragmentShader, WaveyRectFragmentShader } from "./shaders"
import { GridArrayVertexShader } from "./shaders/vertices"

export class App {
    private constructor() { }

    private static device: GPUDevice
    private static canvas: HTMLCanvasElement
    private static canvasContext: GPUCanvasContext
    private static gpuTexturFormat: GPUTextureFormat

    private static resolutionArray: Float32Array
    private static resolutionBuffer: GPUBuffer
    private static timeStepArray: Uint32Array
    private static timeStepBuffer: GPUBuffer
    private static vertexArray: Float32Array
    private static vertexBuffer: GPUBuffer
    private static gridArray: Float32Array
    private static gridBuffer: GPUBuffer
    private static GRID_SIZE = 2048

    private static vertexShaderModule: GPUShaderModule
    private static fragmentShaderModule: GPUShaderModule
    private static renderPipeline: GPURenderPipeline
    private static bindGroup: GPUBindGroup
    private static bindGroupLayout: GPUBindGroupLayout

    private static renderPassDescriptor: GPURenderPassDescriptor
    private static then: number
    private static now: number
    private static fpsInterval: number
    private static animationframe: number

    private static fragmentShaders = [
        FirstArtFragmentShader,
        SmileyV1FragmentShader,
        WaveyRectFragmentShader,
        SmileyV2FragmentShader,
        SmileyV3FragmentShader
    ]

    public static async start(canvas: HTMLCanvasElement) {
        App.canvas = canvas
        App.device = await getDevice()
        App.device.lost.then(
            (e) => {
                console.log("Lost device")
                console.log(e)

                if (App.animationframe) {
                    cancelAnimationFrame(App.animationframe)
                }

                App.start(canvas)
            }
        )
        setupCanvas()
        App.setupBuffers()
        App.setupShaderModule()
        App.setupBindGroupLayout()
        App.setupPipeline()
        App.setupBindGroups()
        App.setupRenderPassDescriptor()
        App.startAnimation(60)
        // App.render(300)

        async function getDevice() {
            const adapater = await navigator.gpu.requestAdapter()
            const device = adapater?.requestDevice()

            if (!device) {
                throw new Error("Couldnt fetch device")
            }

            return device
        }

        function setupCanvas() {
            window.addEventListener("resize", () => resize2(canvas, App.device))
            resize2(canvas, App.device)

            const context = canvas.getContext("webgpu")
            if (!context) {
                throw new Error("Failed to fetch canvas context")
            }

            App.canvasContext = context
            App.gpuTexturFormat = navigator.gpu.getPreferredCanvasFormat()
            context.configure({
                device: App.device,
                format: App.gpuTexturFormat
            })
        }
    }

    private static setupBuffers() {
        setupResolutionBuffer()
        setupTimeStepBuffer()
        setupVertexBuffer()
        setupGridBuffer()

        function setupResolutionBuffer() {
            App.resolutionArray = new Float32Array(2)
            App.resolutionBuffer = App.device.createBuffer({
                label: "Resolution Buffer",
                size: 2 * 4,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            })
        }

        function setupTimeStepBuffer() {
            App.timeStepArray = new Uint32Array(1)
            App.timeStepBuffer = App.device.createBuffer({
                label: "Timestep Buffer",
                size: 1 * 4,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            })
        }

        function setupVertexBuffer() {
            App.vertexArray = new Float32Array([
                -1, -1, -1, 1, 1, 1,
                -1, -1, 1, -1, 1, 1
            ])

            App.vertexBuffer = App.device.createBuffer({
                label: "Vertex Buffer",
                size: App.vertexArray.byteLength,
                usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
            })

            App.device.queue.writeBuffer(App.vertexBuffer, 0, App.vertexArray)
        }

        function setupGridBuffer() {
            App.gridArray = new Float32Array([App.GRID_SIZE, App.GRID_SIZE])
            App.gridBuffer = App.device.createBuffer({
                label: "Grid Buffer",
                size: 2 * 4,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            })

            App.device.queue.writeBuffer(App.gridBuffer, 0, App.gridArray)
        }
    }

    private static setupShaderModule() {
        App.vertexShaderModule = App.device.createShaderModule({
            label: "Vertex Shadder Module",
            code: GridArrayVertexShader
        })

        App.fragmentShaderModule = App.device.createShaderModule({
            label: "Fragment Shader Module",
            code: App.fragmentShaders[4]
        })
    }

    private static setupPipeline() {
        const pipeLineLayout = this.device.createPipelineLayout({
            label: "Pipeline Layout",
            bindGroupLayouts: [App.bindGroupLayout]
        })
        App.renderPipeline = App.device.createRenderPipeline({
            label: "Render Pipeline",
            layout: pipeLineLayout,
            vertex: {
                module: App.vertexShaderModule,
                buffers: [
                    {
                        arrayStride: 2 * 4,
                        attributes: [{ shaderLocation: 0, offset: 0, format: "float32x2" }]
                    }
                ]
            },
            fragment: {
                module: App.fragmentShaderModule,
                targets: [{ format: App.gpuTexturFormat }]
            }
        })
    }

    private static setupBindGroups() {
        App.bindGroup = App.device.createBindGroup({
            label: "Bind Group",
            layout: App.bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: { buffer: App.resolutionBuffer }
                },
                {
                    binding: 1,
                    resource: { buffer: App.timeStepBuffer }
                },
                {
                    binding: 2,
                    resource: { buffer: App.gridBuffer }
                }
            ]
        })
    }

    private static setupBindGroupLayout() {
        App.bindGroupLayout = App.device.createBindGroupLayout({
            label: "Bind Group Layout",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: "uniform" }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: "uniform" }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' }
                }
            ]
        })
    }

    private static setupRenderPassDescriptor() {
        App.renderPassDescriptor = {
            label: "Render Pass Descriptor",
            colorAttachments: [
                {
                    view: App.canvasContext.getCurrentTexture().createView(),
                    loadOp: "clear",
                    storeOp: "store",
                    clearValue: [0.3, 0.3, 0.3, 1],
                }
            ]
        }
    }

    private static startAnimation(fps: number) {
        App.fpsInterval = 1000 / fps
        App.then = Date.now()
        App.now = App.then
        App.animate()

    }

    private static animate() {
        App.animationframe = requestAnimationFrame(App.animate.bind(this))
        App.now = Date.now()
        const elapsed = App.now - App.then

        if (elapsed > App.fpsInterval) {
            App.then = App.now - (elapsed % App.fpsInterval)
            App.render(App.fpsInterval)
        }

    }

    private static render(elapsedMs: number) {
        (App.renderPassDescriptor.colorAttachments as any)[0].view = App.canvasContext.getCurrentTexture().createView()
        const width = App.canvas.width
        const height = App.canvas.height
        const encoder = App.device.createCommandEncoder()
        const pass = encoder.beginRenderPass(App.renderPassDescriptor)

        App.resolutionArray.set([width, height], 0)
        App.timeStepArray.set([App.timeStepArray[0] + elapsedMs], 0)

        App.device.queue.writeBuffer(App.resolutionBuffer, 0, App.resolutionArray, 0)
        App.device.queue.writeBuffer(App.timeStepBuffer, 0, App.timeStepArray, 0)

        pass.setPipeline(App.renderPipeline)
        pass.setVertexBuffer(0, App.vertexBuffer)
        pass.setBindGroup(0, App.bindGroup)
        pass.draw(App.vertexArray.length / 2, App.GRID_SIZE * App.GRID_SIZE)
        pass.end()

        App.device.queue.submit([encoder.finish()])

    }
}

