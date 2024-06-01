export const VertexIn = /* wgsl */ `
    struct VertexIn {
        @location(0) pos: vec2f,
        @builtin(instance_index) instance: u32
    };
`

export const VertexOut = /* wgsl */ `
    struct VertexOut {
        @builtin(position) pos: vec4f,
        @location(0) cell: vec2f,
    }
`

export const VertexInOut = /* wgsl */ `
    ${VertexIn}
    ${VertexOut}  
`

export const Uniforms = /* wgsl */ `
    @group(0) @binding(0) var<uniform> resolution: vec2f;
    @group(0) @binding(1) var<uniform> timeStep: u32;
    @group(0) @binding(2) var<uniform> grid: vec2f;
`

export const GridArrayVertexShader = /* wgsl */ `
    ${VertexInOut}
    ${Uniforms}

    @vertex
    fn vertexMain(in: VertexIn) -> VertexOut {
        let i = f32(in.instance);

        let cell = vec2f(i % grid.x, floor(i / grid.x));
        let cellOffset = cell / grid * 2;
        let gridPos = (in.pos + 1) / grid - 1 + cellOffset;

        var out: VertexOut;
        out.pos = vec4f(gridPos, 0, 1);
        out.cell = cell;
        return out;
    }
`

