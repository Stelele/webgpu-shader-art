import { resize } from "./helpers/ResizeWindow"
import { CellShader, ComputeShader, WORKGROUP_SIZE } from "./shaders"

const canvas = document.getElementById("webgpu-canvas") as HTMLCanvasElement
window.addEventListener("resize", (e) => resize(canvas, e))
async function init() {
    resize(canvas)

    if (!navigator.gpu) {
        throw new Error("WebGPU not supported on this browser")
    }

    const adaptor = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" })
    if (!adaptor) {
        throw new Error("No appropriate GPUAdapter found.")
    }

    const device = await adaptor.requestDevice()

    const context = canvas.getContext("webgpu") as GPUCanvasContext
    if (!context) {
        throw new Error("Could not get canvas context")
    }

    const canvasFormat = navigator.gpu.getPreferredCanvasFormat()
    context.configure({ device, format: canvasFormat })

    const GRID_SIZE = 2048

    const uniformArray = new Float32Array([GRID_SIZE, GRID_SIZE])
    const uniformBuffer = device.createBuffer({
        label: "Grid Uniforms",
        size: uniformArray.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    device.queue.writeBuffer(uniformBuffer, 0, uniformArray)

    const cellStateArray = new Uint32Array(GRID_SIZE * GRID_SIZE)
    const cellStateStorage = [
        device.createBuffer({
            label: "Cell State A",
            size: cellStateArray.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        }),
        device.createBuffer({
            label: "Cell State B",
            size: cellStateArray.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })
    ]

    for (let i = 0; i < cellStateArray.length; i += 3) {
        cellStateArray[i] = 0
    }
    device.queue.writeBuffer(cellStateStorage[0], 0, cellStateArray)
    device.queue.writeBuffer(cellStateStorage[1], 0, cellStateArray)

    const vertices = new Float32Array([
        -1, -1, 1, -1, 1, 1,
        -1, -1, 1, 1, -1, 1
    ])
    const vertexBuffer = device.createBuffer({
        label: "Cell verticies",
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })
    device.queue.writeBuffer(vertexBuffer, 0, vertices)
    const vertexBufferLayout: GPUVertexBufferLayout = {
        arrayStride: 8,
        attributes: [{
            format: "float32x2",
            offset: 0,
            shaderLocation: 0
        }]
    }

    const cellShaderModule = device.createShaderModule({
        label: "Cell shader",
        code: CellShader
    })
    const simulateShaderModule = device.createShaderModule({
        label: "Game of Life simulation shader",
        code: ComputeShader
    })


    const bindGroupLayout = device.createBindGroupLayout({
        label: "Cell Bind Group Layout",
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX,
                buffer: { type: "uniform" }
            },
            {
                binding: 1,
                visibility: GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX,
                buffer: { type: "read-only-storage" }
            },
            {
                binding: 2,
                visibility: GPUShaderStage.COMPUTE,
                buffer: { type: "storage" }
            }
        ]
    })

    const bindGroups = [
        device.createBindGroup({
            label: "Cell renderer bind group A",
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: { buffer: uniformBuffer }
                },
                {
                    binding: 1,
                    resource: { buffer: cellStateStorage[0] }
                },
                {
                    binding: 2,
                    resource: { buffer: cellStateStorage[1] }
                }
            ]
        }),
        device.createBindGroup({
            label: "Cell renderer bind group B",
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: { buffer: uniformBuffer }
                },
                {
                    binding: 1,
                    resource: { buffer: cellStateStorage[1] }
                },
                {
                    binding: 2,
                    resource: { buffer: cellStateStorage[0] }
                }
            ]
        })
    ]

    const pipelineLayout = device.createPipelineLayout({
        label: "Cell Pipeline Layout",
        bindGroupLayouts: [bindGroupLayout]
    })

    const cellPipeline = device.createRenderPipeline({
        label: "Cell pipeline",
        layout: pipelineLayout,
        vertex: {
            module: cellShaderModule,
            entryPoint: "vertexMain",
            buffers: [vertexBufferLayout]
        },
        fragment: {
            module: cellShaderModule,
            entryPoint: "fragmentMain",
            targets: [{ format: canvasFormat }]
        }
    })
    const simulatePipeline = device.createComputePipeline({
        label: "Simulation pipeline",
        layout: pipelineLayout,
        compute: {
            module: simulateShaderModule,
            entryPoint: "computeMain"
        }
    })

    let step = 0
    updateGrid()

    function updateGrid() {
        const encoder = device.createCommandEncoder()

        const computePass = encoder.beginComputePass()

        computePass.setPipeline(simulatePipeline)
        computePass.setBindGroup(0, bindGroups[1])

        const workgroupCount = Math.ceil(GRID_SIZE / WORKGROUP_SIZE)
        computePass.dispatchWorkgroups(workgroupCount, workgroupCount)

        computePass.end()

        step++

        const renderPass = encoder.beginRenderPass({
            colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                loadOp: "clear",
                clearValue: [1, 1, 1, 1],
                storeOp: 'store'
            }]
        })

        renderPass.setPipeline(cellPipeline)
        renderPass.setBindGroup(0, bindGroups[0])
        renderPass.setVertexBuffer(0, vertexBuffer)
        renderPass.draw(vertices.length / 2, GRID_SIZE * GRID_SIZE)

        renderPass.end()
        device.queue.submit([encoder.finish()])

        requestAnimationFrame(updateGrid)
    }
}

init()