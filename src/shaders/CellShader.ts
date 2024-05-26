export const CellShader = /* wgsl*/`
    struct VertexInput {
        @location(0) pos: vec2f,
        @builtin(instance_index) instace: u32,
    };

    struct VertexOutput {
        @builtin(position) pos: vec4f,
        @location(0) cell: vec2f,
        @location(1) time: f32,
    };

    @group(0) @binding(0) var<uniform> grid: vec2f;
    @group(0) @binding(1) var<storage> time: array<u32>;

    @vertex
    fn vertexMain(input: VertexInput) -> VertexOutput { 
        let i = f32(input.instace);
        let cell = vec2f(i % grid.x, floor(i / grid.x));
        let time = f32(time[input.instace]);

        let cellOffset = cell / grid * 2;
        let gridPos = (input.pos + 1) / grid - 1 + cellOffset;

        var output: VertexOutput;
        output.pos = vec4f(gridPos, 0, 1);
        output.cell = cell;
        output.time = time;
        return output;
    }

    @fragment
    fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
        var uv = 2 * input.cell / grid - 1;
        let uv0 = uv;
        let iTime = input.time / 30;
        var finalColor: vec3f;

        for(var i = 0; i < 3; i++) {
            uv = fract(1.5 * uv) - 0.5;

            var d = length(uv) * exp(-length(uv0));
            var col = palette(length(uv0) + f32(i) * 0.4 + iTime * 0.2);

            d = sin(d * 8 + iTime) / 8;
            d = abs(d);
            d = pow(0.05 / d, 1.2);

            finalColor += col * d;
        }

        return vec4f(finalColor , 1);
    }

    fn palette(t: f32) -> vec3f {
        var a = vec3f(0.5, 0.5, 0.5);
        var b = vec3f(0.5, 0.5, 0.5);
        var c = vec3f(1.0, 1.0, 1.0);
        var d = vec3f(0.263, 0.616, 0.557);

        return a * b * cos(6.28318 * (c * t + d));
    }
`